"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createSettlement } from "@/actions/settlement";
import { departamentos, getMunicipiosByDepartamento } from "@/lib/catalogs";

interface Item { description: string; quantity: number; unitPrice: number; }

export default function NuevaLiquidacionPage() {
    const [state, formAction, isPending] = useActionState(createSettlement, null);
    const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
    const [selectedDepto, setSelectedDepto] = useState("");
    const [deductions, setDeductions] = useState(0);
    const [commissions, setCommissions] = useState(0);

    const municipios = selectedDepto ? getMunicipiosByDepartamento(selectedDepto) : [];
    const grossAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const netAmount = grossAmount - deductions - commissions;

    const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
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
                    <h2 className="text-3xl font-bold tracking-tight">Nueva Liquidación</h2>
                    <p className="text-muted-foreground mt-1">Liquidación de operaciones con terceros</p>
                </div>
                <Link href="/dashboard/liquidaciones"><Button variant="outline">Cancelar</Button></Link>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos del Proveedor</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Nombre / Razón Social *" name="providerName" required />
                        <Input label="NIT *" name="providerNit" required placeholder="0000-000000-000-0" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="NRC" name="providerNrc" placeholder="000000-0" />
                        <Input label="Teléfono" name="providerPhone" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Correo" name="providerEmail" type="email" />
                        <Input label="Dirección" name="providerAddress" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Departamento</label>
                            <select name="providerDepartamento" className="w-full px-3 py-2 border border-border rounded-lg bg-background" onChange={(e) => setSelectedDepto(e.target.value)}>
                                <option value="">Seleccione...</option>
                                {departamentos.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Municipio</label>
                            <select name="providerMunicipio" className="w-full px-3 py-2 border border-border rounded-lg bg-background" disabled={!selectedDepto}>
                                <option value="">Seleccione...</option>
                                {municipios.map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Período de Liquidación</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Fecha Inicio *" name="periodStart" type="date" required />
                        <Input label="Fecha Fin *" name="periodEnd" type="date" required />
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Conceptos</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Agregar</Button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-12 items-end">
                                <div className="md:col-span-6">
                                    <Input label={index === 0 ? "Descripción" : undefined} value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Input label={index === 0 ? "Cantidad" : undefined} type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)} required />
                                </div>
                                <div className="md:col-span-3">
                                    <Input label={index === 0 ? "Precio Unit." : undefined} type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)} required />
                                </div>
                                <div className="md:col-span-1">
                                    {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-500">X</Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-border">
                        <Input label="Deducciones" name="deductions" type="number" step="0.01" value={deductions} onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)} />
                        <Input label="Comisiones" name="commissions" type="number" step="0.01" value={commissions} onChange={(e) => setCommissions(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border text-right">
                        <div><p className="text-sm text-muted-foreground">Bruto</p><p className="text-lg font-semibold">${grossAmount.toFixed(2)}</p></div>
                        <div><p className="text-sm text-muted-foreground">Deduc. + Com.</p><p className="text-lg font-semibold text-red-500">-${(deductions + commissions).toFixed(2)}</p></div>
                        <div><p className="text-sm text-muted-foreground">Neto a Pagar</p><p className="text-2xl font-bold text-primary">${netAmount.toFixed(2)}</p></div>
                    </div>
                </div>

                <input type="hidden" name="items" value={JSON.stringify(items)} />

                {state?.error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{state.error}</div>}
                {state?.success && <div className="p-4 bg-green-50 text-green-600 rounded-lg">Liquidación creada exitosamente</div>}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>{isPending ? "Creando..." : "Crear Liquidación"}</Button>
                    <Link href="/dashboard/liquidaciones"><Button type="button" variant="outline">Cancelar</Button></Link>
                </div>
            </form>
        </div>
    );
}
