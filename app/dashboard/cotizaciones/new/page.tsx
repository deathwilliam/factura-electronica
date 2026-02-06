"use client";

import { Button } from "@/components/ui/Button";
import { createQuotation } from "@/actions/quotations";
import { getClients } from "@/actions/clients";
import { getProducts } from "@/actions/products";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const initialState = { success: false, error: "" };

interface Item {
    productId: string | null;
    description: string;
    quantity: number;
    price: number;
    discount: number;
}

export default function NewQuotationPage() {
    const router = useRouter();
    const [state, formAction, pending] = useActionState(createQuotation, initialState);
    const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
    const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);
    const [items, setItems] = useState<Item[]>([
        { productId: null, description: "", quantity: 1, price: 0, discount: 0 },
    ]);

    useEffect(() => {
        async function loadData() {
            const [clientsData, productsData] = await Promise.all([
                getClients(),
                getProducts({ limit: 100, active: true }),
            ]);
            setClients(clientsData.map((c) => ({ id: c.id, name: c.name })));
            setProducts(productsData.products.map((p) => ({ id: p.id, name: p.name, price: p.price })));
        }
        loadData();
    }, []);

    useEffect(() => {
        if (state.success) {
            router.push("/dashboard/cotizaciones");
        }
    }, [state.success, router]);

    const addItem = () => {
        setItems([...items, { productId: null, description: "", quantity: 1, price: 0, discount: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof Item, value: string | number) => {
        const newItems = [...items];
        if (field === "productId" && value) {
            const product = products.find((p) => p.id === value);
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    productId: value as string,
                    description: product.name,
                    price: product.price,
                };
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price - item.discount, 0);
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nueva Cotización</h2>
                <p className="text-muted-foreground">Crea una nueva cotización para un cliente.</p>
            </div>

            <form
                action={(formData) => {
                    formData.set("items", JSON.stringify(items));
                    formAction(formData);
                }}
                className="space-y-6 bg-card p-6 rounded-lg border border-border"
            >
                {state.error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {state.error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Cliente *</label>
                        <select
                            name="clientId"
                            required
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                            <option value="">Seleccionar cliente</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Válida hasta *</label>
                        <input
                            name="validUntil"
                            type="date"
                            required
                            defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>
                </div>

                {/* Items */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium">Items *</label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            + Agregar Item
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start p-3 bg-muted/50 rounded-md">
                                <div className="flex-1 grid grid-cols-5 gap-2">
                                    <div className="col-span-2">
                                        <select
                                            value={item.productId || ""}
                                            onChange={(e) => updateItem(index, "productId", e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                                        >
                                            <option value="">Producto (opcional)</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} - ${p.price}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, "description", e.target.value)}
                                            placeholder="Descripción *"
                                            required
                                            className="w-full mt-1 px-2 py-1 text-sm border border-border rounded bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground">Cantidad</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground">Precio</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.price}
                                            onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground">Subtotal</label>
                                        <p className="px-2 py-1 text-sm font-medium">
                                            ${(item.quantity * item.price - item.discount).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    disabled={items.length === 1}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totales */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>IVA (13%):</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Notas / Condiciones</label>
                    <textarea
                        name="notes"
                        rows={3}
                        placeholder="Términos y condiciones de la cotización..."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <input type="hidden" name="discount" value="0" />

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={pending}>
                        {pending ? "Guardando..." : "Crear Cotización"}
                    </Button>
                    <Link href="/dashboard/cotizaciones">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
