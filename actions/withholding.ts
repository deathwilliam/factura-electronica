"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    getActividadDescripcion,
} from "@/lib/catalogs";

interface WithholdingItemInput {
    description: string;
    withholdingType: string; // IVA_1, RENTA_10, RENTA_5
    subjectAmount: number;
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
    const tipoDte = "07"; // Comprobante de Retención
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${tipoDte}-${codEstable}-${codPuntoVenta}-${seq}`;
}

// Porcentajes de retención
const WITHHOLDING_RATES: Record<string, number> = {
    IVA_1: 0.01,      // 1% IVA
    RENTA_10: 0.10,   // 10% Renta (servicios)
    RENTA_5: 0.05,    // 5% Renta (otros)
};

// Códigos de tributo para retenciones
const WITHHOLDING_CODES: Record<string, string> = {
    IVA_1: "C4",      // Retención IVA
    RENTA_10: "C9",   // Retención Renta
    RENTA_5: "C9",
};

// --- Actions ---

export async function getWithholdingList(options?: {
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
        prisma.withholdingReceipt.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.withholdingReceipt.count({ where }),
    ]);

    return {
        receipts: receipts.map((r) => ({
            ...r,
            totalSubject: Number(r.totalSubject),
            ivaWithheld: Number(r.ivaWithheld),
            rentaWithheld: Number(r.rentaWithheld),
            totalWithheld: Number(r.totalWithheld),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function createWithholding(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const supplierName = formData.get("supplierName") as string;
    const supplierNit = formData.get("supplierNit") as string;
    const supplierNrc = formData.get("supplierNrc") as string;
    const supplierAddress = formData.get("supplierAddress") as string;
    const supplierDepartamento = formData.get("supplierDepartamento") as string;
    const supplierMunicipio = formData.get("supplierMunicipio") as string;
    const supplierPhone = formData.get("supplierPhone") as string;
    const supplierEmail = formData.get("supplierEmail") as string;
    const supplierCodActividad = formData.get("supplierCodActividad") as string;
    const relatedDocType = formData.get("relatedDocType") as string;
    const relatedDocNumber = formData.get("relatedDocNumber") as string;
    const relatedDocDate = formData.get("relatedDocDate") as string;
    const itemsJson = formData.get("items") as string;

    if (!supplierName || !supplierNit || !relatedDocNumber || !relatedDocDate || !itemsJson) {
        return { success: false, error: "Datos incompletos" };
    }

    let items: WithholdingItemInput[];
    try {
        items = JSON.parse(itemsJson);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    if (items.length === 0) {
        return { success: false, error: "Debe agregar al menos un concepto de retención" };
    }

    // Calcular retenciones
    let totalSubject = 0;
    let ivaWithheld = 0;
    let rentaWithheld = 0;

    const processedItems = items.map((item) => {
        const rate = WITHHOLDING_RATES[item.withholdingType] || 0;
        const withheldAmount = Number((item.subjectAmount * rate).toFixed(2));
        totalSubject += item.subjectAmount;

        if (item.withholdingType === "IVA_1") {
            ivaWithheld += withheldAmount;
        } else {
            rentaWithheld += withheldAmount;
        }

        return {
            description: item.description,
            withholdingType: item.withholdingType,
            subjectAmount: item.subjectAmount,
            withheldAmount,
        };
    });

    const totalWithheld = ivaWithheld + rentaWithheld;

    const receipt = await prisma.withholdingReceipt.create({
        data: {
            userId: session.user.id,
            supplierName,
            supplierNit,
            supplierNrc: supplierNrc || null,
            supplierAddress: supplierAddress || null,
            supplierDepartamento: supplierDepartamento || null,
            supplierMunicipio: supplierMunicipio || null,
            supplierPhone: supplierPhone || null,
            supplierEmail: supplierEmail || null,
            supplierCodActividad: supplierCodActividad || null,
            relatedDocType: relatedDocType || "03",
            relatedDocNumber,
            relatedDocDate: new Date(relatedDocDate),
            totalSubject,
            ivaWithheld,
            rentaWithheld,
            totalWithheld,
            items: {
                create: processedItems,
            },
        },
        include: { items: true },
    });

    revalidatePath("/dashboard/retenciones");
    return { success: true, receiptId: receipt.id };
}

export async function generateWithholdingDTE(receiptId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const receipt = await prisma.withholdingReceipt.findFirst({
        where: { id: receiptId, userId: session.user.id },
        include: { items: true },
    });

    if (!receipt) {
        return { success: false, error: "Comprobante no encontrado" };
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
    const count = await prisma.withholdingReceipt.count({
        where: { userId: session.user.id, controlNumber: { not: null } },
    });
    const controlNumber = generateControlNumber(count + 1, codEstable, codPuntoVenta);

    const codActividad = user.codActividad || "62010";
    const descActividad = getActividadDescripcion(codActividad) || user.giro || "Programación informática";

    // Construir cuerpo del documento
    const cuerpoDocumento = receipt.items.map((item, idx) => ({
        numItem: idx + 1,
        tipoDte: receipt.relatedDocType,
        tipoDoc: "36", // NIT
        numDocumento: receipt.relatedDocNumber,
        fechaEmision: formatDate(receipt.relatedDocDate),
        montoSujetoGrav: Number(item.subjectAmount),
        codigoRetencionMH: WITHHOLDING_CODES[item.withholdingType] || "C9",
        ivaRetenido: item.withholdingType === "IVA_1" ? Number(item.withheldAmount) : 0,
        ivaPercibido: 0,
        descripcion: item.description,
    }));

    const dteJson = {
        identificacion: {
            version: 1,
            ambiente: process.env.DTE_AMBIENTE || "00",
            tipoDte: "07", // Comprobante de Retención
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
        },
        receptor: {
            tipoDocumento: "36", // NIT
            numDocumento: receipt.supplierNit,
            nrc: receipt.supplierNrc || null,
            nombre: receipt.supplierName,
            codActividad: receipt.supplierCodActividad || null,
            descActividad: receipt.supplierCodActividad
                ? getActividadDescripcion(receipt.supplierCodActividad)
                : null,
            direccion: receipt.supplierAddress ? {
                departamento: receipt.supplierDepartamento || "06",
                municipio: receipt.supplierMunicipio || "14",
                complemento: receipt.supplierAddress,
            } : null,
            telefono: receipt.supplierPhone || null,
            correo: receipt.supplierEmail || null,
        },
        cuerpoDocumento,
        resumen: {
            totalSujetoRetencion: Number(receipt.totalSubject.toFixed(2)),
            totalIVAretenido: Number(receipt.ivaWithheld.toFixed(2)),
            totalIVAretenidoLetras: numberToLetters(Number(receipt.ivaWithheld)),
        },
        extension: null,
        apendice: null,
    };

    await prisma.withholdingReceipt.update({
        where: { id: receiptId },
        data: {
            dteJson: JSON.parse(JSON.stringify(dteJson)),
            generationCode: codigoGeneracion,
            controlNumber,
        },
    });

    revalidatePath("/dashboard/retenciones");
    return { success: true };
}

export async function getWithholdingById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const receipt = await prisma.withholdingReceipt.findFirst({
        where: { id, userId: session.user.id },
        include: { items: true },
    });

    if (!receipt) return null;

    return {
        ...receipt,
        totalSubject: Number(receipt.totalSubject),
        ivaWithheld: Number(receipt.ivaWithheld),
        rentaWithheld: Number(receipt.rentaWithheld),
        totalWithheld: Number(receipt.totalWithheld),
        items: receipt.items.map((item) => ({
            ...item,
            subjectAmount: Number(item.subjectAmount),
            withheldAmount: Number(item.withheldAmount),
        })),
    };
}
