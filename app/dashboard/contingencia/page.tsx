import { Button } from "@/components/ui/Button";
import {
    getContingencyBatches,
    getActiveContingency,
    getContingencyInvoices,
} from "@/actions/contingency";
import { contingencyReasons } from "@/lib/constants";
import Link from "next/link";
import { ContingencyActions } from "./ContingencyActions";

const statusLabels: Record<string, { label: string; color: string }> = {
    OPEN: { label: "Activa", color: "bg-yellow-100 text-yellow-700" },
    CLOSED: { label: "Cerrada", color: "bg-blue-100 text-blue-700" },
    TRANSMITTED: { label: "Transmitida", color: "bg-green-100 text-green-700" },
};

export default async function ContingencyPage() {
    const [activeContingency, { batches }, contingencyInvoices] = await Promise.all([
        getActiveContingency(),
        getContingencyBatches(),
        getContingencyInvoices(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Contingencia DTE</h2>
                    <p className="text-muted-foreground">Gestión de facturación en modo contingencia.</p>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Modo Contingencia:</strong> Se utiliza cuando no hay conexión a internet o el servicio
                del Ministerio de Hacienda no está disponible. Las facturas se emiten localmente y se
                transmiten cuando se recupera la conexión.
            </div>

            {/* Estado actual */}
            <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-4">Estado Actual</h3>

                {activeContingency ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                Contingencia Activa
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Desde: {new Date(activeContingency.startDate).toLocaleString("es-SV")}
                            </span>
                        </div>
                        <div className="p-3 bg-muted rounded-md text-sm">
                            <p><strong>Motivo:</strong> {activeContingency.reason}</p>
                            <p><strong>Código:</strong> {contingencyReasons.find((r) => r.code === activeContingency.reasonCode)?.label}</p>
                        </div>
                        <div className="flex gap-3">
                            <ContingencyActions mode="end" />
                            <Link href="/dashboard/facturas/new">
                                <Button variant="outline">Crear Factura en Contingencia</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            No hay contingencia activa. El sistema está operando en modo normal.
                        </p>
                        <ContingencyActions mode="start" />
                    </div>
                )}
            </div>

            {/* Facturas en contingencia */}
            {contingencyInvoices.length > 0 && (
                <div className="p-6 rounded-lg border border-border bg-card">
                    <h3 className="text-lg font-semibold mb-4">
                        Facturas Pendientes de Transmisión ({contingencyInvoices.length})
                    </h3>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-2 text-left">No. Control</th>
                                    <th className="px-4 py-2 text-left">Cliente</th>
                                    <th className="px-4 py-2 text-left">Fecha</th>
                                    <th className="px-4 py-2 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {contingencyInvoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="px-4 py-2 font-mono">{inv.controlNumber || "-"}</td>
                                        <td className="px-4 py-2">{inv.client.name}</td>
                                        <td className="px-4 py-2">{new Date(inv.date).toLocaleDateString("es-SV")}</td>
                                        <td className="px-4 py-2 text-right">${inv.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Historial de lotes */}
            <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-4">Historial de Contingencias</h3>

                {batches.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay registros de contingencia.</p>
                ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-2 text-left">Inicio</th>
                                    <th className="px-4 py-2 text-left">Fin</th>
                                    <th className="px-4 py-2 text-left">Motivo</th>
                                    <th className="px-4 py-2 text-center">Facturas</th>
                                    <th className="px-4 py-2 text-left">Estado</th>
                                    <th className="px-4 py-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {batches.map((batch) => {
                                    const status = statusLabels[batch.status] || statusLabels.OPEN;

                                    return (
                                        <tr key={batch.id}>
                                            <td className="px-4 py-2">
                                                {new Date(batch.startDate).toLocaleString("es-SV")}
                                            </td>
                                            <td className="px-4 py-2">
                                                {batch.endDate
                                                    ? new Date(batch.endDate).toLocaleString("es-SV")
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-2 max-w-xs truncate">
                                                {batch.reason}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {batch.invoiceCount}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {batch.status === "CLOSED" && batch.invoiceCount > 0 && (
                                                    <ContingencyActions mode="transmit" batchId={batch.id} />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
