"use client";

import { Button } from "@/components/ui/Button";
import {
    startContingency,
    endContingency,
    transmitContingencyBatch,
} from "@/actions/contingency";
import { contingencyReasons } from "@/lib/constants";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

const initialState = { success: false, error: "" };

interface Props {
    mode: "start" | "end" | "transmit";
    batchId?: string;
}

export function ContingencyActions({ mode, batchId }: Props) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [state, formAction, pending] = useActionState(startContingency, initialState);

    const handleEnd = async () => {
        if (confirm("¿Estás seguro de finalizar el modo contingencia?")) {
            const result = await endContingency();
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error);
            }
        }
    };

    const handleTransmit = async () => {
        if (!batchId) return;
        if (confirm("¿Transmitir todas las facturas de este lote al MH?")) {
            const result = await transmitContingencyBatch(batchId);
            if (result.success) {
                alert(`Se transmitieron ${result.transmittedCount} facturas exitosamente.`);
                router.refresh();
            } else {
                alert(result.error);
            }
        }
    };

    if (mode === "end") {
        return (
            <Button onClick={handleEnd} variant="outline">
                Finalizar Contingencia
            </Button>
        );
    }

    if (mode === "transmit") {
        return (
            <Button onClick={handleTransmit} size="sm">
                Transmitir
            </Button>
        );
    }

    // mode === "start"
    if (!showForm) {
        return (
            <Button onClick={() => setShowForm(true)}>
                Iniciar Modo Contingencia
            </Button>
        );
    }

    return (
        <form action={formAction} className="space-y-4 p-4 bg-muted rounded-lg max-w-md">
            {state.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Código de motivo *</label>
                <select
                    name="reasonCode"
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                    <option value="">Seleccionar</option>
                    {contingencyReasons.map((reason) => (
                        <option key={reason.code} value={reason.code}>
                            {reason.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Descripción del motivo *</label>
                <textarea
                    name="reason"
                    rows={2}
                    required
                    minLength={10}
                    placeholder="Describe la situación..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                    {pending ? "Iniciando..." : "Confirmar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
