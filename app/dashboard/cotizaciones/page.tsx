import { Button } from "@/components/ui/Button";
import { getQuotations } from "@/actions/quotations";
import Link from "next/link";

const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
    SENT: { label: "Enviada", color: "bg-blue-100 text-blue-700" },
    ACCEPTED: { label: "Aceptada", color: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rechazada", color: "bg-red-100 text-red-700" },
    EXPIRED: { label: "Expirada", color: "bg-orange-100 text-orange-700" },
    INVOICED: { label: "Facturada", color: "bg-purple-100 text-purple-700" },
};

export default async function QuotationsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { quotations, totalPages } = await getQuotations({
        page,
        status: params.status,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cotizaciones</h2>
                    <p className="text-muted-foreground">Gestiona tus cotizaciones y proformas.</p>
                </div>
                <Link href="/dashboard/cotizaciones/new">
                    <Button>+ Nueva Cotización</Button>
                </Link>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
                <Link
                    href="/dashboard/cotizaciones"
                    className={`px-3 py-1 rounded-full text-sm ${!params.status ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                    Todas
                </Link>
                {Object.entries(statusLabels).map(([key, { label }]) => (
                    <Link
                        key={key}
                        href={`/dashboard/cotizaciones?status=${key}`}
                        className={`px-3 py-1 rounded-full text-sm ${params.status === key ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {quotations.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-12 text-center text-muted-foreground">
                    No hay cotizaciones. Crea una para comenzar.
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Válida hasta</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {quotations.map((quotation) => {
                                    const status = statusLabels[quotation.status] || statusLabels.DRAFT;
                                    const isExpired = new Date(quotation.validUntil) < new Date() && quotation.status === "SENT";

                                    return (
                                        <tr key={quotation.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3 font-mono">COT-{String(quotation.number).padStart(4, "0")}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{quotation.client.name}</p>
                                                <p className="text-xs text-muted-foreground">{quotation.client.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${isExpired ? "bg-orange-100 text-orange-700" : status.color}`}>
                                                    {isExpired ? "Expirada" : status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {new Date(quotation.validUntil).toLocaleDateString("es-SV")}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ${quotation.total.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center space-x-2">
                                                <Link
                                                    href={`/dashboard/cotizaciones/${quotation.id}`}
                                                    className="text-primary hover:underline text-sm"
                                                >
                                                    Ver
                                                </Link>
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
                                    href={`/dashboard/cotizaciones?page=${p}${params.status ? `&status=${params.status}` : ""}`}
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
