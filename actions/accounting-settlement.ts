"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActividadDescripcion } from "@/lib/catalogs";

interface AccountingItem {
    description: string;
    amount: number;
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

    function convertGroup(n: number): string {
        if (n === 0) return "";
        if (n === 100) return "CIEN";
        let result = "";
        if (n >= 100) {
            result += unidades[Math.floor(n / 100)] + "CIENTOS ";
            n %= 100;
        }
        if (n >= 10) {
            result += decenas[Math.floor(n / 10)];
            if (n % 10 !== 0) result += " Y " + unidades[n % 10];
        } else {
            result += unidades[n];
        }
        return result.trim();
    }

    let text = entero === 0 ? "CERO" : convertGroup(entero);
    return `${text} ${centavos.toString().padStart(2, "0")}/100 DOLARES`;
}

function generateControlNumber(
    sequence: number,
    codEstable: string = "0001",
    codPuntoVenta: string = "001"
): string {
    const prefix = "DTE";
    const tipoDte = "09";
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${tipoDte}-${codEstable}-${codPuntoVenta}-${seq}`;
}

// --- Actions ---

export async function getAccountingSettlementList(options?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { documents: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.transmissionStatus = options.status;
    }

    const [documents, total] = await Promise.all([
        prisma.accountingSettlement.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.accountingSettlement.count({ where }),
    ]);

    return {
        documents: documents.map((d) => ({
            ...d,
            amount: Number(d.amount),
            taxAmount: Number(d.taxAmount),
            totalAmount: Number(d.totalAmount),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function createAccountingSettlement(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const originalEmitterNit = formData.get("originalEmitterNit") as string;
    const originalEmitterName = formData.get("originalEmitterName") as string;
    const concept = formData.get("concept") as string;
    const itemsJson = formData.get("items") as string;

    if (!originalEmitterNit || !originalEmitterName || !concept || !itemsJson) {
        return { success: false, error: "Datos incompletos" };
    }

    let items: AccountingItem[];
    try {
        items = JSON.parse(itemsJson);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    if (items.length === 0) {
        return { success: false, error: "Debe agregar al menos un item" };
    }

    const amount = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = amount * 0.13;
    const totalAmount = amount + taxAmount;

    const doc = await prisma.accountingSettlement.create({
        data: {
            userId: session.user.id,
            originalEmitterNit,
            originalEmitterName,
            concept,
            amount,
            taxAmount,
            totalAmount,
            items: {
                create: items.map((item) => ({
                    description: item.description,
                    amount: item.amount,
                })),
            },
        },
        include: { items: true },
    });

    revalidatePath("/dashboard/doc-contable");
    return { success: true, docId: doc.id };
}

export async function generateAccountingSettlementDTE(docId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const doc = await prisma.accountingSettlement.findFirst({
        where: { id: docId, userId: session.user.id },
        include: { items: true },
    });

    if (!doc) {
        return { success: false, error: "Documento no encontrado" };
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

    const count = await prisma.accountingSettlement.count({
        where: { userId: session.user.id, controlNumber: { not: null } },
    });
    const controlNumber = generateControlNumber(count + 1, codEstable, codPuntoVenta);

    const codActividad = user.codActividad || "62010";
    const descActividad = getActividadDescripcion(codActividad) || user.giro || "Programación informática";

    const cuerpoDocumento = doc.items.map((item, idx) => ({
        numItem: idx + 1,
        descripcion: item.description,
        cantidad: 1,
        valorUni: Number(item.amount),
        valorTotal: Number(item.amount),
    }));

    const dteJson = {
        identificacion: {
            version: 1,
            ambiente: process.env.DTE_AMBIENTE || "00",
            tipoDte: "09",
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
            tipoDocumento: "36",
            numDocumento: doc.originalEmitterNit,
            nombre: doc.originalEmitterName,
        },
        cuerpoDocumento,
        resumen: {
            totalOperaciones: Number(doc.amount),
            totalIVA: Number(doc.taxAmount),
            totalPagar: Number(doc.totalAmount),
            totalLetras: numberToLetters(Number(doc.totalAmount)),
            observaciones: doc.concept,
        },
        apendice: null,
    };

    await prisma.accountingSettlement.update({
        where: { id: docId },
        data: {
            dteJson: JSON.parse(JSON.stringify(dteJson)),
            generationCode: codigoGeneracion,
            controlNumber,
        },
    });

    revalidatePath("/dashboard/doc-contable");
    return { success: true };
}

export async function getAccountingSettlementById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const doc = await prisma.accountingSettlement.findFirst({
        where: { id, userId: session.user.id },
        include: { items: true },
    });

    if (!doc) return null;

    return {
        ...doc,
        amount: Number(doc.amount),
        taxAmount: Number(doc.taxAmount),
        totalAmount: Number(doc.totalAmount),
        items: doc.items.map((item) => ({
            ...item,
            amount: Number(item.amount),
        })),
    };
}
