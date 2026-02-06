"use client";

import { Button } from "@/components/ui/Button";
import { updateCompanySettings } from "@/actions/branches";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

const initialState = { success: false, error: "" };

interface Props {
    settings: {
        id: string;
        logo: string | null;
        invoicePrefix: string;
        quotationPrefix: string;
        invoiceNotes: string | null;
        quotationNotes: string | null;
        paymentTerms: string | null;
        emailFooter: string | null;
        primaryColor: string;
    };
    type: "documents" | "customization";
}

export function CompanySettingsForm({ settings, type }: Props) {
    const router = useRouter();
    const [state, formAction, pending] = useActionState(updateCompanySettings, initialState);

    useEffect(() => {
        if (state.success) {
            router.refresh();
        }
    }, [state.success, router]);

    if (type === "documents") {
        return (
            <form action={formAction} className="p-6 rounded-lg border border-border bg-card space-y-4">
                <h3 className="text-lg font-semibold">Configuración de Documentos</h3>

                {state.error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {state.error}
                    </div>
                )}

                {state.success && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                        Configuración guardada exitosamente.
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Prefijo Facturas</label>
                        <input
                            name="invoicePrefix"
                            type="text"
                            defaultValue={settings.invoicePrefix}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Prefijo Cotizaciones</label>
                        <input
                            name="quotationPrefix"
                            type="text"
                            defaultValue={settings.quotationPrefix}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Notas predeterminadas en facturas</label>
                    <textarea
                        name="invoiceNotes"
                        rows={3}
                        defaultValue={settings.invoiceNotes || ""}
                        placeholder="Notas que aparecerán en todas las facturas..."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Notas predeterminadas en cotizaciones</label>
                    <textarea
                        name="quotationNotes"
                        rows={3}
                        defaultValue={settings.quotationNotes || ""}
                        placeholder="Notas que aparecerán en todas las cotizaciones..."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Términos de pago</label>
                    <textarea
                        name="paymentTerms"
                        rows={2}
                        defaultValue={settings.paymentTerms || ""}
                        placeholder="Términos y condiciones de pago..."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                </div>

                {/* Hidden fields for other settings */}
                <input type="hidden" name="logo" value={settings.logo || ""} />
                <input type="hidden" name="emailFooter" value={settings.emailFooter || ""} />
                <input type="hidden" name="primaryColor" value={settings.primaryColor} />

                <div className="pt-4">
                    <Button type="submit" disabled={pending}>
                        {pending ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </form>
        );
    }

    // Customization
    return (
        <form action={formAction} className="p-6 rounded-lg border border-border bg-card space-y-4">
            <h3 className="text-lg font-semibold">Personalización</h3>

            {state.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {state.error}
                </div>
            )}

            {state.success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                    Configuración guardada exitosamente.
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">URL del Logo</label>
                <input
                    name="logo"
                    type="url"
                    defaultValue={settings.logo || ""}
                    placeholder="https://ejemplo.com/logo.png"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    URL de imagen para el logo (PNG o JPG recomendado).
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Color Principal</label>
                <div className="flex gap-2 items-center">
                    <input
                        name="primaryColor"
                        type="color"
                        defaultValue={settings.primaryColor}
                        className="w-12 h-10 border border-border rounded cursor-pointer"
                    />
                    <input
                        type="text"
                        defaultValue={settings.primaryColor}
                        readOnly
                        className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Pie de email</label>
                <textarea
                    name="emailFooter"
                    rows={3}
                    defaultValue={settings.emailFooter || ""}
                    placeholder="Texto que aparecerá al final de los emails..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
            </div>

            {/* Hidden fields for other settings */}
            <input type="hidden" name="invoicePrefix" value={settings.invoicePrefix} />
            <input type="hidden" name="quotationPrefix" value={settings.quotationPrefix} />
            <input type="hidden" name="invoiceNotes" value={settings.invoiceNotes || ""} />
            <input type="hidden" name="quotationNotes" value={settings.quotationNotes || ""} />
            <input type="hidden" name="paymentTerms" value={settings.paymentTerms || ""} />

            <div className="pt-4">
                <Button type="submit" disabled={pending}>
                    {pending ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>
        </form>
    );
}
