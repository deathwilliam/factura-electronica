import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createInvoice } from "@/actions/invoices";
import Link from "next/link";

export default function NewInvoicePage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nueva Factura</h2>
                <p className="text-muted-foreground">Completa los datos para emitir un nuevo documento.</p>
            </div>

            <form action={createInvoice} className="space-y-6 bg-card p-6 rounded-xl border border-border">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente (ID Mock)</label>
                    <Input name="clientId" placeholder="UUID del cliente" defaultValue="mock-client-id" required />
                    <p className="text-xs text-muted-foreground">En fase demo, usa cualquier ID o crea un cliente primero.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Monto Total" name="amount" type="number" step="0.01" placeholder="0.00" required />
                    <Input label="Fecha Vencimiento" name="dueDate" type="date" required />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <select name="status" className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="PENDING">Pendiente</option>
                        <option value="PAID">Pagada</option>
                        <option value="OVERDUE">Vencida</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/dashboard/facturas">
                        <Button type="button" variant="ghost">Cancelar</Button>
                    </Link>
                    <Button type="submit">Guardar Factura</Button>
                </div>
            </form>
        </div>
    );
}
