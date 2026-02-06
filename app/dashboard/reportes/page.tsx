import { Button } from "@/components/ui/Button";
import {
    getSalesReport,
    getClientsReport,
    getExpensesReport,
    getProfitReport,
} from "@/actions/reports";
import Link from "next/link";

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string; startDate?: string; endDate?: string }>;
}) {
    const params = await searchParams;
    const tab = params.tab || "ventas";

    const startDate = params.startDate ? new Date(params.startDate) : undefined;
    const endDate = params.endDate ? new Date(params.endDate) : undefined;
    const dateRange = { startDate, endDate };

    const [salesReport, clientsReport, expensesReport, profitReport] = await Promise.all([
        tab === "ventas" ? getSalesReport(dateRange) : null,
        tab === "clientes" ? getClientsReport() : null,
        tab === "gastos" ? getExpensesReport(dateRange) : null,
        tab === "utilidad" ? getProfitReport(dateRange) : null,
    ]);

    const tabs = [
        { key: "ventas", label: "Ventas" },
        { key: "clientes", label: "Clientes" },
        { key: "gastos", label: "Gastos" },
        { key: "utilidad", label: "Utilidad" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
                    <p className="text-muted-foreground">Análisis y estadísticas del negocio.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
                {tabs.map((t) => (
                    <Link
                        key={t.key}
                        href={`/dashboard/reportes?tab=${t.key}`}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                            tab === t.key
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            {/* Filtro de fechas */}
            <form className="flex gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">Desde</label>
                    <input
                        name="startDate"
                        type="date"
                        defaultValue={params.startDate}
                        className="px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Hasta</label>
                    <input
                        name="endDate"
                        type="date"
                        defaultValue={params.endDate}
                        className="px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>
                <input type="hidden" name="tab" value={tab} />
                <Button type="submit">Filtrar</Button>
            </form>

            {/* Contenido del tab */}
            {tab === "ventas" && salesReport && (
                <div className="space-y-6">
                    {/* Resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Total Facturas</p>
                            <p className="text-2xl font-bold">{salesReport.summary.totalInvoices}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Monto Total</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${salesReport.summary.totalAmount.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">IVA Débito</p>
                            <p className="text-2xl font-bold">${salesReport.summary.totalIva.toFixed(2)}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Promedio/Factura</p>
                            <p className="text-2xl font-bold">
                                ${salesReport.summary.totalInvoices > 0
                                    ? (salesReport.summary.totalAmount / salesReport.summary.totalInvoices).toFixed(2)
                                    : "0.00"}
                            </p>
                        </div>
                    </div>

                    {/* Por estado */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <h3 className="font-semibold mb-3">Por Estado</h3>
                            <div className="space-y-2">
                                {Object.entries(salesReport.summary.byStatus).map(([status, data]) => (
                                    <div key={status} className="flex justify-between text-sm">
                                        <span>{status}</span>
                                        <span>{data.count} (${data.amount.toFixed(2)})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <h3 className="font-semibold mb-3">Por Tipo</h3>
                            <div className="space-y-2">
                                {Object.entries(salesReport.summary.byType).map(([type, data]) => (
                                    <div key={type} className="flex justify-between text-sm">
                                        <span>{type === "CONSUMIDOR_FINAL" ? "Consumidor Final" : "Crédito Fiscal"}</span>
                                        <span>{data.count} (${data.amount.toFixed(2)})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tabla de facturas */}
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-2 text-left">No. Control</th>
                                    <th className="px-4 py-2 text-left">Cliente</th>
                                    <th className="px-4 py-2 text-left">Tipo</th>
                                    <th className="px-4 py-2 text-left">Fecha</th>
                                    <th className="px-4 py-2 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {salesReport.invoices.slice(0, 20).map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="px-4 py-2 font-mono">{inv.controlNumber || "-"}</td>
                                        <td className="px-4 py-2">{inv.clientName}</td>
                                        <td className="px-4 py-2">{inv.type === "CONSUMIDOR_FINAL" ? "CF" : "CCF"}</td>
                                        <td className="px-4 py-2">{new Date(inv.date).toLocaleDateString("es-SV")}</td>
                                        <td className="px-4 py-2 text-right">${inv.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === "clientes" && clientsReport && (
                <div className="space-y-6">
                    <div className="p-4 rounded-lg border border-border bg-card">
                        <p className="text-sm text-muted-foreground">Total Clientes</p>
                        <p className="text-2xl font-bold">{clientsReport.totalClients}</p>
                    </div>

                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-2 text-left">Cliente</th>
                                    <th className="px-4 py-2 text-center">Facturas</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                    <th className="px-4 py-2 text-right">Pagado</th>
                                    <th className="px-4 py-2 text-right">Pendiente</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {clientsReport.clients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="px-4 py-2 font-medium">{client.name}</td>
                                        <td className="px-4 py-2 text-center">{client.totalInvoices}</td>
                                        <td className="px-4 py-2 text-right">${client.totalAmount.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-green-600">${client.paidAmount.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-red-600">${client.pendingAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === "gastos" && expensesReport && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Total Gastos</p>
                            <p className="text-2xl font-bold text-red-600">
                                ${expensesReport.summary.totalAmount.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Deducibles</p>
                            <p className="text-2xl font-bold">
                                ${expensesReport.summary.deductibleAmount.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Registros</p>
                            <p className="text-2xl font-bold">{expensesReport.summary.totalExpenses}</p>
                        </div>
                    </div>

                    {/* Por categoría */}
                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h3 className="font-semibold mb-3">Por Categoría</h3>
                        <div className="space-y-2">
                            {Object.values(expensesReport.summary.byCategory).map((cat) => (
                                <div key={cat.name} className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        {cat.name}
                                    </span>
                                    <span className="font-medium">${cat.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {tab === "utilidad" && profitReport && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Ingresos</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${profitReport.totalIncome.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Gastos</p>
                            <p className="text-2xl font-bold text-red-600">
                                ${profitReport.totalExpenses.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Utilidad Bruta</p>
                            <p className={`text-2xl font-bold ${profitReport.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                ${profitReport.grossProfit.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm text-muted-foreground">Margen</p>
                            <p className="text-2xl font-bold">
                                {profitReport.profitMargin.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Utilidad mensual */}
                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h3 className="font-semibold mb-3">Utilidad por Mes</h3>
                        <div className="space-y-2">
                            {profitReport.monthlyProfit.map((m) => (
                                <div key={m.month} className="flex justify-between items-center text-sm">
                                    <span>{m.month}</span>
                                    <div className="flex gap-4">
                                        <span className="text-green-600">+${m.income.toFixed(2)}</span>
                                        <span className="text-red-600">-${m.expenses.toFixed(2)}</span>
                                        <span className={`font-bold ${m.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            =${m.profit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
