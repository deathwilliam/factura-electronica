"use client";

import { Button } from "@/components/ui/Button";
import { generateDTE } from "@/actions/dte";
import { useState } from "react";

export function GenerateDTEButton({ invoiceId }: { invoiceId: string }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await generateDTE(invoiceId);
            if (response.success) {
                setResult("✅ DTE Generado: " + response.dte?.identificacion.numeroControl);
            } else {
                setResult("❌ Error: " + response.error);
            }
        } catch (e) {
            setResult("❌ Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button onClick={handleGenerate} disabled={loading} variant="outline" className="w-full">
                {loading ? "Generando JSON..." : "Generar DTE (JSON)"}
            </Button>
            {result && <div className="text-xs font-mono p-2 bg-slate-100 rounded">{result}</div>}
        </div>
    );
}
