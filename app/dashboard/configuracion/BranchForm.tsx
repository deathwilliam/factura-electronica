"use client";

import { Button } from "@/components/ui/Button";
import { createBranch } from "@/actions/branches";
import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const initialState = { success: false, error: "" };

export function BranchForm() {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [state, formAction, pending] = useActionState(createBranch, initialState);

    useEffect(() => {
        if (state.success) {
            setShowForm(false);
            router.refresh();
        }
    }, [state.success, router]);

    if (!showForm) {
        return (
            <Button onClick={() => setShowForm(true)}>
                + Nueva Sucursal
            </Button>
        );
    }

    return (
        <form action={formAction} className="p-6 rounded-lg border border-border bg-card space-y-4 max-w-xl">
            <h3 className="text-lg font-semibold">Nueva Sucursal</h3>

            {state.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                    name="name"
                    type="text"
                    required
                    placeholder="Casa Matriz"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Código Establecimiento *</label>
                    <input
                        name="code"
                        type="text"
                        required
                        maxLength={4}
                        placeholder="0001"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">4 dígitos (ej: 0001)</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Código POS *</label>
                    <input
                        name="posCode"
                        type="text"
                        required
                        maxLength={4}
                        placeholder="0001"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">4 dígitos (ej: 0001)</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Dirección *</label>
                <input
                    name="address"
                    type="text"
                    required
                    placeholder="Dirección completa de la sucursal"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                    name="phone"
                    type="tel"
                    placeholder="0000-0000"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    name="isMain"
                    type="checkbox"
                    value="true"
                    className="rounded border-border"
                    id="isMain"
                />
                <label htmlFor="isMain" className="text-sm">
                    Es la sucursal principal
                </label>
            </div>

            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={pending}>
                    {pending ? "Guardando..." : "Crear Sucursal"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
