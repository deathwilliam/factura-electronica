
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/actions/clients";
import Link from "next/link";

export default function NewClientPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h2>
                <p className="text-muted-foreground">Registra un nuevo cliente para tus facturas.</p>
            </div>

            <form action={createClient} className="space-y-6 bg-card p-6 rounded-xl border border-border">
                <Input label="Nombre / Empresa" name="name" placeholder="Empresa S.A." required />
                <Input label="Email de Contacto" name="email" type="email" placeholder="contacto@empresa.com" required />
                <Input label="Teléfono" name="phone" placeholder="+52 555 000 0000" />
                <Input label="Dirección Fiscal" name="address" placeholder="Av. Principal 123..." />

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/dashboard/clientes">
                        <Button type="button" variant="ghost">Cancelar</Button>
                    </Link>
                    <Button type="submit">Guardar Cliente</Button>
                </div>
            </form>
        </div>
    );
}
