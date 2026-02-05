"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createInvoice } from "@/actions/invoices";
import { getClients } from "@/actions/clients";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

interface Client {
    id: string;
    name: string;
}

export default function NewInvoicePage() {
    const [state, dispatch] = useActionState(createInvoice, undefined);
    const [clients, setClients] = useState<Client[]>([]);
    const [items, setItems] = useState([{ description: "", quantity: 1, price: 0 }]);

    useEffect(() => {
        getClients().then((data) => setClients(data));
    }, []);

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nueva Factura</h2>
                <p className="text-muted-foreground">Completa los datos para emitir un nuevo documento.</p>
            </div>

            <form action={dispatch} className="space-y-6 bg-card p-6 rounded-xl border border-border">
                {state?.error && (
                    <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm">
                        {state.error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cliente</label>
                        <select
                            name="clientId"
                            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                        >
                            <option value="">Selecciona un cliente</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                        {clients.length === 0 && (
                            <p className="text-xs text-red-500">
                                No hay clientes. <Link href="/dashboard/clientes/new" className="underline">Crea uno primero</Link>.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de Documento</label>
                        <select
                            name="type"
                            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
                            <option value="CREDITO_FISCAL">Crédito Fiscal</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Fecha Vencimiento" name="dueDate" type="date" required />
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estado</label>
                        <select
                            name="status"
                            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="PENDING">Pendiente</option>
                            <option value="PAID">Pagada</option>
                        </select>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Detalle de Items</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-sm text-primary hover:underline font-medium"
                        >
                            + Agregar item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-[1fr_80px_100px_40px] gap-2 items-end">
                                <div className="space-y-1">
                                    {idx === 0 && <label className="text-xs text-muted-foreground">Descripción</label>}
                                    <input
                                        name="item_description"
                                        value={item.description}
                                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                                        placeholder="Servicio o producto"
                                        required
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-1">
                                    {idx === 0 && <label className="text-xs text-muted-foreground">Cant.</label>}
                                    <input
                                        name="item_quantity"
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                                        required
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-1">
                                    {idx === 0 && <label className="text-xs text-muted-foreground">Precio $</label>}
                                    <input
                                        name="item_price"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={item.price || ""}
                                        onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        required
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(idx)}
                                    className="h-10 w-10 flex items-center justify-center rounded-lg border border-input text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-30"
                                    disabled={items.length <= 1}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-border">
                        <div className="text-right">
                            <span className="text-sm text-muted-foreground mr-4">Subtotal:</span>
                            <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
                        </div>
                    </div>
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
