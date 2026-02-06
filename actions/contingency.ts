"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createContingencySchema, formatZodErrors } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

// Códigos de motivo de contingencia según MH El Salvador
const contingencyReasonsData = [
    { code: 1, label: "Sin conexión a internet" },
    { code: 2, label: "Servicio del MH no disponible" },
    { code: 3, label: "Falla en sistema del contribuyente" },
    { code: 4, label: "Corte de energía eléctrica" },
    { code: 5, label: "Otro (especificar)" },
];

export async function getContingencyReasons() {
    return contingencyReasonsData;
}

export async function getContingencyBatches(options?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { batches: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.status = options.status;
    }

    const [batches, total] = await Promise.all([
        prisma.contingencyBatch.findMany({
            where,
            orderBy: { startDate: "desc" },
            skip,
            take: limit,
        }),
        prisma.contingencyBatch.count({ where }),
    ]);

    return {
        batches,
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getActiveContingency() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    return prisma.contingencyBatch.findFirst({
        where: { userId: session.user.id, status: "OPEN" },
    });
}

export async function startContingency(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    // Verificar que no hay contingencia activa
    const activeContingency = await getActiveContingency();
    if (activeContingency) {
        return { success: false, error: "Ya existe una contingencia activa" };
    }

    const rawData = {
        reason: formData.get("reason"),
        reasonCode: formData.get("reasonCode"),
    };

    const parsed = createContingencySchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const batch = await prisma.contingencyBatch.create({
        data: {
            userId: session.user.id,
            startDate: new Date(),
            reason: parsed.data.reason,
            reasonCode: parsed.data.reasonCode,
            status: "OPEN",
        },
    });

    await createNotification({
        userId: session.user.id,
        type: "SYSTEM",
        title: "Modo contingencia activado",
        message: `Se ha activado el modo de contingencia. Motivo: ${parsed.data.reason}`,
        link: "/dashboard/contingencia",
    });

    revalidatePath("/dashboard/contingencia");
    revalidatePath("/dashboard/facturas");
    return { success: true, batchId: batch.id };
}

export async function endContingency() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const activeContingency = await getActiveContingency();
    if (!activeContingency) {
        return { success: false, error: "No hay contingencia activa" };
    }

    // Contar facturas en contingencia
    const invoiceCount = await prisma.invoice.count({
        where: {
            userId: session.user.id,
            transmissionStatus: "CONTINGENCY",
            contingencyBatchId: activeContingency.id,
        },
    });

    await prisma.contingencyBatch.update({
        where: { id: activeContingency.id },
        data: {
            status: "CLOSED",
            endDate: new Date(),
            invoiceCount,
        },
    });

    await createNotification({
        userId: session.user.id,
        type: "SYSTEM",
        title: "Modo contingencia finalizado",
        message: `Se ha finalizado el modo de contingencia. ${invoiceCount} facturas pendientes de transmisión.`,
        link: "/dashboard/contingencia",
    });

    revalidatePath("/dashboard/contingencia");
    return { success: true };
}

export async function transmitContingencyBatch(batchId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const batch = await prisma.contingencyBatch.findFirst({
        where: { id: batchId, userId: session.user.id },
    });

    if (!batch) {
        return { success: false, error: "Lote de contingencia no encontrado" };
    }

    if (batch.status !== "CLOSED") {
        return {
            success: false,
            error: "Solo se pueden transmitir lotes cerrados",
        };
    }

    // Obtener facturas del lote
    const invoices = await prisma.invoice.findMany({
        where: {
            userId: session.user.id,
            transmissionStatus: "CONTINGENCY",
            contingencyBatchId: batchId,
        },
    });

    if (invoices.length === 0) {
        return { success: false, error: "No hay facturas en este lote" };
    }

    // TODO: Implementar transmisión real al MH
    // Por ahora, simulamos el proceso

    // Actualizar facturas
    await prisma.invoice.updateMany({
        where: {
            userId: session.user.id,
            contingencyBatchId: batchId,
        },
        data: { transmissionStatus: "SENT" },
    });

    // Actualizar lote
    await prisma.contingencyBatch.update({
        where: { id: batchId },
        data: {
            status: "TRANSMITTED",
            transmissionDate: new Date(),
            // receptionSeal se actualiza cuando MH responde
        },
    });

    await createNotification({
        userId: session.user.id,
        type: "DTE_SENT",
        title: "Lote de contingencia transmitido",
        message: `Se han transmitido ${invoices.length} facturas del lote de contingencia.`,
        link: "/dashboard/contingencia",
    });

    revalidatePath("/dashboard/contingencia");
    revalidatePath("/dashboard/facturas");
    return { success: true, transmittedCount: invoices.length };
}

export async function getContingencyInvoices(batchId?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const where: Record<string, unknown> = {
        userId: session.user.id,
        transmissionStatus: "CONTINGENCY",
    };

    if (batchId) {
        where.contingencyBatchId = batchId;
    }

    const invoices = await prisma.invoice.findMany({
        where,
        include: { client: { select: { name: true } } },
        orderBy: { date: "desc" },
    });

    return invoices.map((inv) => ({
        ...inv,
        amount: Number(inv.amount),
    }));
}
