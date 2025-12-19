"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

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

    // Manual validation
    if (!name || name.trim() === "") {
        throw new Error("Name is required");
    }
    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    try {
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
        revalidatePath("/dashboard/facturas/new");
    } catch (error) {
        console.error("Create Client Error:", error);
        throw error;
    }

    redirect("/dashboard/clientes");
}
