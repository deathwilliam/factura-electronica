import { Button } from "@/components/ui/Button";
import { getExpenses, getExpenseCategories, getExpensesSummary } from "@/actions/expenses";
import Link from "next/link";

export default async function ExpensesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; categoryId?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const [{ expenses, totalPages }, categories, summary] = await Promise.all([
        getExpenses({ page, categoryId: params.categoryId }),
        getExpenseCategories(),
        getExpensesSummary(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
                    <p className="text-muted-foreground">Control de gastos del negocio.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/gastos/categorias">
                        <Button variant="outline">Categorías</Button>
                    </Link>
                    <Link href="/dashboard/gastos/new">
                        <Button>+ Nuevo Gasto</Button>
                    </Link>
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="text-sm text-muted-foreground">Total Gastos</p>
                    <p className="text-2xl font-bold text-red-600">${summary.total.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="text-sm text-muted-foreground">Categorías</p>
                    <p className="text-2xl font-bold">{summary.byCategory.length}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="text-sm text-muted-foreground">Registros</p>
                    <p className="text-2xl font-bold">{expenses.length}</p>
                </div>
            </div>

            {/* Filtros por categoría */}
            <div className="flex gap-2 flex-wrap">
                <Link
                    href="/dashboard/gastos"
                    className={`px-3 py-1 rounded-full text-sm ${!params.categoryId ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                    Todas
                </Link>
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/dashboard/gastos?categoryId=${cat.id}`}
                        className={`px-3 py-1 rounded-full text-sm ${params.categoryId === cat.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>

            {expenses.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-12 text-center text-muted-foreground">
                    No hay gastos registrados. Crea uno para comenzar.
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Descripción</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Categoría</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Proveedor</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">Deducible</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Monto</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 text-sm">
                                            {new Date(expense.date).toLocaleDateString("es-SV")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{expense.description}</p>
                                            {expense.reference && (
                                                <p className="text-xs text-muted-foreground">Ref: {expense.reference}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {expense.category ? (
                                                <span
                                                    className="text-xs px-2 py-1 rounded-full"
                                                    style={{ backgroundColor: (expense.category.color || "#6b7280") + "20", color: expense.category.color || "#6b7280" }}
                                                >
                                                    {expense.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {expense.vendor || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {expense.deductible ? (
                                                <span className="text-green-600">Sí</span>
                                            ) : (
                                                <span className="text-gray-400">No</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">
                                            -${expense.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={`/dashboard/gastos/${expense.id}`}
                                                className="text-primary hover:underline text-sm"
                                            >
                                                Editar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Link
                                    key={p}
                                    href={`/dashboard/gastos?page=${p}${params.categoryId ? `&categoryId=${params.categoryId}` : ""}`}
                                    className={`px-3 py-1 rounded ${
                                        p === page
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    }`}
                                >
                                    {p}
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
