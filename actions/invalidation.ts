"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createInvalidationSchema, formatZodErrors } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

// Códigos de motivo de anulación según MH El Salvador
const invalidationReasonsData = [
    { code: 1, label: "Anulación por solicitud del receptor/comprador" },
    { code: 2, label: "Error en información de facturación" },
    { code: 3, label: "Devolución de mercadería" },
];

export async function getInvalidationReasons() {
    return invalidationReasonsData;
}

export async function getInvalidations(options?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { invalidations: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.status = options.status;
    }

    const [invalidations, total] = await Promise.all([
        prisma.dTEInvalidation.findMany({
            where,
            include: {
                invoice: {
                    select: {
                        id: true,
                        controlNumber: true,
                        amount: true,
                        client: { select: { name: true } },
                    },
                },
            },
            orderBy: { requestedAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.dTEInvalidation.count({ where }),
    ]);

    return {
        invalidations: invalidations.map((inv) => ({
            ...inv,
            invoice: {
                ...inv.invoice,
                amount: Number(inv.invoice.amount),
            },
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function createInvalidation(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const rawData = {
        invoiceId: formData.get("invoiceId"),
        reason: formData.get("reason"),
        reasonCode: formData.get("reasonCode"),
    };

    const parsed = createInvalidationSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    // Verificar que la factura pertenece al usuario y tiene DTE transmitido
    const invoice = await prisma.invoice.findFirst({
        where: { id: parsed.data.invoiceId, userId: session.user.id },
        include: { invalidation: true, client: true, user: true },
    });

    if (!invoice) {
        return { success: false, error: "Factura no encontrada" };
    }

    if (invoice.transmissionStatus !== "SENT") {
        return {
            success: false,
            error: "Solo se pueden anular facturas transmitidas",
        };
    }

    if (invoice.invalidation) {
        return {
            success: false,
            error: "Esta factura ya tiene una solicitud de anulación",
        };
    }

    // Generar JSON de invalidación (estructura simplificada)
    const invalidationJson = {
        identificacion: {
            version: 2,
            ambiente: process.env.DTE_AMBIENTE || "00", // 00=pruebas, 01=producción
            tipoDte: "07", // Documento de Invalidación
            numeroControl: `DTE-07-${Date.now()}`,
            codigoGeneracion: crypto.randomUUID().toUpperCase(),
            fecAnula: new Date().toISOString().split("T")[0],
            horAnula: new Date().toTimeString().split(" ")[0],
        },
        emisor: {
            nit: invoice.user?.nit || "",
            nombre: invoice.user?.razonSocial || invoice.user?.name || "",
        },
        documento: {
            tipoDte: invoice.type === "CONSUMIDOR_FINAL" ? "01" : "03",
            codigoGeneracion: invoice.generationCode,
            selloRecibido: invoice.receptionSeal,
            numeroControl: invoice.controlNumber,
            fecEmi: invoice.date.toISOString().split("T")[0],
            montoIva: Number(invoice.amount) * 0.13,
            codigoGeneracionR: null, // Para documentos de reemplazo
        },
        motivo: {
            tipoAnulacion: parsed.data.reasonCode,
            motivoAnulacion: parsed.data.reason,
            nombreResponsable: session.user.name,
            tipDocResponsable: "36", // NIT
            numDocResponsable: "",
            nombreSolicita: invoice.client.name,
            tipDocSolicita: invoice.client.nit ? "36" : "13", // NIT o DUI
            numDocSolicita: invoice.client.nit || invoice.client.dui || "",
        },
    };

    // Crear registro de invalidación
    const invalidation = await prisma.dTEInvalidation.create({
        data: {
            invoiceId: parsed.data.invoiceId,
            userId: session.user.id,
            reason: parsed.data.reason,
            reasonCode: parsed.data.reasonCode,
            invalidationJson: JSON.parse(JSON.stringify(invalidationJson)),
            status: "PENDING",
        },
    });

    // Crear notificación
    await createNotification({
        userId: session.user.id,
        type: "SYSTEM",
        title: "Solicitud de anulación creada",
        message: `Se ha creado una solicitud de anulación para la factura ${invoice.controlNumber}`,
        link: `/dashboard/anulaciones`,
    });

    revalidatePath("/dashboard/anulaciones");
    return { success: true, invalidationId: invalidation.id };
}

export async function processInvalidation(invalidationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const invalidation = await prisma.dTEInvalidation.findFirst({
        where: { id: invalidationId, userId: session.user.id },
        include: { invoice: true },
    });

    if (!invalidation) {
        return { success: false, error: "Anulación no encontrada" };
    }

    if (invalidation.status !== "PENDING") {
        return { success: false, error: "Esta anulación ya fue procesada" };
    }

    // TODO: Implementar firma y transmisión al MH
    // Por ahora, simulamos el proceso

    // Actualizar estado
    await prisma.dTEInvalidation.update({
        where: { id: invalidationId },
        data: {
            status: "SENT",
            processedAt: new Date(),
            // receptionSeal se actualiza cuando MH responde
        },
    });

    // Actualizar estado de la factura
    await prisma.invoice.update({
        where: { id: invalidation.invoiceId },
        data: { transmissionStatus: "REJECTED" }, // Marcada como anulada
    });

    revalidatePath("/dashboard/anulaciones");
    return { success: true };
}

export async function getInvalidableInvoices() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const invoices = await prisma.invoice.findMany({
        where: {
            userId: session.user.id,
            transmissionStatus: "SENT",
            invalidation: null,
        },
        include: {
            client: { select: { name: true } },
        },
        orderBy: { date: "desc" },
    });

    return invoices.map((inv) => ({
        id: inv.id,
        controlNumber: inv.controlNumber,
        clientName: inv.client.name,
        amount: Number(inv.amount),
        date: inv.date,
    }));
}
