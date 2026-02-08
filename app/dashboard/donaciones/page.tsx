import { getDonationList } from "@/actions/donation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function DonacionesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { donations, total, totalPages } = await getDonationList({
        page,
        status: params.status,
        limit: 10,
    });

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-700",
        SENT: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
    };

    const donationTypeLabels: Record<string, string> = {
        CASH: "Efectivo",
        GOODS: "Bienes",
        SERVICES: "Servicios",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Comprobantes de Donación</h2>
                    <p className="text-muted-foreground mt-1">Donaciones a entidades sin fines de lucro (DTE-15)</p>
                </div>
                <Link href="/dashboard/donaciones/new">
                    <Button>+ Nueva Donación</Button>
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Donante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Donatario</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Tipo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Valor</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {donations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No hay donaciones</td>
                                </tr>
                            ) : (
                                donations.map((d) => (
                                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm">{new Date(d.date).toLocaleDateString("es-SV")}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{d.donorName}</td>
                                        <td className="px-6 py-4 text-sm">{d.recipientName}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                                {donationTypeLabels[d.donationType] || d.donationType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">${d.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[d.transmissionStatus]}`}>
                                                {d.transmissionStatus === "PENDING" ? "Pendiente" : d.transmissionStatus === "SENT" ? "Transmitido" : "Rechazado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/donaciones/${d.id}`}><Button variant="ghost" size="sm">Ver</Button></Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">Mostrando {donations.length} de {total}</p>
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
