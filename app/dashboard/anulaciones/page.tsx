import { Button } from "@/components/ui/Button";
import { getInvalidations } from "@/actions/invalidation";
import { invalidationReasons } from "@/lib/constants";
import Link from "next/link";

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    SENT: { label: "Enviada", color: "bg-blue-100 text-blue-700" },
    ACCEPTED: { label: "Aceptada", color: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rechazada", color: "bg-red-100 text-red-700" },
};

export default async function InvalidationsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { invalidations, totalPages } = await getInvalidations({
        page,
        status: params.status,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Anulaciones DTE</h2>
                    <p className="text-muted-foreground">Gestión de invalidación de documentos tributarios.</p>
                </div>
                <Link href="/dashboard/anulaciones/new">
                    <Button>+ Nueva Anulación</Button>
                </Link>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Nota:</strong> La anulación de DTEs debe realizarse dentro del plazo establecido
                por el Ministerio de Hacienda (generalmente dentro del mismo período tributario).
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
                <Link
                    href="/dashboard/anulaciones"
                    className={`px-3 py-1 rounded-full text-sm ${!params.status ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                    Todas
                </Link>
                {Object.entries(statusLabels).map(([key, { label }]) => (
                    <Link
                        key={key}
                        href={`/dashboard/anulaciones?status=${key}`}
                        className={`px-3 py-1 rounded-full text-sm ${params.status === key ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {invalidations.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-12 text-center text-muted-foreground">
                    No hay solicitudes de anulación.
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Factura</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Motivo</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {invalidations.map((inv) => {
                                    const status = statusLabels[inv.status] || statusLabels.PENDING;
                                    const reason = invalidationReasons.find((r) => r.code === inv.reasonCode);

                                    return (
                                        <tr key={inv.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3 text-sm">
                                                {new Date(inv.requestedAt).toLocaleDateString("es-SV")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/dashboard/facturas/${inv.invoiceId}`}
                                                    className="text-primary hover:underline font-mono text-sm"
                                                >
                                                    {inv.invoice.controlNumber || "Sin número"}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {inv.invoice.client.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium">{reason?.label || "Otro"}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                    {inv.reason}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ${inv.invoice.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Link
                                    key={p}
                                    href={`/dashboard/anulaciones?page=${p}${params.status ? `&status=${params.status}` : ""}`}
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
