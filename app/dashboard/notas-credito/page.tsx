import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getCreditNotes } from "@/actions/credit-notes";

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    SENT: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    SENT: "Transmitida",
    REJECTED: "Rechazada",
};

export default async function NotasCreditoPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { creditNotes, total, totalPages } = await getCreditNotes({ page, limit: 10 });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Notas de Crédito</h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona devoluciones, descuentos y ajustes
                    </p>
                </div>
                <Link href="/dashboard/notas-credito/new">
                    <Button>+ Nueva Nota de Crédito</Button>
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">N. Control</th>
                                <th className="px-4 py-3 text-left font-medium">Factura Ref.</th>
                                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                <th className="px-4 py-3 text-left font-medium">Motivo</th>
                                <th className="px-4 py-3 text-right font-medium">Monto</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {creditNotes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        No hay notas de crédito registradas
                                    </td>
                                </tr>
                            ) : (
                                creditNotes.map((nc) => (
                                    <tr key={nc.id} className="border-b border-border hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {nc.controlNumber || "Sin DTE"}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {nc.invoice.controlNumber || "-"}
                                        </td>
                                        <td className="px-4 py-3">{nc.invoice.client.name}</td>
                                        <td className="px-4 py-3 max-w-[200px] truncate">{nc.reason}</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            ${nc.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[nc.transmissionStatus] || "bg-gray-100"}`}>
                                                {statusLabels[nc.transmissionStatus] || nc.transmissionStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(nc.date).toLocaleDateString("es-SV")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {creditNotes.length} de {total} notas de crédito
                        </p>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <Link href={`/dashboard/notas-credito?page=${page - 1}`}>
                                    <Button variant="outline" size="sm">Anterior</Button>
                                </Link>
                            )}
                            {page < totalPages && (
                                <Link href={`/dashboard/notas-credito?page=${page + 1}`}>
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
