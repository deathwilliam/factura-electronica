"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
    createExpenseSchema,
    createExpenseCategorySchema,
    formatZodErrors,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ============================================
// Gastos
// ============================================

export async function getExpenses(options?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { expenses: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.categoryId) {
        where.categoryId = options.categoryId;
    }

    if (options?.startDate || options?.endDate) {
        where.date = {};
        if (options?.startDate) {
            (where.date as Record<string, Date>).gte = options.startDate;
        }
        if (options?.endDate) {
            (where.date as Record<string, Date>).lte = options.endDate;
        }
    }

    const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
            where,
            include: { category: true },
            orderBy: { date: "desc" },
            skip,
            take: limit,
        }),
        prisma.expense.count({ where }),
    ]);

    return {
        expenses: expenses.map((e) => ({
            ...e,
            amount: Number(e.amount),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getExpenseById(expenseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const expense = await prisma.expense.findFirst({
        where: { id: expenseId, userId: session.user.id },
        include: { category: true },
    });

    if (!expense) return null;

    return {
        ...expense,
        amount: Number(expense.amount),
    };
}

export async function createExpense(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const rawData = {
        description: formData.get("description"),
        amount: formData.get("amount"),
        date: formData.get("date") || new Date(),
        categoryId: formData.get("categoryId") || null,
        vendor: formData.get("vendor"),
        reference: formData.get("reference"),
        deductible: formData.get("deductible") !== "false",
    };

    const parsed = createExpenseSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    await prisma.expense.create({
        data: {
            ...parsed.data,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard/gastos");
    return { success: true };
}

export async function updateExpense(
    expenseId: string,
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const expense = await prisma.expense.findFirst({
        where: { id: expenseId, userId: session.user.id },
    });

    if (!expense) {
        return { success: false, error: "Gasto no encontrado" };
    }

    const rawData = {
        description: formData.get("description"),
        amount: formData.get("amount"),
        date: formData.get("date") || new Date(),
        categoryId: formData.get("categoryId") || null,
        vendor: formData.get("vendor"),
        reference: formData.get("reference"),
        deductible: formData.get("deductible") !== "false",
    };

    const parsed = createExpenseSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    await prisma.expense.update({
        where: { id: expenseId },
        data: parsed.data,
    });

    revalidatePath("/dashboard/gastos");
    return { success: true };
}

export async function deleteExpense(expenseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const expense = await prisma.expense.findFirst({
        where: { id: expenseId, userId: session.user.id },
    });

    if (!expense) {
        return { success: false, error: "Gasto no encontrado" };
    }

    await prisma.expense.delete({ where: { id: expenseId } });

    revalidatePath("/dashboard/gastos");
    return { success: true };
}

// ============================================
// Categorías de Gastos
// ============================================

export async function getExpenseCategories() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    return prisma.expenseCategory.findMany({
        where: { userId: session.user.id },
        orderBy: { name: "asc" },
    });
}

export async function createExpenseCategory(
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
        color: formData.get("color"),
    };

    const parsed = createExpenseCategorySchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    await prisma.expenseCategory.create({
        data: {
            ...parsed.data,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard/gastos");
    return { success: true };
}

export async function deleteExpenseCategory(categoryId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const category = await prisma.expenseCategory.findFirst({
        where: { id: categoryId, userId: session.user.id },
    });

    if (!category) {
        return { success: false, error: "Categoría no encontrada" };
    }

    await prisma.expense.updateMany({
        where: { categoryId },
        data: { categoryId: null },
    });

    await prisma.expenseCategory.delete({ where: { id: categoryId } });

    revalidatePath("/dashboard/gastos");
    return { success: true };
}

// ============================================
// Resumen de Gastos
// ============================================

export async function getExpensesSummary(startDate?: Date, endDate?: Date) {
    const session = await auth();
    if (!session?.user?.id) {
        return { total: 0, byCategory: [], byMonth: [] };
    }

    const where: Record<string, unknown> = { userId: session.user.id };

    if (startDate || endDate) {
        where.date = {};
        if (startDate) {
            (where.date as Record<string, Date>).gte = startDate;
        }
        if (endDate) {
            (where.date as Record<string, Date>).lte = endDate;
        }
    }

    const expenses = await prisma.expense.findMany({
        where,
        include: { category: true },
    });

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Por categoría
    const byCategory = expenses.reduce(
        (acc, e) => {
            const catName = e.category?.name || "Sin categoría";
            const existing = acc.find((c) => c.name === catName);
            if (existing) {
                existing.amount += Number(e.amount);
            } else {
                acc.push({
                    name: catName,
                    amount: Number(e.amount),
                    color: e.category?.color || "#6b7280",
                });
            }
            return acc;
        },
        [] as { name: string; amount: number; color: string }[]
    );

    return { total, byCategory };
}
