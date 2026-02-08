import { getShippingNoteList } from "@/actions/shipping-note";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function NotasRemisionPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { notes, total, totalPages } = await getShippingNoteList({
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
                    <h2 className="text-3xl font-bold tracking-tight">Notas de Remisión</h2>
                    <p className="text-muted-foreground mt-1">
                        Traslado de mercadería sin transferencia de propiedad (DTE-04)
                    </p>
                </div>
                <Link href="/dashboard/notas-remision/new">
                    <Button>+ Nueva Nota</Button>
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Destinatario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Motivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Control</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {notes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No hay notas de remisión
                                    </td>
                                </tr>
                            ) : (
                                notes.map((note) => (
                                    <tr key={note.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm">{new Date(note.date).toLocaleDateString("es-SV")}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{note.recipientName}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-[200px]">{note.transportReason}</td>
                                        <td className="px-6 py-4 text-sm font-mono">{note.controlNumber || "-"}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[note.transmissionStatus]}`}>
                                                {note.transmissionStatus === "PENDING" ? "Pendiente" : note.transmissionStatus === "SENT" ? "Transmitido" : "Rechazado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/notas-remision/${note.id}`}>
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
                        <p className="text-sm text-muted-foreground">Mostrando {notes.length} de {total}</p>
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
