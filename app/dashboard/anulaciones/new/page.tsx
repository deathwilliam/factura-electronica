"use client";

import { Button } from "@/components/ui/Button";
import { createInvalidation, getInvalidableInvoices } from "@/actions/invalidation";
import { invalidationReasons } from "@/lib/constants";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const initialState = { success: false, error: "" };

interface Invoice {
    id: string;
    controlNumber: string | null;
    clientName: string;
    amount: number;
    date: Date;
}

export default function NewInvalidationPage() {
    const router = useRouter();
    const [state, formAction, pending] = useActionState(createInvalidation, initialState);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        async function loadInvoices() {
            const data = await getInvalidableInvoices();
            setInvoices(data);
        }
        loadInvoices();
    }, []);

    useEffect(() => {
        if (state.success) {
            router.push("/dashboard/anulaciones");
        }
    }, [state.success, router]);

    const handleInvoiceChange = (invoiceId: string) => {
        const invoice = invoices.find((i) => i.id === invoiceId);
        setSelectedInvoice(invoice || null);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nueva Anulación</h2>
                <p className="text-muted-foreground">Solicita la anulación de un DTE transmitido.</p>
            </div>

            {/* Advertencia */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <strong>Importante:</strong> Solo se pueden anular facturas que ya fueron transmitidas
                al Ministerio de Hacienda. Este proceso es irreversible.
            </div>

            <form action={formAction} className="space-y-4 bg-card p-6 rounded-lg border border-border">
                {state.error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {state.error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Factura a anular *</label>
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
                                {invoice.controlNumber} - {invoice.clientName} - ${invoice.amount.toFixed(2)}
                            </option>
                        ))}
                    </select>
                    {invoices.length === 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            No hay facturas disponibles para anular.
                        </p>
                    )}
                </div>

                {selectedInvoice && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                        <p><strong>No. Control:</strong> {selectedInvoice.controlNumber}</p>
                        <p><strong>Cliente:</strong> {selectedInvoice.clientName}</p>
                        <p><strong>Monto:</strong> ${selectedInvoice.amount.toFixed(2)}</p>
                        <p><strong>Fecha:</strong> {new Date(selectedInvoice.date).toLocaleDateString("es-SV")}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Motivo de anulación *</label>
                    <select
                        name="reasonCode"
                        required
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                        <option value="">Seleccionar motivo</option>
                        {invalidationReasons.map((reason) => (
                            <option key={reason.code} value={reason.code}>
                                {reason.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Descripción del motivo *</label>
                    <textarea
                        name="reason"
                        rows={3}
                        required
                        minLength={10}
                        placeholder="Describe detalladamente el motivo de la anulación..."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Mínimo 10 caracteres.
                    </p>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={pending || !selectedInvoice}>
                        {pending ? "Procesando..." : "Solicitar Anulación"}
                    </Button>
                    <Link href="/dashboard/anulaciones">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
