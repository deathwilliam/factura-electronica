"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function createInvoice(formData: FormData) {
    // const session = await auth();
    // if (!session?.user) {
    //   throw new Error("Unauthorized");
    // }

    // MOCK USER ID for dev until Auth is fully wired
    const userId = "mock-user-id";

    const clientId = formData.get("clientId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const status = formData.get("status") as string;
    const dueDate = new Date(formData.get("dueDate") as string);

    // In a real app, validate fields here (Zod)

    await prisma.invoice.create({
        data: {
            userId, // session.user.id
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
    // const session = await auth();
    // if (!session?.user) return [];
    // const userId = session.user.id;
    const userId = "mock-user-id";

    // For demo, if no invoices exist, return empty
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
    const userId = "mock-user-id";
    try {
        return await prisma.client.findMany({ where: { userId } });
    } catch (e) {
        return [];
    }
}
