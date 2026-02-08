"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createFSE } from "@/actions/fse";
import { subjectDocTypes } from "@/lib/constants";
import { departamentos, getMunicipiosByDepartamento } from "@/lib/catalogs";

interface Item {
    description: string;
    quantity: number;
    price: number;
    tipoItem: number;
}

export default function NuevaFSEPage() {
    const [state, formAction, isPending] = useActionState(createFSE, null);
    const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, price: 0, tipoItem: 1 }]);
    const [selectedDepto, setSelectedDepto] = useState("");

    const municipios = selectedDepto ? getMunicipiosByDepartamento(selectedDepto) : [];

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
                    <h2 className="text-3xl font-bold tracking-tight">Nueva Factura Sujeto Excluido</h2>
                    <p className="text-muted-foreground mt-1">
                        Registra una compra a proveedor sin obligaciones tributarias
                    </p>
                </div>
                <Link href="/dashboard/sujeto-excluido">
                    <Button variant="outline">Cancelar</Button>
                </Link>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos del Proveedor (Sujeto Excluido)</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Nombre Completo *"
                            name="subjectName"
                            required
                            placeholder="Nombre del proveedor"
                        />
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tipo de Documento *
                            </label>
                            <select
                                name="subjectDocType"
                                required
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            >
                                {subjectDocTypes.map((doc) => (
                                    <option key={doc.value} value={doc.value}>{doc.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Número de Documento *"
                            name="subjectDocNumber"
                            required
                            placeholder="00000000-0"
                        />
                        <Input
                            label="Teléfono"
                            name="subjectPhone"
                            placeholder="0000-0000"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Correo Electrónico"
                            name="subjectEmail"
                            type="email"
                            placeholder="correo@ejemplo.com"
                        />
                        <Input
                            label="Actividad / Giro"
                            name="subjectActivity"
                            placeholder="Actividad económica"
                        />
                    </div>

                    <Input
                        label="Dirección"
                        name="subjectAddress"
                        placeholder="Dirección completa"
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Departamento</label>
                            <select
                                name="subjectDepartamento"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                onChange={(e) => setSelectedDepto(e.target.value)}
                            >
                                <option value="">Seleccione...</option>
                                {departamentos.map((d) => (
                                    <option key={d.codigo} value={d.codigo}>{d.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Municipio</label>
                            <select
                                name="subjectMunicipio"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                disabled={!selectedDepto}
                            >
                                <option value="">Seleccione...</option>
                                {municipios.map((m) => (
                                    <option key={m.codigo} value={m.codigo}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Items de Compra</h3>
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
                                        label={index === 0 ? "Precio" : undefined}
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
                            <p className="text-sm text-muted-foreground">Total Compra</p>
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
                        Factura de sujeto excluido creada exitosamente
                    </div>
                )}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Creando..." : "Crear FSE"}
                    </Button>
                    <Link href="/dashboard/sujeto-excluido">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
