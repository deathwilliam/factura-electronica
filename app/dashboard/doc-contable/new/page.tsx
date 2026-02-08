"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createAccountingSettlement } from "@/actions/accounting-settlement";

interface Item { description: string; amount: number; }

export default function NuevoDocContablePage() {
    const [state, formAction, isPending] = useActionState(createAccountingSettlement, null);
    const [items, setItems] = useState<Item[]>([{ description: "", amount: 0 }]);

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = totalAmount * 0.13;
    const grandTotal = totalAmount + taxAmount;

    const addItem = () => setItems([...items, { description: "", amount: 0 }]);
    const removeItem = (index: number) => items.length > 1 && setItems(items.filter((_, i) => i !== index));
    const updateItem = (index: number, field: keyof Item, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Nuevo Documento Contable</h2>
                    <p className="text-muted-foreground mt-1">Documento contable de liquidación</p>
                </div>
                <Link href="/dashboard/doc-contable"><Button variant="outline">Cancelar</Button></Link>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Emisor Original del Documento</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Nombre / Razón Social *" name="originalEmitterName" required />
                        <Input label="NIT *" name="originalEmitterNit" required placeholder="0000-000000-000-0" />
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <Input label="Concepto del Documento *" name="concept" required placeholder="Describa el concepto del documento contable" />
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Conceptos</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Agregar</Button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-12 items-end">
                                <div className="md:col-span-8">
                                    <Input label={index === 0 ? "Descripción" : undefined} value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} required />
                                </div>
                                <div className="md:col-span-3">
                                    <Input label={index === 0 ? "Monto" : undefined} type="number" step="0.01" value={item.amount} onChange={(e) => updateItem(index, "amount", parseFloat(e.target.value) || 0)} required />
                                </div>
                                <div className="md:col-span-1">
                                    {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-500">X</Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border text-right">
                        <div><p className="text-sm text-muted-foreground">Subtotal</p><p className="text-lg font-semibold">${totalAmount.toFixed(2)}</p></div>
                        <div><p className="text-sm text-muted-foreground">IVA (13%)</p><p className="text-lg font-semibold">${taxAmount.toFixed(2)}</p></div>
                        <div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold text-primary">${grandTotal.toFixed(2)}</p></div>
                    </div>
                </div>

                <input type="hidden" name="items" value={JSON.stringify(items)} />

                {state?.error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{state.error}</div>}
                {state?.success && <div className="p-4 bg-green-50 text-green-600 rounded-lg">Documento contable creado exitosamente</div>}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>{isPending ? "Creando..." : "Crear Documento"}</Button>
                    <Link href="/dashboard/doc-contable"><Button type="button" variant="outline">Cancelar</Button></Link>
                </div>
            </form>
        </div>
    );
}
