import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getInvoices } from "@/actions/invoices";

const STATUS_LABELS: Record<string, string> = {
    PAID: "Pagado",
    PENDING: "Pendiente",
    OVERDUE: "Vencido",
};

const STATUS_STYLES: Record<string, string> = {
    PAID: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    OVERDUE: "bg-red-100 text-red-800",
};

const DTE_LABELS: Record<string, string> = {
    SENT: "Enviado",
    REJECTED: "Rechazado",
    PENDING: "Sin enviar",
    CONTINGENCY: "Contingencia",
};

export default async function InvoicesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const status = params.status || "ALL";
    const search = params.search || "";

    const { invoices, total } = await getInvoices({ page, limit: 10, status, search });
    const totalPages = Math.ceil(total / 10);

    function buildUrl(overrides: Record<string, string | number>) {
        const p = new URLSearchParams();
        if (overrides.page) p.set("page", String(overrides.page));
        else if (page > 1) p.set("page", String(page));
        if (overrides.status !== undefined) p.set("status", String(overrides.status));
        else if (status !== "ALL") p.set("status", status);
        if (overrides.search !== undefined) p.set("search", String(overrides.search));
        else if (search) p.set("search", search);
        const qs = p.toString();
        return `/dashboard/facturas${qs ? `?${qs}` : ""}`;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Facturas</h2>
                    <p className="text-muted-foreground">Gestiona tus documentos fiscales.</p>
                </div>
                <Link href="/dashboard/facturas/new">
                    <Button>+ Nueva Factura</Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <form action="/dashboard/facturas" method="GET" className="flex-1 max-w-sm">
                    <input
                        name="search"
                        type="text"
                        placeholder="Buscar por cliente o No. control..."
                        defaultValue={search}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {status !== "ALL" && <input type="hidden" name="status" value={status} />}
                </form>
                <div className="flex gap-1">
                    {["ALL", "PENDING", "PAID", "OVERDUE"].map((s) => (
                        <Link
                            key={s}
                            href={buildUrl({ status: s, page: 1 })}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                                status === s
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:bg-accent"
                            }`}
                        >
                            {s === "ALL" ? "Todos" : STATUS_LABELS[s]}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="rounded-md border border-border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Control</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">DTE</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        {search
                                            ? `No se encontraron facturas para "${search}".`
                                            : "No hay facturas registradas. Crea una para comenzar."}
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <Link
                                                href={`/dashboard/facturas/${invoice.id}`}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {invoice.controlNumber || invoice.id.slice(0, 8)}
                                            </Link>
                                        </td>
                                        <td className="p-4 align-middle">{invoice.client?.name || "—"}</td>
                                        <td className="p-4 align-middle">{new Date(invoice.date).toLocaleDateString("es-SV")}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[invoice.status] || "bg-gray-100 text-gray-800"}`}>
                                                {STATUS_LABELS[invoice.status] || invoice.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`text-xs ${invoice.transmissionStatus === "SENT" ? "text-green-600" : "text-muted-foreground"}`}>
                                                {DTE_LABELS[invoice.transmissionStatus] || invoice.transmissionStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right font-medium">${Number(invoice.amount).toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Mostrando {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} de {total}
                    </span>
                    <div className="flex gap-1">
                        {page > 1 && (
                            <Link href={buildUrl({ page: page - 1 })}>
                                <Button size="sm" variant="outline">Anterior</Button>
                            </Link>
                        )}
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const p = i + 1;
                            return (
                                <Link key={p} href={buildUrl({ page: p })}>
                                    <Button size="sm" variant={p === page ? "primary" : "outline"}>
                                        {p}
                                    </Button>
                                </Link>
                            );
                        })}
                        {page < totalPages && (
                            <Link href={buildUrl({ page: page + 1 })}>
                                <Button size="sm" variant="outline">Siguiente</Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
