"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createQuotationSchema, formatZodErrors } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getQuotations(options?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { quotations: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.status = options.status;
    }

    if (options?.search) {
        where.OR = [
            { client: { name: { contains: options.search, mode: "insensitive" } } },
            { notes: { contains: options.search, mode: "insensitive" } },
        ];
    }

    const [quotations, total] = await Promise.all([
        prisma.quotation.findMany({
            where,
            include: {
                client: { select: { id: true, name: true, email: true } },
                items: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.quotation.count({ where }),
    ]);

    return {
        quotations: quotations.map((q) => ({
            ...q,
            subtotal: Number(q.subtotal),
            tax: Number(q.tax),
            total: Number(q.total),
            discount: Number(q.discount),
            items: q.items.map((i) => ({
                ...i,
                price: Number(i.price),
                discount: Number(i.discount),
            })),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getQuotationById(quotationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const quotation = await prisma.quotation.findFirst({
        where: { id: quotationId, userId: session.user.id },
        include: {
            client: true,
            items: { include: { product: true } },
        },
    });

    if (!quotation) return null;

    return {
        ...quotation,
        subtotal: Number(quotation.subtotal),
        tax: Number(quotation.tax),
        total: Number(quotation.total),
        discount: Number(quotation.discount),
        items: quotation.items.map((i) => ({
            ...i,
            price: Number(i.price),
            discount: Number(i.discount),
        })),
    };
}

export async function createQuotation(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const itemsJson = formData.get("items");
    let items = [];
    try {
        items = JSON.parse(itemsJson as string);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    const rawData = {
        clientId: formData.get("clientId"),
        validUntil: formData.get("validUntil"),
        notes: formData.get("notes"),
        discount: formData.get("discount") || 0,
        items,
    };

    const parsed = createQuotationSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    // Calcular totales
    let subtotal = 0;
    for (const item of parsed.data.items) {
        const itemTotal = item.quantity * item.price - item.discount;
        subtotal += itemTotal;
    }

    subtotal -= parsed.data.discount;
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    // Obtener siguiente número de cotización
    const lastQuotation = await prisma.quotation.findFirst({
        where: { userId: session.user.id },
        orderBy: { number: "desc" },
    });
    const nextNumber = (lastQuotation?.number || 0) + 1;

    const quotation = await prisma.quotation.create({
        data: {
            number: nextNumber,
            clientId: parsed.data.clientId,
            userId: session.user.id,
            validUntil: parsed.data.validUntil,
            notes: parsed.data.notes,
            discount: parsed.data.discount,
            subtotal,
            tax,
            total,
            items: {
                create: parsed.data.items.map((item) => ({
                    productId: item.productId || null,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    discount: item.discount,
                })),
            },
        },
    });

    revalidatePath("/dashboard/cotizaciones");
    return { success: true, quotationId: quotation.id };
}

export async function updateQuotationStatus(
    quotationId: string,
    status: string
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const quotation = await prisma.quotation.findFirst({
        where: { id: quotationId, userId: session.user.id },
    });

    if (!quotation) {
        return { success: false, error: "Cotización no encontrada" };
    }

    await prisma.quotation.update({
        where: { id: quotationId },
        data: { status },
    });

    revalidatePath("/dashboard/cotizaciones");
    return { success: true };
}

export async function convertQuotationToInvoice(quotationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const quotation = await prisma.quotation.findFirst({
        where: { id: quotationId, userId: session.user.id },
        include: { items: true },
    });

    if (!quotation) {
        return { success: false, error: "Cotización no encontrada" };
    }

    if (quotation.invoiceId) {
        return { success: false, error: "Esta cotización ya fue convertida a factura" };
    }

    // Crear factura
    const invoice = await prisma.invoice.create({
        data: {
            clientId: quotation.clientId,
            userId: session.user.id,
            amount: quotation.total,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            items: {
                create: quotation.items.map((item) => ({
                    productId: item.productId,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                })),
            },
        },
    });

    // Actualizar cotización
    await prisma.quotation.update({
        where: { id: quotationId },
        data: { status: "INVOICED", invoiceId: invoice.id },
    });

    revalidatePath("/dashboard/cotizaciones");
    revalidatePath("/dashboard/facturas");
    return { success: true, invoiceId: invoice.id };
}

export async function deleteQuotation(quotationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const quotation = await prisma.quotation.findFirst({
        where: { id: quotationId, userId: session.user.id },
    });

    if (!quotation) {
        return { success: false, error: "Cotización no encontrada" };
    }

    await prisma.quotation.delete({ where: { id: quotationId } });

    revalidatePath("/dashboard/cotizaciones");
    return { success: true };
}
