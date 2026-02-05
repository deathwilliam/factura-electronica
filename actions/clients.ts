"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createClientSchema, formatZodErrors } from "@/lib/validations";

export async function createClient(prevState: { error?: string } | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "No autorizado" };
    }
    const userId = session.user.id;

    const parsed = createClientSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") || "",
        address: formData.get("address") || "",
        razonSocial: formData.get("razonSocial") || "",
        nit: formData.get("nit") || "",
        nrc: formData.get("nrc") || "",
        dui: formData.get("dui") || "",
        giro: formData.get("giro") || "",
        tipo: formData.get("tipo") || "NATURAL",
    });

    if (!parsed.success) {
        return { error: formatZodErrors(parsed.error) };
    }

    try {
        await prisma.client.create({
            data: {
                userId,
                ...parsed.data,
            }
        });

        revalidatePath("/dashboard/clientes");
        revalidatePath("/dashboard/facturas/new");
    } catch (error) {
        console.error("Error al crear cliente:", error);
        return { error: "Error al crear el cliente. Intenta de nuevo." };
    }

    redirect("/dashboard/clientes");
}

export async function getClients() {
    const session = await auth();
    if (!session?.user?.id) return [];
    const userId = session.user.id;

    try {
        return await prisma.client.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    } catch {
        return [];
    }
}
