import { Button } from "@/components/ui/Button";
import { getClients } from "@/actions/invoices";
import { Client } from "@prisma/client";
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

            <div className="rounded-md border border-border bg-card">
                <div className="p-8 text-center text-muted-foreground">
                    {clients.length === 0 ? "No hay clientes registrados." :
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-left">
                            {clients.map((client: Client) => (
                                <div key={client.id} className="p-4 rounded-lg border border-border">
                                    <p className="font-bold">{client.name}</p>
                                    <p className="text-sm text-muted-foreground">{client.email}</p>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
