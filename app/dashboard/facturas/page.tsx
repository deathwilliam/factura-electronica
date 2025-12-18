import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getInvoices } from "@/actions/invoices";
import { Invoice, Client } from "@prisma/client";

type InvoiceWithClient = Invoice & { client: Client | null };

export default async function InvoicesPage() {
    const invoices = await getInvoices();

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

            <div className="rounded-md border border-border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No hay facturas registradas. Crea una para comenzar.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice: InvoiceWithClient) => (
                                    <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{invoice.id.slice(0, 8)}</td>
                                        <td className="p-4 align-middle">{invoice.client?.name || 'Cliente Genérico'}</td>
                                        <td className="p-4 align-middle">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">${Number(invoice.amount).toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
