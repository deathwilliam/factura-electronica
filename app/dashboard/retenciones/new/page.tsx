"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createWithholding } from "@/actions/withholding";
import { withholdingTypes } from "@/lib/constants";
import { departamentos, getMunicipiosByDepartamento } from "@/lib/catalogs";

interface Item {
    description: string;
    withholdingType: string;
    subjectAmount: number;
}

export default function NuevaRetencionPage() {
    const [state, formAction, isPending] = useActionState(createWithholding, null);
    const [items, setItems] = useState<Item[]>([{ description: "", withholdingType: "IVA_1", subjectAmount: 0 }]);
    const [selectedDepto, setSelectedDepto] = useState("");

    const municipios = selectedDepto ? getMunicipiosByDepartamento(selectedDepto) : [];

    const addItem = () => {
        setItems([...items, { description: "", withholdingType: "IVA_1", subjectAmount: 0 }]);
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

    const getRate = (type: string) => {
        const wt = withholdingTypes.find(w => w.value === type);
        return wt?.rate || 0;
    };

    const calculateWithheld = (item: Item) => {
        return item.subjectAmount * getRate(item.withholdingType);
    };

    const totalSubject = items.reduce((sum, item) => sum + item.subjectAmount, 0);
    const totalWithheld = items.reduce((sum, item) => sum + calculateWithheld(item), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Nuevo Comprobante de Retención</h2>
                    <p className="text-muted-foreground mt-1">
                        Registra retenciones IVA o Renta a proveedores
                    </p>
                </div>
                <Link href="/dashboard/retenciones">
                    <Button variant="outline">Cancelar</Button>
                </Link>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold">Datos del Proveedor (Retenido)</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Nombre / Razón Social *"
                            name="supplierName"
                            required
                            placeholder="Nombre del proveedor"
                        />
                        <Input
                            label="NIT *"
                            name="supplierNit"
                            required
                            placeholder="0000-000000-000-0"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="NRC"
                            name="supplierNrc"
                            placeholder="000000-0"
                        />
                        <Input
                            label="Código Actividad"
                            name="supplierCodActividad"
                            placeholder="00000"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Teléfono"
                            name="supplierPhone"
                            placeholder="0000-0000"
                        />
                        <Input
                            label="Correo Electrónico"
                            name="supplierEmail"
                            type="email"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <Input
                        label="Dirección"
                        name="supplierAddress"
                        placeholder="Dirección completa"
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Departamento</label>
                            <select
                                name="supplierDepartamento"
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
                                name="supplierMunicipio"
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
                    <h3 className="text-lg font-semibold">Documento Relacionado</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium mb-2">Tipo Documento *</label>
                            <select
                                name="relatedDocType"
                                required
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            >
                                <option value="03">Crédito Fiscal (CCF)</option>
                                <option value="01">Factura Consumidor Final</option>
                            </select>
                        </div>
                        <Input
                            label="Número de Control *"
                            name="relatedDocNumber"
                            required
                            placeholder="DTE-03-0001-001-000000000000001"
                        />
                        <Input
                            label="Fecha Documento *"
                            name="relatedDocDate"
                            type="date"
                            required
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Conceptos de Retención</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            + Agregar Concepto
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-12 items-end">
                                <div className="md:col-span-4">
                                    <Input
                                        label={index === 0 ? "Descripción" : undefined}
                                        placeholder="Concepto de retención"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className={`block text-sm font-medium mb-2 ${index === 0 ? "" : "invisible"}`}>
                                        Tipo Retención
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        value={item.withholdingType}
                                        onChange={(e) => updateItem(index, "withholdingType", e.target.value)}
                                    >
                                        {withholdingTypes.map((wt) => (
                                            <option key={wt.value} value={wt.value}>{wt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label={index === 0 ? "Monto Sujeto" : undefined}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.subjectAmount}
                                        onChange={(e) => updateItem(index, "subjectAmount", parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 text-right">
                                    <p className={`text-sm text-muted-foreground ${index === 0 ? "" : "invisible"}`}>
                                        Retenido
                                    </p>
                                    <p className="font-medium">${calculateWithheld(item).toFixed(2)}</p>
                                </div>
                                <div className="md:col-span-1 flex justify-end">
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

                    <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Sujeto</p>
                            <p className="text-xl font-semibold">${totalSubject.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Retenido</p>
                            <p className="text-2xl font-bold text-primary">${totalWithheld.toFixed(2)}</p>
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
                        Comprobante de retención creado exitosamente
                    </div>
                )}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Creando..." : "Crear Comprobante"}
                    </Button>
                    <Link href="/dashboard/retenciones">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
