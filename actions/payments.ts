"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentSchema, formatZodErrors } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getPayments(options?: {
    page?: number;
    limit?: number;
    invoiceId?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { payments: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.invoiceId) {
        where.invoiceId = options.invoiceId;
    }

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
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
            orderBy: { paymentDate: "desc" },
            skip,
            take: limit,
        }),
        prisma.payment.count({ where }),
    ]);

    return {
        payments: payments.map((p) => ({
            ...p,
            amount: Number(p.amount),
            invoice: {
                ...p.invoice,
                amount: Number(p.invoice.amount),
            },
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getPaymentsByInvoice(invoiceId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const payments = await prisma.payment.findMany({
        where: { invoiceId, userId: session.user.id },
        orderBy: { paymentDate: "desc" },
    });

    return payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
    }));
}

export async function createPayment(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const rawData = {
        invoiceId: formData.get("invoiceId"),
        amount: formData.get("amount"),
        method: formData.get("method"),
        reference: formData.get("reference"),
        notes: formData.get("notes"),
        paymentDate: formData.get("paymentDate") || new Date(),
    };

    const parsed = createPaymentSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    // Verificar que la factura pertenece al usuario
    const invoice = await prisma.invoice.findFirst({
        where: { id: parsed.data.invoiceId, userId: session.user.id },
        include: { payments: true },
    });

    if (!invoice) {
        return { success: false, error: "Factura no encontrada" };
    }

    // Calcular total pagado
    const totalPaid = invoice.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
    );
    const invoiceAmount = Number(invoice.amount);
    const remaining = invoiceAmount - totalPaid;

    if (parsed.data.amount > remaining) {
        return {
            success: false,
            error: `El monto excede el saldo pendiente ($${remaining.toFixed(2)})`,
        };
    }

    // Crear pago
    await prisma.payment.create({
        data: {
            invoiceId: parsed.data.invoiceId,
            userId: session.user.id,
            amount: parsed.data.amount,
            method: parsed.data.method,
            reference: parsed.data.reference || null,
            notes: parsed.data.notes || null,
            paymentDate: parsed.data.paymentDate,
        },
    });

    // Actualizar estado de la factura
    const newTotalPaid = totalPaid + parsed.data.amount;
    let newStatus = invoice.status;

    if (newTotalPaid >= invoiceAmount) {
        newStatus = "PAID";
    } else if (newTotalPaid > 0) {
        newStatus = "PARTIAL";
    }

    await prisma.invoice.update({
        where: { id: parsed.data.invoiceId },
        data: { status: newStatus },
    });

    revalidatePath("/dashboard/pagos");
    revalidatePath(`/dashboard/facturas/${parsed.data.invoiceId}`);
    return { success: true };
}

export async function deletePayment(paymentId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const payment = await prisma.payment.findFirst({
        where: { id: paymentId, userId: session.user.id },
    });

    if (!payment) {
        return { success: false, error: "Pago no encontrado" };
    }

    // Eliminar pago
    await prisma.payment.delete({ where: { id: paymentId } });

    // Recalcular estado de la factura
    const invoice = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
        include: { payments: true },
    });

    if (invoice) {
        const totalPaid = invoice.payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
        );
        const invoiceAmount = Number(invoice.amount);

        let newStatus = "PENDING";
        if (totalPaid >= invoiceAmount) {
            newStatus = "PAID";
        } else if (totalPaid > 0) {
            newStatus = "PARTIAL";
        }

        await prisma.invoice.update({
            where: { id: payment.invoiceId },
            data: { status: newStatus },
        });
    }

    revalidatePath("/dashboard/pagos");
    return { success: true };
}

// Métodos de pago para UI
const paymentMethodsData = [
    { value: "CASH", label: "Efectivo" },
    { value: "TRANSFER", label: "Transferencia" },
    { value: "CARD", label: "Tarjeta" },
    { value: "CHECK", label: "Cheque" },
    { value: "OTHER", label: "Otro" },
];

export async function getPaymentMethods() {
    return paymentMethodsData;
}
