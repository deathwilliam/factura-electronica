"use client";

import { Button } from "@/components/ui/Button";
import { generateDTE, signDTE, transmitDTE } from "@/actions/dte";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    invoiceId: string;
    hasItems: boolean;
    alreadySent: boolean;
}

export function GenerateDTEButton({ invoiceId, hasItems, alreadySent }: Props) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const router = useRouter();

    if (alreadySent) {
        return (
            <div className="p-2 rounded bg-green-50 text-green-700 text-xs font-medium text-center">
                DTE enviado y aceptado
            </div>
        );
    }

    if (!hasItems) {
        return (
            <div className="p-2 rounded bg-yellow-50 text-yellow-700 text-xs text-center">
                Agrega items a la factura para generar DTE
            </div>
        );
    }

    const handleProcess = async () => {
        setLoading(true);
        setStatus("Generando JSON DTE...");
        try {
            const genRes = await generateDTE(invoiceId);
            if (!genRes.success) throw new Error(genRes.error);
            setStatus("Firmando DTE...");

            const signRes = await signDTE(invoiceId);
            if (!signRes.success) throw new Error(signRes.error);
            setStatus("Transmitiendo a Hacienda...");

            const transRes = await transmitDTE(invoiceId);
            if (!transRes.success) throw new Error(transRes.error);

            setStatus(`DTE procesado. Sello: ${transRes.sello}`);
            router.refresh();
        } catch (e) {
            setStatus("Error: " + (e instanceof Error ? e.message : "Desconocido"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button onClick={handleProcess} disabled={loading} variant="outline" className="w-full">
                {loading ? "Procesando..." : "Generar, Firmar y Enviar DTE"}
            </Button>
            {status && (
                <div className={`text-xs font-mono p-2 rounded ${status.startsWith("Error") ? "bg-red-50 text-red-700" : status.startsWith("DTE procesado") ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                    {status}
                </div>
            )}
        </div>
    );
}
