"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
    createProductSchema,
    createProductCategorySchema,
    formatZodErrors,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ============================================
// Productos
// ============================================

export async function getProducts(options?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    categoryId?: string;
    active?: boolean;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { products: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.search) {
        where.OR = [
            { name: { contains: options.search, mode: "insensitive" } },
            { code: { contains: options.search, mode: "insensitive" } },
            { description: { contains: options.search, mode: "insensitive" } },
        ];
    }

    if (options?.type) {
        where.type = options.type;
    }

    if (options?.categoryId) {
        where.categoryId = options.categoryId;
    }

    if (options?.active !== undefined) {
        where.active = options.active;
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products: products.map((p) => ({
            ...p,
            price: Number(p.price),
            cost: p.cost ? Number(p.cost) : null,
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getProductById(productId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const product = await prisma.product.findFirst({
        where: { id: productId, userId: session.user.id },
        include: { category: true },
    });

    if (!product) return null;

    return {
        ...product,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : null,
    };
}

export async function createProduct(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const rawData = {
        code: formData.get("code"),
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        cost: formData.get("cost") || undefined,
        type: formData.get("type"),
        unit: formData.get("unit"),
        taxable: formData.get("taxable") === "true",
        active: formData.get("active") !== "false",
        categoryId: formData.get("categoryId") || null,
    };

    const parsed = createProductSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const existingCode = await prisma.product.findFirst({
        where: { userId: session.user.id, code: parsed.data.code },
    });

    if (existingCode) {
        return { success: false, error: "Ya existe un producto con ese código" };
    }

    await prisma.product.create({
        data: {
            ...parsed.data,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard/productos");
    return { success: true };
}

export async function updateProduct(
    productId: string,
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const product = await prisma.product.findFirst({
        where: { id: productId, userId: session.user.id },
    });

    if (!product) {
        return { success: false, error: "Producto no encontrado" };
    }

    const rawData = {
        code: formData.get("code"),
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        cost: formData.get("cost") || undefined,
        type: formData.get("type"),
        unit: formData.get("unit"),
        taxable: formData.get("taxable") === "true",
        active: formData.get("active") !== "false",
        categoryId: formData.get("categoryId") || null,
    };

    const parsed = createProductSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const existingCode = await prisma.product.findFirst({
        where: {
            userId: session.user.id,
            code: parsed.data.code,
            NOT: { id: productId },
        },
    });

    if (existingCode) {
        return { success: false, error: "Ya existe otro producto con ese código" };
    }

    await prisma.product.update({
        where: { id: productId },
        data: parsed.data,
    });

    revalidatePath("/dashboard/productos");
    return { success: true };
}

export async function deleteProduct(productId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const product = await prisma.product.findFirst({
        where: { id: productId, userId: session.user.id },
    });

    if (!product) {
        return { success: false, error: "Producto no encontrado" };
    }

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/dashboard/productos");
    return { success: true };
}

// ============================================
// Categorías de Productos
// ============================================

export async function getProductCategories() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    return prisma.productCategory.findMany({
        where: { userId: session.user.id },
        orderBy: { name: "asc" },
    });
}

export async function createProductCategory(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
    };

    const parsed = createProductCategorySchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    await prisma.productCategory.create({
        data: {
            ...parsed.data,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard/productos");
    return { success: true };
}

export async function deleteProductCategory(categoryId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const category = await prisma.productCategory.findFirst({
        where: { id: categoryId, userId: session.user.id },
    });

    if (!category) {
        return { success: false, error: "Categoría no encontrada" };
    }

    await prisma.product.updateMany({
        where: { categoryId },
        data: { categoryId: null },
    });

    await prisma.productCategory.delete({ where: { id: categoryId } });

    revalidatePath("/dashboard/productos");
    return { success: true };
}
