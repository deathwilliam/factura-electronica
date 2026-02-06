"use client";

import { Button } from "@/components/ui/Button";
import { createProduct } from "@/actions/products";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const initialState = { success: false, error: "" };

export default function NewProductPage() {
    const router = useRouter();
    const [state, formAction, pending] = useActionState(createProduct, initialState);

    useEffect(() => {
        if (state.success) {
            router.push("/dashboard/productos");
        }
    }, [state.success, router]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Producto</h2>
                <p className="text-muted-foreground">Agrega un nuevo producto o servicio al catálogo.</p>
            </div>

            <form action={formAction} className="space-y-4 bg-card p-6 rounded-lg border border-border">
                {state.error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {state.error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Código *</label>
                        <input
                            name="code"
                            type="text"
                            required
                            placeholder="PROD-001"
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo *</label>
                        <select
                            name="type"
                            required
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                            <option value="SERVICE">Servicio</option>
                            <option value="PRODUCT">Producto</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <input
                        name="name"
                        type="text"
                        required
                        placeholder="Nombre del producto o servicio"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="Descripción detallada (opcional)"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Precio *</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Costo</label>
                        <input
                            name="cost"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00 (opcional)"
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Unidad de medida</label>
                        <select
                            name="unit"
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                            <option value="UNIDAD">Unidad</option>
                            <option value="HORA">Hora</option>
                            <option value="DIA">Día</option>
                            <option value="MES">Mes</option>
                            <option value="SERVICIO">Servicio</option>
                            <option value="KG">Kilogramo</option>
                            <option value="LB">Libra</option>
                            <option value="LT">Litro</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                        <label className="flex items-center gap-2">
                            <input
                                name="taxable"
                                type="checkbox"
                                value="true"
                                defaultChecked
                                className="rounded border-border"
                            />
                            <span className="text-sm">Gravado con IVA</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={pending}>
                        {pending ? "Guardando..." : "Guardar Producto"}
                    </Button>
                    <Link href="/dashboard/productos">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
