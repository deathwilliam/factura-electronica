"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateSettings } from "@/actions/settings";
import { useFormStatus } from "react-dom";
import { useState } from "react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Guardar Cambios"}
        </Button>
    );
}

interface UserSettingsFormProps {
    user: {
        razonSocial: string | null;
        nit: string | null;
        nrc: string | null;
        giro: string | null;
        direccion: string | null;
        telefono: string | null;
        name: string | null;
        email: string | null;
    };
}

export function UserSettingsForm({ user }: UserSettingsFormProps) {
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        const result = await updateSettings(formData);
        if (result.success) {
            setMessage("✅ " + result.message);
        } else {
            setMessage("❌ " + result.message);
        }

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Input
                    label="Nombre de Empresa / Razón Social"
                    name="razonSocial"
                    defaultValue={user.razonSocial || ""}
                    placeholder="Mi Empresa S.A. de C.V."
                />
                <Input
                    label="NIT"
                    name="nit"
                    defaultValue={user.nit || ""}
                    placeholder="0614-000000-000-0"
                />
                <Input
                    label="NRC (Número de Registro)"
                    name="nrc"
                    defaultValue={user.nrc || ""}
                    placeholder="123456-7"
                />
                <Input
                    label="Giro / Actividad Económica"
                    name="giro"
                    defaultValue={user.giro || ""}
                    placeholder="Venta de ..."
                />
                <Input
                    label="Dirección"
                    name="direccion"
                    defaultValue={user.direccion || ""}
                    placeholder="San Salvador, El Salvador"
                />
                <Input
                    label="Teléfono"
                    name="telefono"
                    defaultValue={user.telefono || ""}
                    placeholder="2222-2222"
                />
                <Input
                    label="Nombre de Contacto"
                    name="name"
                    defaultValue={user.name || ""}
                />
                <Input
                    label="Correo Electrónico"
                    name="email"
                    defaultValue={user.email || ""}
                    type="email"
                />
            </div>

            {message && (
                <div className={`p-4 rounded-md text-sm ${message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message}
                </div>
            )}

            <SubmitButton />
        </form>
    );
}
