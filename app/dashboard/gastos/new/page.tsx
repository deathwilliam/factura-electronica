"use client";

import { Button } from "@/components/ui/Button";
import { createExpense, getExpenseCategories } from "@/actions/expenses";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const initialState = { success: false, error: "" };

interface Category {
    id: string;
    name: string;
    color: string | null;
}

export default function NewExpensePage() {
    const router = useRouter();
    const [state, formAction, pending] = useActionState(createExpense, initialState);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        async function loadCategories() {
            const data = await getExpenseCategories();
            setCategories(data);
        }
        loadCategories();
    }, []);

    useEffect(() => {
        if (state.success) {
            router.push("/dashboard/gastos");
        }
    }, [state.success, router]);

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Gasto</h2>
                <p className="text-muted-foreground">Registra un nuevo gasto del negocio.</p>
            </div>

            <form action={formAction} className="space-y-4 bg-card p-6 rounded-lg border border-border">
                {state.error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {state.error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Descripción *</label>
                    <input
                        name="description"
                        type="text"
                        required
                        placeholder="Descripción del gasto"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Monto *</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha</label>
                        <input
                            name="date"
                            type="date"
                            defaultValue={new Date().toISOString().split("T")[0]}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <select
                        name="categoryId"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                        <option value="">Sin categoría</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Proveedor</label>
                    <input
                        name="vendor"
                        type="text"
                        placeholder="Nombre del proveedor (opcional)"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Referencia / No. Factura</label>
                    <input
                        name="reference"
                        type="text"
                        placeholder="Número de factura o referencia"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        name="deductible"
                        type="checkbox"
                        value="true"
                        defaultChecked
                        className="rounded border-border"
                        id="deductible"
                    />
                    <label htmlFor="deductible" className="text-sm">
                        Deducible de impuestos
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={pending}>
                        {pending ? "Guardando..." : "Guardar Gasto"}
                    </Button>
                    <Link href="/dashboard/gastos">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
