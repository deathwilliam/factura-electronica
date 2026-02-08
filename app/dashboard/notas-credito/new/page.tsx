"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createCreditNote, getCreditableInvoices } from "@/actions/credit-notes";
import { creditNoteReasons } from "@/lib/constants";

interface Invoice {
    id: string;
    controlNumber: string | null;
    clientName: string;
    amount: number;
    type: string;
    date: Date;
}

interface Item {
    description: string;
    quantity: number;
    price: number;
}

export default function NuevaNotaCreditoPage() {
    const [state, formAction, isPending] = useActionState(createCreditNote, null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, price: 0 }]);

    useEffect(() => {
        getCreditableInvoices().then(setInvoices);
    }, []);

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof Item, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Nueva Nota de Crédito</h2>
                    <p className="text-muted-foreground mt-1">
                        Crea una nota de crédito para devoluciones o ajustes
                    </p>
                </div>
                <Link href="/dashboard/notas-credito">
                    <Button variant="outline">Cancelar</Button>
                </Link>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Factura de Referencia</h3>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Seleccionar Factura *
                        </label>
                        <select
                            name="invoiceId"
                            required
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            onChange={(e) => {
                                const inv = invoices.find((i) => i.id === e.target.value);
                                setSelectedInvoice(inv || null);
                            }}
                        >
                            <option value="">-- Seleccione una factura --</option>
                            {invoices.map((inv) => (
                                <option key={inv.id} value={inv.id}>
                                    {inv.controlNumber || "Sin DTE"} - {inv.clientName} - ${inv.amount.toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedInvoice && (
                        <div className="p-4 bg-muted/50 rounded-lg text-sm">
                            <p><strong>Cliente:</strong> {selectedInvoice.clientName}</p>
                            <p><strong>Monto Original:</strong> ${selectedInvoice.amount.toFixed(2)}</p>
                            <p><strong>Tipo:</strong> {selectedInvoice.type === "CREDITO_FISCAL" ? "Crédito Fiscal" : "Consumidor Final"}</p>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Motivo de la Nota de Crédito</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tipo de Motivo *
                            </label>
                            <select
                                name="reasonCode"
                                required
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            >
                                {creditNoteReasons.map((r) => (
                                    <option key={r.code} value={r.code}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Input
                                label="Descripción del Motivo *"
                                name="reason"
                                required
                                placeholder="Describa el motivo de la nota de crédito"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Items</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            + Agregar Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-12 items-end">
                                <div className="md:col-span-6">
                                    <Input
                                        label={index === 0 ? "Descripción" : undefined}
                                        placeholder="Descripción del item"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label={index === 0 ? "Cantidad" : undefined}
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label={index === 0 ? "Precio" : undefined}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.price}
                                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 flex gap-2">
                                    <span className="flex-1 text-right font-medium py-2">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </span>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            X
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border pt-4 flex justify-end">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <input type="hidden" name="items" value={JSON.stringify(items)} />

                {state?.error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                        {state.error}
                    </div>
                )}

                {state?.success && (
                    <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                        Nota de crédito creada exitosamente
                    </div>
                )}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending || !selectedInvoice}>
                        {isPending ? "Creando..." : "Crear Nota de Crédito"}
                    </Button>
                    <Link href="/dashboard/notas-credito">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
