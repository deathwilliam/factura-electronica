"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActividadDescripcion } from "@/lib/catalogs";

interface SettlementItem {
    description: string;
    quantity: number;
    unitPrice: number;
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
    const tipoDte = "08";
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${tipoDte}-${codEstable}-${codPuntoVenta}-${seq}`;
}

// --- Actions ---

export async function getSettlementList(options?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { receipts: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.transmissionStatus = options.status;
    }

    const [receipts, total] = await Promise.all([
        prisma.settlementReceipt.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.settlementReceipt.count({ where }),
    ]);

    return {
        receipts: receipts.map((r) => ({
            ...r,
            grossAmount: Number(r.grossAmount),
            deductions: Number(r.deductions),
            commissions: Number(r.commissions),
            netAmount: Number(r.netAmount),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function createSettlement(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const providerName = formData.get("providerName") as string;
    const providerNit = formData.get("providerNit") as string;
    const providerNrc = formData.get("providerNrc") as string;
    const providerAddress = formData.get("providerAddress") as string;
    const providerDepartamento = formData.get("providerDepartamento") as string;
    const providerMunicipio = formData.get("providerMunicipio") as string;
    const providerPhone = formData.get("providerPhone") as string;
    const providerEmail = formData.get("providerEmail") as string;
    const periodStart = formData.get("periodStart") as string;
    const periodEnd = formData.get("periodEnd") as string;
    const deductions = parseFloat(formData.get("deductions") as string) || 0;
    const commissions = parseFloat(formData.get("commissions") as string) || 0;
    const itemsJson = formData.get("items") as string;

    if (!providerName || !providerNit || !periodStart || !periodEnd || !itemsJson) {
        return { success: false, error: "Datos incompletos" };
    }

    let items: SettlementItem[];
    try {
        items = JSON.parse(itemsJson);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    if (items.length === 0) {
        return { success: false, error: "Debe agregar al menos un item" };
    }

    const grossAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const netAmount = grossAmount - deductions - commissions;

    const receipt = await prisma.settlementReceipt.create({
        data: {
            userId: session.user.id,
            providerName,
            providerNit,
            providerNrc: providerNrc || null,
            providerAddress: providerAddress || null,
            providerDepartamento: providerDepartamento || null,
            providerMunicipio: providerMunicipio || null,
            providerPhone: providerPhone || null,
            providerEmail: providerEmail || null,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
            grossAmount,
            deductions,
            commissions,
            netAmount,
            items: {
                create: items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    amount: item.quantity * item.unitPrice,
                })),
            },
        },
        include: { items: true },
    });

    revalidatePath("/dashboard/liquidaciones");
    return { success: true, receiptId: receipt.id };
}

export async function generateSettlementDTE(receiptId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const receipt = await prisma.settlementReceipt.findFirst({
        where: { id: receiptId, userId: session.user.id },
        include: { items: true },
    });

    if (!receipt) {
        return { success: false, error: "Liquidación no encontrada" };
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

    const count = await prisma.settlementReceipt.count({
        where: { userId: session.user.id, controlNumber: { not: null } },
    });
    const controlNumber = generateControlNumber(count + 1, codEstable, codPuntoVenta);

    const codActividad = user.codActividad || "62010";
    const descActividad = getActividadDescripcion(codActividad) || user.giro || "Programación informática";

    const cuerpoDocumento = receipt.items.map((item, idx) => ({
        numItem: idx + 1,
        tipoDte: null,
        tipoGeneracion: null,
        numeroDocumento: null,
        fechaGeneracion: null,
        ventaGravada: Number(item.amount),
        porcentComision: Number(receipt.commissions) / Number(receipt.grossAmount) * 100,
        comision: Number(receipt.commissions) / receipt.items.length,
        descripcion: item.description,
    }));

    const dteJson = {
        identificacion: {
            version: 1,
            ambiente: process.env.DTE_AMBIENTE || "00",
            tipoDte: "08",
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
        receptor: {
            nit: receipt.providerNit,
            nrc: receipt.providerNrc || null,
            nombre: receipt.providerName,
            direccion: receipt.providerAddress ? {
                departamento: receipt.providerDepartamento || "06",
                municipio: receipt.providerMunicipio || "14",
                complemento: receipt.providerAddress,
            } : null,
            telefono: receipt.providerPhone || null,
            correo: receipt.providerEmail || null,
        },
        cuerpoDocumento,
        resumen: {
            totalGravada: Number(receipt.grossAmount),
            totalComision: Number(receipt.commissions),
            porcentajeComision: Number(receipt.commissions) / Number(receipt.grossAmount) * 100,
            ivaComision: Number(receipt.commissions) * 0.13,
            totalAPagar: Number(receipt.netAmount),
            totalLetras: numberToLetters(Number(receipt.netAmount)),
            observaciones: `Período: ${formatDate(receipt.periodStart)} a ${formatDate(receipt.periodEnd)}`,
        },
        apendice: null,
    };

    await prisma.settlementReceipt.update({
        where: { id: receiptId },
        data: {
            dteJson: JSON.parse(JSON.stringify(dteJson)),
            generationCode: codigoGeneracion,
            controlNumber,
        },
    });

    revalidatePath("/dashboard/liquidaciones");
    return { success: true };
}

export async function getSettlementById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const receipt = await prisma.settlementReceipt.findFirst({
        where: { id, userId: session.user.id },
        include: { items: true },
    });

    if (!receipt) return null;

    return {
        ...receipt,
        grossAmount: Number(receipt.grossAmount),
        deductions: Number(receipt.deductions),
        commissions: Number(receipt.commissions),
        netAmount: Number(receipt.netAmount),
        items: receipt.items.map((item) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            amount: Number(item.amount),
        })),
    };
}
