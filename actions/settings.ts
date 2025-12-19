"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("No autorizado");
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    // Fiscal Data
    const razonSocial = formData.get("razonSocial") as string;
    const nit = formData.get("nit") as string;
    const nrc = formData.get("nrc") as string;
    const giro = formData.get("giro") as string;
    const direccion = formData.get("direccion") as string;
    const telefono = formData.get("telefono") as string;

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            // @ts-ignore
            data: {
                name,
                email,
                razonSocial,
                nit,
                nrc,
                giro,
                direccion,
                telefono,
            },
        });

        revalidatePath("/dashboard/settings");
        return { success: true, message: "Ajustes actualizados correctamente" };
    } catch (error) {
        console.error("Error updating settings:", error);
        return { success: false, message: "Error al actualizar ajustes" };
    }
}
