import { getSettlementList } from "@/actions/settlement";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function LiquidacionesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { receipts, total, totalPages } = await getSettlementList({
        page,
        status: params.status,
        limit: 10,
    });

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-700",
        SENT: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Comprobantes de Liquidación</h2>
                    <p className="text-muted-foreground mt-1">Liquidación de operaciones con terceros (DTE-08)</p>
                </div>
                <Link href="/dashboard/liquidaciones/new">
                    <Button>+ Nueva Liquidación</Button>
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Proveedor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Período</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Bruto</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Neto</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {receipts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No hay liquidaciones</td>
                                </tr>
                            ) : (
                                receipts.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm">{new Date(r.date).toLocaleDateString("es-SV")}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{r.providerName}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(r.periodStart).toLocaleDateString("es-SV")} - {new Date(r.periodEnd).toLocaleDateString("es-SV")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">${r.grossAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">${r.netAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[r.transmissionStatus]}`}>
                                                {r.transmissionStatus === "PENDING" ? "Pendiente" : r.transmissionStatus === "SENT" ? "Transmitido" : "Rechazado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/liquidaciones/${r.id}`}><Button variant="ghost" size="sm">Ver</Button></Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">Mostrando {receipts.length} de {total}</p>
                        <div className="flex gap-2">
                            {page > 1 && <Link href={`?page=${page - 1}`}><Button variant="outline" size="sm">Anterior</Button></Link>}
                            {page < totalPages && <Link href={`?page=${page + 1}`}><Button variant="outline" size="sm">Siguiente</Button></Link>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
