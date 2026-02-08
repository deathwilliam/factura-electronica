"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createExportInvoice } from "@/actions/export-invoice";
import { countries, incoterms } from "@/lib/constants";

interface Item {
    description: string;
    quantity: number;
    price: number;
    tipoItem: number;
}

export default function NuevaExportacionPage() {
    const [state, formAction, isPending] = useActionState(createExportInvoice, null);
    const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, price: 0, tipoItem: 1 }]);
    const [selectedCountry, setSelectedCountry] = useState("");

    const countryName = countries.find(c => c.code === selectedCountry)?.name || "";

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, price: 0, tipoItem: 1 }]);
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
                    <h2 className="text-3xl font-bold tracking-tight">Nueva Factura de Exportación</h2>
                    <p className="text-muted-foreground mt-1">
                        Registra una venta al exterior (exenta de IVA)
                    </p>
                </div>
                <Link href="/dashboard/exportaciones">
                    <Button variant="outline">Cancelar</Button>
                </Link>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos del Cliente Extranjero</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Nombre / Razón Social *"
                            name="clientName"
                            required
                            placeholder="Nombre del cliente"
                        />
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                País del Cliente *
                            </label>
                            <select
                                name="clientCountry"
                                required
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                            >
                                <option value="">Seleccione un país</option>
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                            <input type="hidden" name="clientCountryName" value={countryName} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Número de Identificación"
                            name="clientDocNumber"
                            placeholder="Pasaporte, Tax ID, etc."
                        />
                        <Input
                            label="Teléfono"
                            name="clientPhone"
                            placeholder="+1 000 000 0000"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Correo Electrónico"
                            name="clientEmail"
                            type="email"
                            placeholder="email@example.com"
                        />
                        <Input
                            label="Dirección"
                            name="clientAddress"
                            placeholder="Dirección del cliente"
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos de Exportación</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tipo de Exportación
                            </label>
                            <select
                                name="exportType"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            >
                                <option value="DEFINITIVE">Exportación Definitiva</option>
                                <option value="TEMPORARY">Exportación Temporal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                País Destino *
                            </label>
                            <select
                                name="destinationCountry"
                                required
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            >
                                <option value="">Seleccione un país</option>
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Incoterm
                            </label>
                            <select
                                name="incoterm"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            >
                                <option value="">Seleccione...</option>
                                {incoterms.map((i) => (
                                    <option key={i.value} value={i.value}>{i.label}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Puerto / Frontera de Salida"
                            name="portOfExit"
                            placeholder="Ej: Puerto de Acajutla, Frontera Las Chinamas"
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Items de Exportación</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            + Agregar Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-12 items-end">
                                <div className="md:col-span-5">
                                    <Input
                                        label={index === 0 ? "Descripción" : undefined}
                                        placeholder="Descripción del bien o servicio"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium mb-2 ${index === 0 ? "" : "invisible"}`}>
                                        Tipo
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        value={item.tipoItem}
                                        onChange={(e) => updateItem(index, "tipoItem", parseInt(e.target.value))}
                                    >
                                        <option value={1}>Bien</option>
                                        <option value={2}>Servicio</option>
                                    </select>
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
                                        label={index === 0 ? "Precio USD" : undefined}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.price}
                                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-1 flex items-center justify-end gap-2">
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
                            <p className="text-sm text-muted-foreground">Total Exento (USD)</p>
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
                        Factura de exportación creada exitosamente
                    </div>
                )}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Creando..." : "Crear Factura Exportación"}
                    </Button>
                    <Link href="/dashboard/exportaciones">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
