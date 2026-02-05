"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/actions/clients";
import Link from "next/link";
import { useActionState } from "react";

export default function NewClientPage() {
    const [state, dispatch] = useActionState(createClient, undefined);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h2>
                <p className="text-muted-foreground">Registra un nuevo cliente para tus facturas.</p>
            </div>

            <form action={dispatch} className="space-y-6 bg-card p-6 rounded-xl border border-border">
                {state?.error && (
                    <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm">
                        {state.error}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Nombre / Empresa" name="name" placeholder="Empresa S.A. de C.V." required />
                    <Input label="Email de Contacto" name="email" type="email" placeholder="contacto@empresa.com" required />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Teléfono" name="phone" placeholder="2222-2222" />
                    <Input label="Dirección" name="address" placeholder="San Salvador, El Salvador" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Persona</label>
                    <select
                        name="tipo"
                        className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value="NATURAL">Persona Natural</option>
                        <option value="JURIDICO">Persona Jurídica</option>
                    </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="NIT" name="nit" placeholder="0614-000000-000-0" />
                    <Input label="DUI" name="dui" placeholder="00000000-0" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="NRC" name="nrc" placeholder="123456-7" />
                    <Input label="Giro / Actividad" name="giro" placeholder="Venta de..." />
                </div>

                <Input label="Razón Social" name="razonSocial" placeholder="Empresa S.A. de C.V." />

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/dashboard/clientes">
                        <Button type="button" variant="ghost">Cancelar</Button>
                    </Link>
                    <Button type="submit">Guardar Cliente</Button>
                </div>
            </form>
        </div>
    );
}
