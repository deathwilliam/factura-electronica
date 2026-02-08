"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    getActividadDescripcion,
    UNIDAD_UNIDAD,
    CONDICION_CONTADO,
    crearPagoResumen,
    FORMA_PAGO_TRANSFERENCIA,
} from "@/lib/catalogs";

interface ExportItem {
    description: string;
    quantity: number;
    price: number;
    tipoItem: number; // 1=Bienes, 2=Servicios
}

// --- Helper Functions ---

function generateUUID(): string {
    return crypto.randomUUID().toUpperCase();
}

function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

function formatTime(date: Date): string {
    return date.toTimeString().split(" ")[0];
}

function numberToLetters(num: number): string {
    const entero = Math.floor(num);
    const centavos = Math.round((num - entero) * 100);

    const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const especiales: Record<number, string> = {
        11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    };

    function convertGroup(n: number): string {
        if (n === 0) return "";
        if (n === 100) return "CIEN";
        if (especiales[n]) return especiales[n];

        let result = "";
        if (n >= 100) {
            result += (n >= 500 && n < 600 ? "QUINIENTOS" :
                n >= 700 && n < 800 ? "SETECIENTOS" :
                    n >= 900 && n < 1000 ? "NOVECIENTOS" :
                        unidades[Math.floor(n / 100)] + "CIENTOS") + " ";
            n %= 100;
        }
        if (n >= 10 && n <= 15 && especiales[n]) {
            result += especiales[n];
        } else if (n >= 10) {
            result += decenas[Math.floor(n / 10)];
            if (n % 10 !== 0) result += " Y " + unidades[n % 10];
        } else {
            result += unidades[n];
        }
        return result.trim();
    }

    let text = "";
    if (entero === 0) {
        text = "CERO";
    } else if (entero >= 1000) {
        const miles = Math.floor(entero / 1000);
        const resto = entero % 1000;
        text = (miles === 1 ? "MIL" : convertGroup(miles) + " MIL");
        if (resto > 0) text += " " + convertGroup(resto);
    } else {
        text = convertGroup(entero);
    }

    return `${text} ${centavos.toString().padStart(2, "0")}/100 DOLARES`;
}

function generateControlNumber(
    sequence: number,
    codEstable: string = "0001",
    codPuntoVenta: string = "001"
): string {
    const prefix = "DTE";
    const tipoDte = "11"; // Factura de Exportación
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${tipoDte}-${codEstable}-${codPuntoVenta}-${seq}`;
}

// --- Actions ---

export async function getExportInvoiceList(options?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { invoices: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.transmissionStatus = options.status;
    }

    const [invoices, total] = await Promise.all([
        prisma.exportInvoice.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.exportInvoice.count({ where }),
    ]);

    return {
        invoices: invoices.map((inv) => ({
            ...inv,
            amount: Number(inv.amount),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function createExportInvoice(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const clientName = formData.get("clientName") as string;
    const clientCountry = formData.get("clientCountry") as string;
    const clientCountryName = formData.get("clientCountryName") as string;
    const clientDocNumber = formData.get("clientDocNumber") as string;
    const clientAddress = formData.get("clientAddress") as string;
    const clientPhone = formData.get("clientPhone") as string;
    const clientEmail = formData.get("clientEmail") as string;
    const exportType = formData.get("exportType") as string || "DEFINITIVE";
    const incoterm = formData.get("incoterm") as string;
    const portOfExit = formData.get("portOfExit") as string;
    const destinationCountry = formData.get("destinationCountry") as string;
    const itemsJson = formData.get("items") as string;

    if (!clientName || !clientCountry || !clientCountryName || !destinationCountry || !itemsJson) {
        return { success: false, error: "Datos incompletos" };
    }

    let items: ExportItem[];
    try {
        items = JSON.parse(itemsJson);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    if (items.length === 0) {
        return { success: false, error: "Debe agregar al menos un item" };
    }

    const amount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const exportInvoice = await prisma.exportInvoice.create({
        data: {
            userId: session.user.id,
            clientName,
            clientCountry,
            clientCountryName,
            clientDocNumber: clientDocNumber || null,
            clientAddress: clientAddress || null,
            clientPhone: clientPhone || null,
            clientEmail: clientEmail || null,
            exportType,
            incoterm: incoterm || null,
            portOfExit: portOfExit || null,
            destinationCountry,
            amount,
            items: {
                create: items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    tipoItem: item.tipoItem || 1,
                })),
            },
        },
        include: { items: true },
    });

    revalidatePath("/dashboard/exportaciones");
    return { success: true, exportId: exportInvoice.id };
}

export async function generateExportDTE(exportId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const exportInvoice = await prisma.exportInvoice.findFirst({
        where: { id: exportId, userId: session.user.id },
        include: { items: true },
    });

    if (!exportInvoice) {
        return { success: false, error: "Factura de exportación no encontrada" };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user?.nit || !user?.nrc) {
        return { success: false, error: "Complete sus datos fiscales (NIT/NRC) en Configuración" };
    }

    const now = new Date();
    const codigoGeneracion = generateUUID();

    const codEstable = "0001";
    const codPuntoVenta = "001";

    // Obtener secuencia
    const count = await prisma.exportInvoice.count({
        where: { userId: session.user.id, controlNumber: { not: null } },
    });
    const controlNumber = generateControlNumber(count + 1, codEstable, codPuntoVenta);

    const codActividad = user.codActividad || "62010";
    const descActividad = getActividadDescripcion(codActividad) || user.giro || "Programación informática";

    // Construir cuerpo del documento
    const cuerpoDocumento = exportInvoice.items.map((item, idx) => {
        const subtotal = Number(item.price) * item.quantity;
        return {
            numItem: idx + 1,
            tipoItem: item.tipoItem,
            cantidad: item.quantity,
            codigo: null,
            uniMedida: UNIDAD_UNIDAD,
            descripcion: item.description,
            precioUni: Number(item.price),
            montoDescu: 0,
            ventaGravada: 0, // Exportaciones son exentas
            ventaExenta: subtotal, // Todo va como exento
            noGravado: 0,
        };
    });

    const totalExenta = cuerpoDocumento.reduce((s, i) => s + i.ventaExenta, 0);

    const dteJson = {
        identificacion: {
            version: 1,
            ambiente: process.env.DTE_AMBIENTE || "00",
            tipoDte: "11", // Factura de Exportación
            numeroControl: controlNumber,
            codigoGeneracion,
            tipoModelo: 1,
            tipoOperacion: 1,
            fecEmi: formatDate(now),
            horEmi: formatTime(now),
            tipoMoneda: "USD",
        },
        emisor: {
            nit: user.nit,
            nrc: user.nrc,
            nombre: user.razonSocial || user.name,
            codActividad,
            descActividad,
            nombreComercial: user.razonSocial || user.name,
            tipoEstablecimiento: "01",
            direccion: {
                departamento: user.departamento || "06",
                municipio: user.municipio || "14",
                complemento: user.direccion || "San Salvador",
            },
            telefono: user.telefono || "00000000",
            correo: user.email,
            regimen: null, // Para zona franca
            recintoFiscal: null,
            tipoItemExpor: exportInvoice.exportType === "DEFINITIVE" ? 1 : 2,
        },
        receptor: {
            tipoDocumento: null, // Cliente extranjero
            numDocumento: exportInvoice.clientDocNumber || null,
            nombre: exportInvoice.clientName,
            codPais: exportInvoice.clientCountry,
            nombrePais: exportInvoice.clientCountryName,
            complemento: exportInvoice.clientAddress || null,
            telefono: exportInvoice.clientPhone || null,
            correo: exportInvoice.clientEmail || null,
        },
        otrosDocumentos: null,
        ventaTercero: null,
        cuerpoDocumento,
        resumen: {
            totalGravada: 0,
            totalExenta: Number(totalExenta.toFixed(2)),
            porcentajeDescuento: 0,
            totalDescu: 0,
            montoTotalOperacion: Number(totalExenta.toFixed(2)),
            totalNoGravado: 0,
            totalPagar: Number(totalExenta.toFixed(2)),
            totalLetras: numberToLetters(totalExenta),
            condicionOperacion: CONDICION_CONTADO,
            pagos: [crearPagoResumen(FORMA_PAGO_TRANSFERENCIA, totalExenta)],
            codIncoterms: exportInvoice.incoterm || null,
            descIncoterms: exportInvoice.incoterm ? getIncotermDesc(exportInvoice.incoterm) : null,
            flete: 0,
            seguro: 0,
            descuento: 0,
            observaciones: null,
        },
        extension: null,
        apendice: null,
    };

    await prisma.exportInvoice.update({
        where: { id: exportId },
        data: {
            dteJson: JSON.parse(JSON.stringify(dteJson)),
            generationCode: codigoGeneracion,
            controlNumber,
        },
    });

    revalidatePath("/dashboard/exportaciones");
    return { success: true };
}

export async function getExportInvoiceById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const exportInvoice = await prisma.exportInvoice.findFirst({
        where: { id, userId: session.user.id },
        include: { items: true },
    });

    if (!exportInvoice) return null;

    return {
        ...exportInvoice,
        amount: Number(exportInvoice.amount),
        items: exportInvoice.items.map((item) => ({
            ...item,
            price: Number(item.price),
        })),
    };
}

// Helper para obtener descripción de Incoterm
function getIncotermDesc(code: string): string {
    const incoterms: Record<string, string> = {
        EXW: "Ex Works",
        FCA: "Free Carrier",
        CPT: "Carriage Paid To",
        CIP: "Carriage and Insurance Paid To",
        DAP: "Delivered at Place",
        DPU: "Delivered at Place Unloaded",
        DDP: "Delivered Duty Paid",
        FAS: "Free Alongside Ship",
        FOB: "Free on Board",
        CFR: "Cost and Freight",
        CIF: "Cost, Insurance and Freight",
    };
    return incoterms[code] || code;
}
