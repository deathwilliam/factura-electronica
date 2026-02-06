"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
    createBranchSchema,
    updateCompanySettingsSchema,
    formatZodErrors,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ============================================
// Sucursales / Establecimientos
// ============================================

export async function getBranches() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    return prisma.branch.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isMain: "desc" }, { name: "asc" }],
    });
}

export async function getBranchById(branchId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    return prisma.branch.findFirst({
        where: { id: branchId, userId: session.user.id },
    });
}

export async function createBranch(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const rawData = {
        name: formData.get("name"),
        code: formData.get("code"),
        posCode: formData.get("posCode"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        isMain: formData.get("isMain") === "true",
    };

    const parsed = createBranchSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    // Verificar código único
    const existingCode = await prisma.branch.findFirst({
        where: { userId: session.user.id, code: parsed.data.code },
    });

    if (existingCode) {
        return {
            success: false,
            error: "Ya existe una sucursal con ese código",
        };
    }

    // Si es principal, quitar principal de otras
    if (parsed.data.isMain) {
        await prisma.branch.updateMany({
            where: { userId: session.user.id },
            data: { isMain: false },
        });
    }

    await prisma.branch.create({
        data: {
            ...parsed.data,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard/configuracion");
    return { success: true };
}

export async function updateBranch(
    branchId: string,
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const branch = await prisma.branch.findFirst({
        where: { id: branchId, userId: session.user.id },
    });

    if (!branch) {
        return { success: false, error: "Sucursal no encontrada" };
    }

    const rawData = {
        name: formData.get("name"),
        code: formData.get("code"),
        posCode: formData.get("posCode"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        isMain: formData.get("isMain") === "true",
    };

    const parsed = createBranchSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    // Verificar código único
    const existingCode = await prisma.branch.findFirst({
        where: {
            userId: session.user.id,
            code: parsed.data.code,
            NOT: { id: branchId },
        },
    });

    if (existingCode) {
        return {
            success: false,
            error: "Ya existe otra sucursal con ese código",
        };
    }

    // Si es principal, quitar principal de otras
    if (parsed.data.isMain) {
        await prisma.branch.updateMany({
            where: { userId: session.user.id, NOT: { id: branchId } },
            data: { isMain: false },
        });
    }

    await prisma.branch.update({
        where: { id: branchId },
        data: parsed.data,
    });

    revalidatePath("/dashboard/configuracion");
    return { success: true };
}

export async function deleteBranch(branchId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const branch = await prisma.branch.findFirst({
        where: { id: branchId, userId: session.user.id },
    });

    if (!branch) {
        return { success: false, error: "Sucursal no encontrada" };
    }

    if (branch.isMain) {
        return {
            success: false,
            error: "No se puede eliminar la sucursal principal",
        };
    }

    await prisma.branch.delete({ where: { id: branchId } });

    revalidatePath("/dashboard/configuracion");
    return { success: true };
}

// ============================================
// Configuración de Empresa
// ============================================

export async function getCompanySettings() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    let settings = await prisma.companySettings.findUnique({
        where: { userId: session.user.id },
    });

    // Crear configuración por defecto si no existe
    if (!settings) {
        settings = await prisma.companySettings.create({
            data: { userId: session.user.id },
        });
    }

    return settings;
}

export async function updateCompanySettings(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const rawData = {
        logo: formData.get("logo") || null,
        invoicePrefix: formData.get("invoicePrefix"),
        quotationPrefix: formData.get("quotationPrefix"),
        invoiceNotes: formData.get("invoiceNotes"),
        quotationNotes: formData.get("quotationNotes"),
        paymentTerms: formData.get("paymentTerms"),
        emailFooter: formData.get("emailFooter"),
        primaryColor: formData.get("primaryColor"),
    };

    const parsed = updateCompanySettingsSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    await prisma.companySettings.upsert({
        where: { userId: session.user.id },
        update: parsed.data,
        create: {
            userId: session.user.id,
            ...parsed.data,
        },
    });

    revalidatePath("/dashboard/configuracion");
    return { success: true };
}
