"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createDonation } from "@/actions/donation";
import { departamentos, getMunicipiosByDepartamento } from "@/lib/catalogs";

interface Item { description: string; quantity: number; value: number; tipoItem: number; }

export default function NuevaDonacionPage() {
    const [state, formAction, isPending] = useActionState(createDonation, null);
    const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, value: 0, tipoItem: 1 }]);
    const [selectedDepto, setSelectedDepto] = useState("");

    const municipios = selectedDepto ? getMunicipiosByDepartamento(selectedDepto) : [];
    const total = items.reduce((sum, item) => sum + item.quantity * item.value, 0);

    const addItem = () => setItems([...items, { description: "", quantity: 1, value: 0, tipoItem: 1 }]);
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
                    <h2 className="text-3xl font-bold tracking-tight">Nuevo Comprobante de Donación</h2>
                    <p className="text-muted-foreground mt-1">Donación a entidad sin fines de lucro</p>
                </div>
                <Link href="/dashboard/donaciones"><Button variant="outline">Cancelar</Button></Link>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos del Donante</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Nombre / Razón Social *" name="donorName" required />
                        <Input label="NIT" name="donorNit" placeholder="0000-000000-000-0" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="DUI (si persona natural)" name="donorDui" placeholder="00000000-0" />
                        <Input label="Teléfono" name="donorPhone" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Correo" name="donorEmail" type="email" />
                        <Input label="Dirección" name="donorAddress" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Departamento</label>
                            <select name="donorDepartamento" className="w-full px-3 py-2 border border-border rounded-lg bg-background" onChange={(e) => setSelectedDepto(e.target.value)}>
                                <option value="">Seleccione...</option>
                                {departamentos.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Municipio</label>
                            <select name="donorMunicipio" className="w-full px-3 py-2 border border-border rounded-lg bg-background" disabled={!selectedDepto}>
                                <option value="">Seleccione...</option>
                                {municipios.map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos del Donatario (Entidad que recibe)</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Nombre de la Entidad *" name="recipientName" required placeholder="Fundación, ONG, etc." />
                        <Input label="NIT de la Entidad *" name="recipientNit" required placeholder="0000-000000-000-0" />
                    </div>
                    <Input label="Número de Autorización MH" name="authorizationNumber" placeholder="Número de autorización (si aplica)" />
                    <div>
                        <label className="block text-sm font-medium mb-2">Tipo de Donación</label>
                        <select name="donationType" className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                            <option value="GOODS">Bienes</option>
                            <option value="CASH">Efectivo</option>
                            <option value="SERVICES">Servicios</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Items Donados</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Agregar</Button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-12 items-end">
                                <div className="md:col-span-5">
                                    <Input label={index === 0 ? "Descripción" : undefined} value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium mb-2 ${index === 0 ? "" : "invisible"}`}>Tipo</label>
                                    <select className="w-full px-3 py-2 border border-border rounded-lg bg-background" value={item.tipoItem} onChange={(e) => updateItem(index, "tipoItem", parseInt(e.target.value))}>
                                        <option value={1}>Bien</option>
                                        <option value={2}>Servicio</option>
                                        <option value={3}>Efectivo</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <Input label={index === 0 ? "Cantidad" : undefined} type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Input label={index === 0 ? "Valor" : undefined} type="number" step="0.01" value={item.value} onChange={(e) => updateItem(index, "value", parseFloat(e.target.value) || 0)} required />
                                </div>
                                <div className="md:col-span-1">
                                    {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-500">X</Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-border pt-4 flex justify-end">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Valor Total de la Donación</p>
                            <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <input type="hidden" name="items" value={JSON.stringify(items)} />

                {state?.error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{state.error}</div>}
                {state?.success && <div className="p-4 bg-green-50 text-green-600 rounded-lg">Donación registrada exitosamente</div>}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>{isPending ? "Creando..." : "Registrar Donación"}</Button>
                    <Link href="/dashboard/donaciones"><Button type="button" variant="outline">Cancelar</Button></Link>
                </div>
            </form>
        </div>
    );
}
