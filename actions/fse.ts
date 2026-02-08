"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    getActividadDescripcion,
    UNIDAD_UNIDAD,
    CONDICION_CONTADO,
    crearPagoResumen,
    FORMA_PAGO_EFECTIVO,
} from "@/lib/catalogs";

interface FSEItem {
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
    const tipoDte = "14"; // Factura Sujeto Excluido
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${tipoDte}-${codEstable}-${codPuntoVenta}-${seq}`;
}

// Tipos de documento del sujeto excluido
const SUBJECT_DOC_TYPES: Record<string, string> = {
    DUI: "13",
    PASAPORTE: "03",
    CARNET_RESIDENTE: "02",
    OTRO: "37",
};

// --- Actions ---

export async function getFSEList(options?: {
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
        prisma.excludedSubjectInvoice.findMany({
            where,
            include: {
                items: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.excludedSubjectInvoice.count({ where }),
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

export async function createFSE(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const subjectName = formData.get("subjectName") as string;
    const subjectDocType = formData.get("subjectDocType") as string;
    const subjectDocNumber = formData.get("subjectDocNumber") as string;
    const subjectAddress = formData.get("subjectAddress") as string;
    const subjectDepartamento = formData.get("subjectDepartamento") as string;
    const subjectMunicipio = formData.get("subjectMunicipio") as string;
    const subjectPhone = formData.get("subjectPhone") as string;
    const subjectEmail = formData.get("subjectEmail") as string;
    const subjectActivity = formData.get("subjectActivity") as string;
    const itemsJson = formData.get("items") as string;

    if (!subjectName || !subjectDocType || !subjectDocNumber || !itemsJson) {
        return { success: false, error: "Datos incompletos" };
    }

    let items: FSEItem[];
    try {
        items = JSON.parse(itemsJson);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    if (items.length === 0) {
        return { success: false, error: "Debe agregar al menos un item" };
    }

    const amount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const fse = await prisma.excludedSubjectInvoice.create({
        data: {
            userId: session.user.id,
            subjectName,
            subjectDocType,
            subjectDocNumber,
            subjectAddress: subjectAddress || null,
            subjectDepartamento: subjectDepartamento || null,
            subjectMunicipio: subjectMunicipio || null,
            subjectPhone: subjectPhone || null,
            subjectEmail: subjectEmail || null,
            subjectActivity: subjectActivity || null,
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

    revalidatePath("/dashboard/sujeto-excluido");
    return { success: true, fseId: fse.id };
}

export async function generateFSEDTE(fseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const fse = await prisma.excludedSubjectInvoice.findFirst({
        where: { id: fseId, userId: session.user.id },
        include: { items: true },
    });

    if (!fse) {
        return { success: false, error: "FSE no encontrada" };
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
    const fseCount = await prisma.excludedSubjectInvoice.count({
        where: { userId: session.user.id, controlNumber: { not: null } },
    });
    const controlNumber = generateControlNumber(fseCount + 1, codEstable, codPuntoVenta);

    // Construir cuerpo del documento
    const cuerpoDocumento = fse.items.map((item, idx) => {
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
            compra: subtotal, // FSE usa "compra" en lugar de "ventaGravada"
        };
    });

    const totalCompra = cuerpoDocumento.reduce((s, i) => s + i.compra, 0);

    const codActividad = user.codActividad || "62010";
    const descActividad = getActividadDescripcion(codActividad) || user.giro || "Programación informática";

    const dteJson = {
        identificacion: {
            version: 1,
            ambiente: process.env.DTE_AMBIENTE || "00",
            tipoDte: "14", // Factura Sujeto Excluido
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
            direccion: {
                departamento: user.departamento || "06",
                municipio: user.municipio || "14",
                complemento: user.direccion || "San Salvador",
            },
            telefono: user.telefono || "00000000",
            correo: user.email,
        },
        sujetoExcluido: {
            tipoDocumento: SUBJECT_DOC_TYPES[fse.subjectDocType] || "37",
            numDocumento: fse.subjectDocNumber,
            nombre: fse.subjectName,
            codActividad: null,
            descActividad: fse.subjectActivity || null,
            direccion: fse.subjectAddress ? {
                departamento: fse.subjectDepartamento || "06",
                municipio: fse.subjectMunicipio || "14",
                complemento: fse.subjectAddress,
            } : null,
            telefono: fse.subjectPhone || null,
            correo: fse.subjectEmail || null,
        },
        cuerpoDocumento,
        resumen: {
            totalCompra: Number(totalCompra.toFixed(2)),
            descu: 0,
            totalDescu: 0,
            subTotal: Number(totalCompra.toFixed(2)),
            ivaRete1: 0,
            reteRenta: 0,
            totalPagar: Number(totalCompra.toFixed(2)),
            totalLetras: numberToLetters(totalCompra),
            condicionOperacion: CONDICION_CONTADO,
            pagos: [crearPagoResumen(FORMA_PAGO_EFECTIVO, totalCompra)],
            observaciones: null,
        },
        apendice: null,
    };

    await prisma.excludedSubjectInvoice.update({
        where: { id: fseId },
        data: {
            dteJson: JSON.parse(JSON.stringify(dteJson)),
            generationCode: codigoGeneracion,
            controlNumber,
        },
    });

    revalidatePath("/dashboard/sujeto-excluido");
    return { success: true };
}

export async function getFSEById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const fse = await prisma.excludedSubjectInvoice.findFirst({
        where: { id, userId: session.user.id },
        include: { items: true },
    });

    if (!fse) return null;

    return {
        ...fse,
        amount: Number(fse.amount),
        items: fse.items.map((item) => ({
            ...item,
            price: Number(item.price),
        })),
    };
}
