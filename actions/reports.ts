"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface DateRange {
    startDate?: Date;
    endDate?: Date;
}

// ============================================
// Reporte de Ventas
// ============================================

export async function getSalesReport(range?: DateRange) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const where: Record<string, unknown> = { userId: session.user.id };

    if (range?.startDate || range?.endDate) {
        where.date = {};
        if (range?.startDate) {
            (where.date as Record<string, Date>).gte = range.startDate;
        }
        if (range?.endDate) {
            (where.date as Record<string, Date>).lte = range.endDate;
        }
    }

    const invoices = await prisma.invoice.findMany({
        where,
        include: {
            client: { select: { name: true } },
            items: true,
        },
        orderBy: { date: "desc" },
    });

    const summary = {
        totalInvoices: invoices.length,
        totalAmount: 0,
        totalIva: 0,
        byStatus: {} as Record<string, { count: number; amount: number }>,
        byType: {} as Record<string, { count: number; amount: number }>,
        byMonth: [] as { month: string; amount: number; count: number }[],
    };

    const monthlyData: Record<string, { amount: number; count: number }> = {};

    for (const inv of invoices) {
        const amount = Number(inv.amount);
        summary.totalAmount += amount;

        // IVA según tipo
        if (inv.type === "CREDITO_FISCAL") {
            summary.totalIva += amount * 0.13;
        } else {
            summary.totalIva += amount - amount / 1.13;
        }

        // Por estado
        if (!summary.byStatus[inv.status]) {
            summary.byStatus[inv.status] = { count: 0, amount: 0 };
        }
        summary.byStatus[inv.status].count++;
        summary.byStatus[inv.status].amount += amount;

        // Por tipo
        if (!summary.byType[inv.type]) {
            summary.byType[inv.type] = { count: 0, amount: 0 };
        }
        summary.byType[inv.type].count++;
        summary.byType[inv.type].amount += amount;

        // Por mes
        const monthKey = inv.date.toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { amount: 0, count: 0 };
        }
        monthlyData[monthKey].amount += amount;
        monthlyData[monthKey].count++;
    }

    // Convertir datos mensuales a array
    summary.byMonth = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        summary,
        invoices: invoices.map((inv) => ({
            id: inv.id,
            controlNumber: inv.controlNumber,
            clientName: inv.client.name,
            amount: Number(inv.amount),
            status: inv.status,
            type: inv.type,
            date: inv.date,
            transmissionStatus: inv.transmissionStatus,
        })),
    };
}

// ============================================
// Reporte de Clientes
// ============================================

export async function getClientsReport() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const clients = await prisma.client.findMany({
        where: { userId: session.user.id },
        include: {
            invoices: {
                select: { id: true, amount: true, status: true },
            },
        },
    });

    const report = clients.map((client) => {
        const totalInvoices = client.invoices.length;
        const totalAmount = client.invoices.reduce(
            (sum, inv) => sum + Number(inv.amount),
            0
        );
        const paidAmount = client.invoices
            .filter((inv) => inv.status === "PAID")
            .reduce((sum, inv) => sum + Number(inv.amount), 0);
        const pendingAmount = totalAmount - paidAmount;

        return {
            id: client.id,
            name: client.name,
            email: client.email,
            tipo: client.tipo,
            totalInvoices,
            totalAmount,
            paidAmount,
            pendingAmount,
        };
    });

    // Ordenar por monto total descendente
    report.sort((a, b) => b.totalAmount - a.totalAmount);

    return {
        totalClients: clients.length,
        clients: report,
    };
}

// ============================================
// Reporte de Productos más vendidos
// ============================================

export async function getProductsReport(range?: DateRange) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const where: Record<string, unknown> = { userId: session.user.id };

    if (range?.startDate || range?.endDate) {
        where.date = {};
        if (range?.startDate) {
            (where.date as Record<string, Date>).gte = range.startDate;
        }
        if (range?.endDate) {
            (where.date as Record<string, Date>).lte = range.endDate;
        }
    }

    const invoices = await prisma.invoice.findMany({
        where,
        include: {
            items: {
                include: {
                    product: { select: { id: true, name: true, code: true } },
                },
            },
        },
    });

    const productStats: Record<
        string,
        {
            productId: string | null;
            name: string;
            code: string;
            quantity: number;
            revenue: number;
        }
    > = {};

    for (const inv of invoices) {
        for (const item of inv.items) {
            const key = item.productId || item.description;
            if (!productStats[key]) {
                productStats[key] = {
                    productId: item.productId,
                    name: item.product?.name || item.description,
                    code: item.product?.code || "-",
                    quantity: 0,
                    revenue: 0,
                };
            }
            productStats[key].quantity += item.quantity;
            productStats[key].revenue += item.quantity * Number(item.price);
        }
    }

    const products = Object.values(productStats).sort(
        (a, b) => b.revenue - a.revenue
    );

    return {
        totalProducts: products.length,
        products,
    };
}

// ============================================
// Reporte de Gastos
// ============================================

export async function getExpensesReport(range?: DateRange) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const where: Record<string, unknown> = { userId: session.user.id };

    if (range?.startDate || range?.endDate) {
        where.date = {};
        if (range?.startDate) {
            (where.date as Record<string, Date>).gte = range.startDate;
        }
        if (range?.endDate) {
            (where.date as Record<string, Date>).lte = range.endDate;
        }
    }

    const expenses = await prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
    });

    const summary = {
        totalExpenses: expenses.length,
        totalAmount: 0,
        deductibleAmount: 0,
        byCategory: {} as Record<
            string,
            { name: string; amount: number; color: string }
        >,
        byMonth: [] as { month: string; amount: number }[],
    };

    const monthlyData: Record<string, number> = {};

    for (const exp of expenses) {
        const amount = Number(exp.amount);
        summary.totalAmount += amount;

        if (exp.deductible) {
            summary.deductibleAmount += amount;
        }

        // Por categoría
        const catKey = exp.categoryId || "sin-categoria";
        if (!summary.byCategory[catKey]) {
            summary.byCategory[catKey] = {
                name: exp.category?.name || "Sin categoría",
                amount: 0,
                color: exp.category?.color || "#6b7280",
            };
        }
        summary.byCategory[catKey].amount += amount;

        // Por mes
        const monthKey = exp.date.toISOString().slice(0, 7);
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += amount;
    }

    summary.byMonth = Object.entries(monthlyData)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        summary,
        expenses: expenses.map((exp) => ({
            id: exp.id,
            description: exp.description,
            amount: Number(exp.amount),
            date: exp.date,
            category: exp.category?.name || "Sin categoría",
            vendor: exp.vendor,
            deductible: exp.deductible,
        })),
    };
}

// ============================================
// Reporte de Utilidad
// ============================================

export async function getProfitReport(range?: DateRange) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const [salesReport, expensesReport] = await Promise.all([
        getSalesReport(range),
        getExpensesReport(range),
    ]);

    if (!salesReport || !expensesReport) {
        return null;
    }

    const totalIncome = salesReport.summary.totalAmount;
    const totalExpenses = expensesReport.summary.totalAmount;
    const grossProfit = totalIncome - totalExpenses;
    const profitMargin =
        totalIncome > 0 ? (grossProfit / totalIncome) * 100 : 0;

    // Combinar datos mensuales
    const allMonths = new Set([
        ...salesReport.summary.byMonth.map((m) => m.month),
        ...expensesReport.summary.byMonth.map((m) => m.month),
    ]);

    const monthlyProfit = Array.from(allMonths)
        .sort()
        .map((month) => {
            const income =
                salesReport.summary.byMonth.find((m) => m.month === month)
                    ?.amount || 0;
            const expenses =
                expensesReport.summary.byMonth.find((m) => m.month === month)
                    ?.amount || 0;
            return {
                month,
                income,
                expenses,
                profit: income - expenses,
            };
        });

    return {
        totalIncome,
        totalExpenses,
        grossProfit,
        profitMargin,
        ivaCollected: salesReport.summary.totalIva,
        monthlyProfit,
    };
}

// ============================================
// Exportar a CSV
// ============================================

export async function exportInvoicesToCSV(range?: DateRange) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const report = await getSalesReport(range);
    if (!report) return null;

    const headers = [
        "Número de Control",
        "Cliente",
        "Monto",
        "Estado",
        "Tipo",
        "Fecha",
        "Estado DTE",
    ];

    const rows = report.invoices.map((inv) => [
        inv.controlNumber || "-",
        inv.clientName,
        inv.amount.toFixed(2),
        inv.status,
        inv.type,
        inv.date.toISOString().split("T")[0],
        inv.transmissionStatus,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    return csv;
}

export async function exportExpensesToCSV(range?: DateRange) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const report = await getExpensesReport(range);
    if (!report) return null;

    const headers = [
        "Descripción",
        "Monto",
        "Fecha",
        "Categoría",
        "Proveedor",
        "Deducible",
    ];

    const rows = report.expenses.map((exp) => [
        exp.description,
        exp.amount.toFixed(2),
        exp.date.toISOString().split("T")[0],
        exp.category,
        exp.vendor || "-",
        exp.deductible ? "Sí" : "No",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    return csv;
}
