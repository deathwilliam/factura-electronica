"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    getActividadDescripcion,
    TRIBUTO_IVA,
    crearTributoResumen,
    UNIDAD_UNIDAD,
    CONDICION_CONTADO,
    crearPagoResumen,
    FORMA_PAGO_EFECTIVO,
} from "@/lib/catalogs";

interface CreditNoteItem {
    description: string;
    quantity: number;
    price: number;
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
    const tipoDte = "05"; // Nota de Crédito
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${tipoDte}-${codEstable}-${codPuntoVenta}-${seq}`;
}

// --- Actions ---

export async function getCreditNotes(options?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { creditNotes: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.transmissionStatus = options.status;
    }

    const [creditNotes, total] = await Promise.all([
        prisma.creditNote.findMany({
            where,
            include: {
                invoice: {
                    select: {
                        controlNumber: true,
                        client: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.creditNote.count({ where }),
    ]);

    return {
        creditNotes: creditNotes.map((cn) => ({
            ...cn,
            amount: Number(cn.amount),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getCreditableInvoices() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const invoices = await prisma.invoice.findMany({
        where: {
            userId: session.user.id,
            transmissionStatus: "SENT",
        },
        include: {
            client: { select: { name: true } },
        },
        orderBy: { date: "desc" },
    });

    return invoices.map((inv) => ({
        id: inv.id,
        controlNumber: inv.controlNumber,
        generationCode: inv.generationCode,
        clientName: inv.client.name,
        amount: Number(inv.amount),
        type: inv.type,
        date: inv.date,
    }));
}

export async function createCreditNote(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const invoiceId = formData.get("invoiceId") as string;
    const reason = formData.get("reason") as string;
    const reasonCode = parseInt(formData.get("reasonCode") as string);
    const itemsJson = formData.get("items") as string;

    if (!invoiceId || !reason || !reasonCode || !itemsJson) {
        return { success: false, error: "Datos incompletos" };
    }

    let items: CreditNoteItem[];
    try {
        items = JSON.parse(itemsJson);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    if (items.length === 0) {
        return { success: false, error: "Debe agregar al menos un item" };
    }

    // Verificar factura
    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, userId: session.user.id },
        include: { client: true, user: true },
    });

    if (!invoice) {
        return { success: false, error: "Factura no encontrada" };
    }

    if (invoice.transmissionStatus !== "SENT") {
        return { success: false, error: "Solo se pueden crear notas de crédito para facturas transmitidas" };
    }

    const amount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Crear nota de crédito
    const creditNote = await prisma.creditNote.create({
        data: {
            invoiceId,
            userId: session.user.id,
            clientId: invoice.clientId,
            amount,
            reason,
            reasonCode,
            type: invoice.type,
            items: {
                create: items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                })),
            },
        },
        include: { items: true },
    });

    revalidatePath("/dashboard/notas-credito");
    return { success: true, creditNoteId: creditNote.id };
}

export async function generateCreditNoteDTE(creditNoteId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const creditNote = await prisma.creditNote.findFirst({
        where: { id: creditNoteId, userId: session.user.id },
        include: {
            items: true,
            invoice: {
                include: {
                    client: true,
                    user: true,
                },
            },
        },
    });

    if (!creditNote) {
        return { success: false, error: "Nota de crédito no encontrada" };
    }

    const invoice = creditNote.invoice;
    const user = invoice.user;
    const client = invoice.client;

    if (!user.nit || !user.nrc) {
        return { success: false, error: "Complete sus datos fiscales (NIT/NRC) en Configuración" };
    }

    const now = new Date();
    const codigoGeneracion = generateUUID();
    const isCCF = creditNote.type === "CREDITO_FISCAL";

    // Códigos de establecimiento
    const codEstable = "0001";
    const codPuntoVenta = "001";

    // Obtener secuencia
    const ncCount = await prisma.creditNote.count({
        where: { userId: session.user.id, controlNumber: { not: null } },
    });
    const controlNumber = generateControlNumber(ncCount + 1, codEstable, codPuntoVenta);

    // Construir cuerpo del documento
    const cuerpoDocumento = creditNote.items.map((item, idx) => {
        const subtotal = Number(item.price) * item.quantity;
        const ivaItem = isCCF ? Number((subtotal * 0.13).toFixed(2)) : 0;

        return {
            numItem: idx + 1,
            tipoItem: 2,
            cantidad: item.quantity,
            codigo: null,
            uniMedida: UNIDAD_UNIDAD,
            descripcion: item.description,
            precioUni: Number(item.price),
            montoDescu: 0,
            ventaNoSuj: 0,
            ventaExenta: 0,
            ventaGravada: subtotal,
            tributos: isCCF ? [TRIBUTO_IVA] : null,
            ivaItem,
        };
    });

    const totalGravada = cuerpoDocumento.reduce((s, i) => s + i.ventaGravada, 0);
    const totalIva = cuerpoDocumento.reduce((s, i) => s + i.ivaItem, 0);
    const montoTotal = isCCF ? totalGravada + totalIva : totalGravada;

    const codActividad = user.codActividad || "62010";
    const descActividad = getActividadDescripcion(codActividad) || user.giro || "Programación informática";

    const dteJson = {
        identificacion: {
            version: isCCF ? 3 : 1,
            ambiente: process.env.DTE_AMBIENTE || "00",
            tipoDte: "05", // Nota de Crédito
            numeroControl: controlNumber,
            codigoGeneracion,
            tipoModelo: 1,
            tipoOperacion: 1,
            fecEmi: formatDate(now),
            horEmi: formatTime(now),
            tipoMoneda: "USD",
        },
        documentoRelacionado: [{
            tipoDocumento: invoice.type === "CREDITO_FISCAL" ? "03" : "01",
            tipoGeneracion: 1,
            numeroDocumento: invoice.controlNumber,
            fechaEmision: formatDate(invoice.date),
        }],
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
        },
        receptor: {
            tipoDocumento: client.nit ? "36" : "13",
            numDocumento: client.nit || client.dui || "00000000-0",
            nrc: client.nrc || null,
            nombre: client.razonSocial || client.name,
            codActividad: client.codActividad || null,
            descActividad: client.codActividad ? getActividadDescripcion(client.codActividad) : null,
            direccion: client.address ? {
                departamento: client.departamento || "06",
                municipio: client.municipio || "14",
                complemento: client.address,
            } : null,
            telefono: client.phone || null,
            correo: client.email,
        },
        ventaTercero: null,
        cuerpoDocumento,
        resumen: {
            totalNoSuj: 0,
            totalExenta: 0,
            totalGravada: Number(totalGravada.toFixed(2)),
            subTotalVentas: Number(totalGravada.toFixed(2)),
            descuNoSuj: 0,
            descuExenta: 0,
            descuGravada: 0,
            totalDescu: 0,
            tributos: isCCF ? [crearTributoResumen(TRIBUTO_IVA, totalIva)] : null,
            subTotal: Number(totalGravada.toFixed(2)),
            ivaPerci1: 0,
            ivaRete1: 0,
            reteRenta: 0,
            montoTotalOperacion: Number(montoTotal.toFixed(2)),
            totalNoGravado: 0,
            totalPagar: Number(montoTotal.toFixed(2)),
            totalLetras: numberToLetters(montoTotal),
            condicionOperacion: CONDICION_CONTADO,
            pagos: [crearPagoResumen(FORMA_PAGO_EFECTIVO, montoTotal)],
        },
        extension: null,
        apendice: null,
    };

    await prisma.creditNote.update({
        where: { id: creditNoteId },
        data: {
            dteJson: JSON.parse(JSON.stringify(dteJson)),
            generationCode: codigoGeneracion,
            controlNumber,
        },
    });

    revalidatePath("/dashboard/notas-credito");
    return { success: true };
}

export async function getCreditNoteById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const creditNote = await prisma.creditNote.findFirst({
        where: { id, userId: session.user.id },
        include: {
            items: true,
            invoice: {
                include: {
                    client: { select: { name: true, email: true } },
                },
            },
        },
    });

    if (!creditNote) return null;

    return {
        ...creditNote,
        amount: Number(creditNote.amount),
        items: creditNote.items.map((item) => ({
            ...item,
            price: Number(item.price),
        })),
    };
}
