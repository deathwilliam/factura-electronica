"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function createInvoice(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    const clientId = formData.get("clientId") as string;
    const amountStr = formData.get("amount") as string;
    const status = formData.get("status") as string;
    const dueDateStr = formData.get("dueDate") as string;

    // Manual Validation
    if (!clientId) throw new Error("Client is required");
    if (!amountStr) throw new Error("Amount is required");
    if (!dueDateStr) throw new Error("Due date is required");

    const amount = parseFloat(amountStr);
    const dueDate = new Date(dueDateStr);

    await prisma.invoice.create({
        data: {
            userId,
            clientId,
            amount,
            status: status || "PENDING",
            dueDate,
            date: new Date(),
        },
    });

    revalidatePath("/dashboard/facturas");
    redirect("/dashboard/facturas");
}

export async function getInvoices() {
    const session = await auth();
    if (!session?.user?.id) return [];
    const userId = session.user.id;

    try {
        const invoices = await prisma.invoice.findMany({
            where: { userId },
            include: { client: true },
            orderBy: { date: 'desc' }
        });
        return invoices;
    } catch {
        return [];
    }
}

export async function getClients() {
    const session = await auth();
    if (!session?.user?.id) return [];
    const userId = session.user.id;

    try {
        return await prisma.client.findMany({ where: { userId } });
    } catch (e) {
        return [];
    }
}
