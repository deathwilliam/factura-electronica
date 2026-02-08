"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createShippingNote } from "@/actions/shipping-note";
import { departamentos, getMunicipiosByDepartamento } from "@/lib/catalogs";

interface Item {
    description: string;
    quantity: number;
    unitValue: number;
    tipoItem: number;
}

export default function NuevaNotaRemisionPage() {
    const [state, formAction, isPending] = useActionState(createShippingNote, null);
    const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, unitValue: 0, tipoItem: 1 }]);
    const [selectedDepto, setSelectedDepto] = useState("");

    const municipios = selectedDepto ? getMunicipiosByDepartamento(selectedDepto) : [];

    const addItem = () => setItems([...items, { description: "", quantity: 1, unitValue: 0, tipoItem: 1 }]);
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
                    <h2 className="text-3xl font-bold tracking-tight">Nueva Nota de Remisión</h2>
                    <p className="text-muted-foreground mt-1">Traslado de mercadería sin transferencia de propiedad</p>
                </div>
                <Link href="/dashboard/notas-remision"><Button variant="outline">Cancelar</Button></Link>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos del Destinatario</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Nombre / Razón Social *" name="recipientName" required placeholder="Destinatario" />
                        <Input label="NIT" name="recipientNit" placeholder="0000-000000-000-0" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="NRC" name="recipientNrc" placeholder="000000-0" />
                        <Input label="Teléfono" name="recipientPhone" placeholder="0000-0000" />
                    </div>
                    <Input label="Dirección *" name="recipientAddress" required placeholder="Dirección de entrega" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Departamento</label>
                            <select name="recipientDepartamento" className="w-full px-3 py-2 border border-border rounded-lg bg-background" onChange={(e) => setSelectedDepto(e.target.value)}>
                                <option value="">Seleccione...</option>
                                {departamentos.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Municipio</label>
                            <select name="recipientMunicipio" className="w-full px-3 py-2 border border-border rounded-lg bg-background" disabled={!selectedDepto}>
                                <option value="">Seleccione...</option>
                                {municipios.map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos del Transporte</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Input label="Nombre del Motorista" name="driverName" placeholder="Nombre completo" />
                        <Input label="DUI del Motorista" name="driverDui" placeholder="00000000-0" />
                        <Input label="Placa del Vehículo" name="vehiclePlate" placeholder="P000-000" />
                    </div>
                    <Input label="Motivo del Traslado *" name="transportReason" required placeholder="Ej: Traslado entre bodegas, consignación, etc." />
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Mercadería a Trasladar</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Agregar</Button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-12 items-end">
                                <div className="md:col-span-5">
                                    <Input label={index === 0 ? "Descripción" : undefined} placeholder="Descripción" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Input label={index === 0 ? "Cantidad" : undefined} type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Input label={index === 0 ? "Valor Ref." : undefined} type="number" step="0.01" value={item.unitValue} onChange={(e) => updateItem(index, "unitValue", parseFloat(e.target.value) || 0)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium mb-2 ${index === 0 ? "" : "invisible"}`}>Tipo</label>
                                    <select className="w-full px-3 py-2 border border-border rounded-lg bg-background" value={item.tipoItem} onChange={(e) => updateItem(index, "tipoItem", parseInt(e.target.value))}>
                                        <option value={1}>Bien</option>
                                        <option value={2}>Servicio</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-500">X</Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <input type="hidden" name="items" value={JSON.stringify(items)} />

                {state?.error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{state.error}</div>}
                {state?.success && <div className="p-4 bg-green-50 text-green-600 rounded-lg">Nota de remisión creada exitosamente</div>}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>{isPending ? "Creando..." : "Crear Nota de Remisión"}</Button>
                    <Link href="/dashboard/notas-remision"><Button type="button" variant="outline">Cancelar</Button></Link>
                </div>
            </form>
        </div>
    );
}
