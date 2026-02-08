import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getDebitNotes } from "@/actions/debit-notes";

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

export default async function NotasDebitoPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { debitNotes, total, totalPages } = await getDebitNotes({ page, limit: 10 });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Notas de Débito</h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona cargos adicionales e intereses
                    </p>
                </div>
                <Link href="/dashboard/notas-debito/new">
                    <Button>+ Nueva Nota de Débito</Button>
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
                            {debitNotes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        No hay notas de débito registradas
                                    </td>
                                </tr>
                            ) : (
                                debitNotes.map((nd) => (
                                    <tr key={nd.id} className="border-b border-border hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {nd.controlNumber || "Sin DTE"}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {nd.invoice.controlNumber || "-"}
                                        </td>
                                        <td className="px-4 py-3">{nd.invoice.client.name}</td>
                                        <td className="px-4 py-3 max-w-[200px] truncate">{nd.reason}</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            ${nd.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[nd.transmissionStatus] || "bg-gray-100"}`}>
                                                {statusLabels[nd.transmissionStatus] || nd.transmissionStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(nd.date).toLocaleDateString("es-SV")}
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
                            Mostrando {debitNotes.length} de {total} notas de débito
                        </p>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <Link href={`/dashboard/notas-debito?page=${page - 1}`}>
                                    <Button variant="outline" size="sm">Anterior</Button>
                                </Link>
                            )}
                            {page < totalPages && (
                                <Link href={`/dashboard/notas-debito?page=${page + 1}`}>
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
