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
    const amount = parseFloat(formData.get("amount") as string);
    const status = formData.get("status") as string;
    const dueDate = new Date(formData.get("dueDate") as string);

    // In a real app, validate fields here (Zod)

    await prisma.invoice.create({
        data: {
            userId,
            clientId,
            amount,
            status,
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
    } catch (error) {
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
    try {
        return await prisma.client.findMany({ where: { userId } });
    } catch (e) {
        return [];
    }
}

export async function createClient(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    await prisma.client.create({
        data: {
            userId,
            name,
            email,
            phone,
            address
        }
    });

    revalidatePath("/dashboard/clientes");
    redirect("/dashboard/clientes");
}
