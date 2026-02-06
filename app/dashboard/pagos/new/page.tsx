"use client";

import { Button } from "@/components/ui/Button";
import { createPayment } from "@/actions/payments";
import { paymentMethods } from "@/lib/constants";
import { getInvoices } from "@/actions/invoices";
import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const initialState = { success: false, error: "" };

interface Invoice {
    id: string;
    controlNumber: string | null;
    amount: number;
    status: string;
    client: { name: string };
}

export default function NewPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedInvoiceId = searchParams.get("invoiceId");

    const [state, formAction, pending] = useActionState(createPayment, initialState);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        async function loadInvoices() {
            const data = await getInvoices({ limit: 100, status: "PENDING" });
            const partialData = await getInvoices({ limit: 100, status: "PARTIAL" });
            const allInvoices = [...data.invoices, ...partialData.invoices].map((inv) => ({
                id: inv.id,
                controlNumber: inv.controlNumber,
                amount: Number(inv.amount),
                status: inv.status,
                client: { name: inv.client.name },
            }));
            setInvoices(allInvoices);

            if (preselectedInvoiceId) {
                const found = allInvoices.find((i) => i.id === preselectedInvoiceId);
                if (found) setSelectedInvoice(found);
            }
        }
        loadInvoices();
    }, [preselectedInvoiceId]);

    useEffect(() => {
        if (state.success) {
            router.push("/dashboard/pagos");
        }
    }, [state.success, router]);

    const handleInvoiceChange = (invoiceId: string) => {
        const invoice = invoices.find((i) => i.id === invoiceId);
        setSelectedInvoice(invoice || null);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Registrar Pago</h2>
                <p className="text-muted-foreground">Registra un pago para una factura.</p>
            </div>

            <form action={formAction} className="space-y-4 bg-card p-6 rounded-lg border border-border">
                {state.error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {state.error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Factura *</label>
                    <select
                        name="invoiceId"
                        required
                        value={selectedInvoice?.id || ""}
                        onChange={(e) => handleInvoiceChange(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                        <option value="">Seleccionar factura</option>
                        {invoices.map((invoice) => (
                            <option key={invoice.id} value={invoice.id}>
                                {invoice.controlNumber || "Sin número"} - {invoice.client.name} - ${invoice.amount.toFixed(2)}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedInvoice && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                        <p><strong>Cliente:</strong> {selectedInvoice.client.name}</p>
                        <p><strong>Monto total:</strong> ${selectedInvoice.amount.toFixed(2)}</p>
                        <p><strong>Estado:</strong> {selectedInvoice.status === "PARTIAL" ? "Pago parcial" : "Pendiente"}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Monto a pagar *</label>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={selectedInvoice?.amount}
                        required
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Método de pago *</label>
                    <select
                        name="method"
                        required
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                        {paymentMethods.map((method) => (
                            <option key={method.value} value={method.value}>
                                {method.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Referencia</label>
                    <input
                        name="reference"
                        type="text"
                        placeholder="Número de cheque, transacción, etc."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Fecha de pago</label>
                    <input
                        name="paymentDate"
                        type="date"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Notas</label>
                    <textarea
                        name="notes"
                        rows={2}
                        placeholder="Notas adicionales (opcional)"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={pending || !selectedInvoice}>
                        {pending ? "Registrando..." : "Registrar Pago"}
                    </Button>
                    <Link href="/dashboard/pagos">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
