import { Button } from "@/components/ui/Button";
import { getClients } from "@/actions/clients";
import Link from "next/link";

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-muted-foreground">Directorio de clientes y contactos.</p>
                </div>
                <Link href="/dashboard/clientes/new">
                    <Button>+ Nuevo Cliente</Button>
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-12 text-center text-muted-foreground">
                    No hay clientes registrados. Crea uno para comenzar.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <div key={client.id} className="p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-foreground">{client.name}</p>
                                    {client.razonSocial && (
                                        <p className="text-xs text-muted-foreground">{client.razonSocial}</p>
                                    )}
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    client.tipo === "JURIDICO"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}>
                                    {client.tipo === "JURIDICO" ? "Jurídico" : "Natural"}
                                </span>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>{client.email}</p>
                                {client.phone && <p>{client.phone}</p>}
                                {client.nit && <p>NIT: {client.nit}</p>}
                                {client.dui && <p>DUI: {client.dui}</p>}
                                {client.address && (
                                    <p className="text-xs truncate">{client.address}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
