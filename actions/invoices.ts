"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createInvoiceSchema, formatZodErrors } from "@/lib/validations";

export async function createInvoice(prevState: { error?: string } | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "No autorizado" };
    }
    const userId = session.user.id;

    // Parsear items del formulario
    const itemDescriptions = formData.getAll("item_description");
    const itemQuantities = formData.getAll("item_quantity");
    const itemPrices = formData.getAll("item_price");

    const items = itemDescriptions.map((desc, i) => ({
        description: desc as string,
        quantity: Number(itemQuantities[i]) || 1,
        price: Number(itemPrices[i]) || 0,
    }));

    const parsed = createInvoiceSchema.safeParse({
        clientId: formData.get("clientId"),
        status: formData.get("status") || "PENDING",
        type: formData.get("type") || "CONSUMIDOR_FINAL",
        dueDate: formData.get("dueDate"),
        items,
    });

    if (!parsed.success) {
        return { error: formatZodErrors(parsed.error) };
    }

    const { clientId, status, type, dueDate, items: validatedItems } = parsed.data;

    // Verificar que el cliente pertenece al usuario
    const client = await prisma.client.findFirst({
        where: { id: clientId, userId },
    });
    if (!client) {
        return { error: "Cliente no encontrado" };
    }

    // Calcular monto total
    const amount = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
        await prisma.invoice.create({
            data: {
                userId,
                clientId,
                amount,
                status,
                type,
                dueDate,
                date: new Date(),
                items: {
                    create: validatedItems.map((item) => ({
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
        });

        revalidatePath("/dashboard/facturas");
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Error al crear factura:", error);
        return { error: "Error al crear la factura. Intenta de nuevo." };
    }

    redirect("/dashboard/facturas");
}

export async function getInvoices(options?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { invoices: [], total: 0 };
    const userId = session.user.id;

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (options?.status && options.status !== "ALL") {
        where.status = options.status;
    }

    if (options?.search) {
        where.OR = [
            { client: { name: { contains: options.search, mode: "insensitive" } } },
            { controlNumber: { contains: options.search, mode: "insensitive" } },
        ];
    }

    try {
        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: { client: true, items: true },
                orderBy: { date: "desc" },
                skip,
                take: limit,
            }),
            prisma.invoice.count({ where }),
        ]);
        return { invoices, total };
    } catch {
        return { invoices: [], total: 0 };
    }
}

export async function getInvoiceById(invoiceId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, userId: session.user.id },
        include: { client: true, items: true, user: true },
    });

    return invoice;
}
