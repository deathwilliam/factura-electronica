import { Button } from "@/components/ui/Button";
import { getPayments } from "@/actions/payments";
import { paymentMethods } from "@/lib/constants";
import Link from "next/link";

export default async function PaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { payments, totalPages, total } = await getPayments({ page });

    const methodLabels: Record<string, string> = {
        CASH: "Efectivo",
        TRANSFER: "Transferencia",
        CARD: "Tarjeta",
        CHECK: "Cheque",
        OTHER: "Otro",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pagos</h2>
                    <p className="text-muted-foreground">Historial de pagos recibidos.</p>
                </div>
                <Link href="/dashboard/pagos/new">
                    <Button>+ Registrar Pago</Button>
                </Link>
            </div>

            {payments.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-12 text-center text-muted-foreground">
                    No hay pagos registrados.
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
                                    <th className="px-4 py-3 text-left text-sm font-medium">Método</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Referencia</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 text-sm">
                                            {new Date(payment.paymentDate).toLocaleDateString("es-SV")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/dashboard/facturas/${payment.invoiceId}`}
                                                className="text-primary hover:underline font-mono text-sm"
                                            >
                                                {payment.invoice.controlNumber || "Sin número"}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {payment.invoice.client.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 rounded-full bg-muted">
                                                {methodLabels[payment.method] || payment.method}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {payment.reference || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-green-600">
                                            +${payment.amount.toFixed(2)}
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
                                    href={`/dashboard/pagos?page=${p}`}
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
