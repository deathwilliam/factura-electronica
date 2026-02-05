"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateSettingsSchema, formatZodErrors } from "@/lib/validations";

export async function updateSettings(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "No autorizado" };
    }

    const parsed = updateSettingsSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        razonSocial: formData.get("razonSocial") || "",
        nit: formData.get("nit") || "",
        nrc: formData.get("nrc") || "",
        giro: formData.get("giro") || "",
        direccion: formData.get("direccion") || "",
        telefono: formData.get("telefono") || "",
    });

    if (!parsed.success) {
        return { success: false, message: formatZodErrors(parsed.error) };
    }

    // Verificar que el email no esté en uso por otro usuario
    if (parsed.data.email !== session.user.email) {
        const existing = await prisma.user.findUnique({
            where: { email: parsed.data.email },
        });
        if (existing && existing.id !== session.user.id) {
            return { success: false, message: "Este email ya está en uso por otro usuario." };
        }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: parsed.data,
        });

        revalidatePath("/dashboard/settings");
        return { success: true, message: "Ajustes actualizados correctamente" };
    } catch (error) {
        console.error("Error al actualizar ajustes:", error);
        return { success: false, message: "Error al actualizar ajustes" };
    }
}
