import { getAccountingSettlementList } from "@/actions/accounting-settlement";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function DocContablePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { documents, total, totalPages } = await getAccountingSettlementList({
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
                    <h2 className="text-3xl font-bold tracking-tight">Documentos Contables de Liquidación</h2>
                    <p className="text-muted-foreground mt-1">Documentos contables asociados a liquidaciones (DTE-09)</p>
                </div>
                <Link href="/dashboard/doc-contable/new">
                    <Button>+ Nuevo Documento</Button>
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Emisor Original</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Concepto</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {documents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No hay documentos contables</td>
                                </tr>
                            ) : (
                                documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm">{new Date(doc.date).toLocaleDateString("es-SV")}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{doc.originalEmitterName}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-[200px]">{doc.concept}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">${doc.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[doc.transmissionStatus]}`}>
                                                {doc.transmissionStatus === "PENDING" ? "Pendiente" : doc.transmissionStatus === "SENT" ? "Transmitido" : "Rechazado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/doc-contable/${doc.id}`}><Button variant="ghost" size="sm">Ver</Button></Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">Mostrando {documents.length} de {total}</p>
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
