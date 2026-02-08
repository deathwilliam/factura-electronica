import { getWithholdingList } from "@/actions/withholding";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function RetencionesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { receipts, total, totalPages } = await getWithholdingList({
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
                    <h2 className="text-3xl font-bold tracking-tight">Comprobantes de Retención</h2>
                    <p className="text-muted-foreground mt-1">
                        Retenciones IVA y Renta a proveedores (DTE-07)
                    </p>
                </div>
                <Link href="/dashboard/retenciones/new">
                    <Button>+ Nueva Retención</Button>
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    Proveedor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    NIT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    Control
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                                    IVA Ret.
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                                    Renta Ret.
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                                    Total Ret.
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {receipts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                                        No hay comprobantes de retención
                                    </td>
                                </tr>
                            ) : (
                                receipts.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm">
                                            {new Date(r.date).toLocaleDateString("es-SV")}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {r.supplierName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {r.supplierNit}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono">
                                            {r.controlNumber || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            ${r.ivaWithheld.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            ${r.rentaWithheld.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">
                                            ${r.totalWithheld.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[r.transmissionStatus]}`}>
                                                {r.transmissionStatus === "PENDING" ? "Pendiente" :
                                                    r.transmissionStatus === "SENT" ? "Transmitido" : "Rechazado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/retenciones/${r.id}`}>
                                                <Button variant="ghost" size="sm">Ver</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {receipts.length} de {total} registros
                        </p>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <Link href={`?page=${page - 1}`}>
                                    <Button variant="outline" size="sm">Anterior</Button>
                                </Link>
                            )}
                            {page < totalPages && (
                                <Link href={`?page=${page + 1}`}>
                                    <Button variant="outline" size="sm">Siguiente</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
