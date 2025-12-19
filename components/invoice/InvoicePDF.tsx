"use client";

import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

interface InvoicePDFProps {
    invoice?: any;
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!invoiceRef.current) return;

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                backgroundColor: "#ffffff",
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`factura-${invoice?.controlNumber || 'borrador'}.pdf`);
        } catch (e) {
            console.error("Error generating PDF", e);
        }
    };

    if (!invoice) return <div>Cargando factura...</div>;

    const user = invoice.user || {};
    const client = invoice.client || {};
    const items = invoice.items || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleDownload} variant="outline">Descargar PDF</Button>
            </div>

            {/* Printable Area */}
            <div ref={invoiceRef} className="bg-white p-8 md:p-12 border border-gray-200 shadow-sm rounded-none min-h-[800px] text-gray-900">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">FACTURA</h1>
                        <div className="text-sm text-gray-500 mt-1">
                            {invoice.controlNumber ? `Ref: ${invoice.controlNumber}` : 'BORRADOR'}
                        </div>
                        {invoice.generationCode && (
                            <div className="text-xs text-slate-400 mt-2 font-mono">
                                DTE: {invoice.generationCode}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">{user.razonSocial || user.name}</h2>
                        <p className="text-sm text-gray-500">{user.direccion || "Dirección no registrada"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">NRC: {user.nrc || "N/A"}</p>
                    </div>
                </div>

                {/* Client & Date */}
                <div className="flex justify-between mb-12 border-b border-gray-100 pb-8">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Facturado a:</h3>
                        <p className="text-gray-600">{client.name}</p>
                        <p className="text-gray-600 text-sm">{client.address || "Dirección no registrada"}</p>
                        <p className="text-gray-600 text-sm">NIT/DUI: {client.nit || client.dui || "N/A"}</p>
                    </div>
                    <div className="text-right">
                        <div className="mb-2">
                            <span className="text-gray-500 text-sm mr-4">Fecha Emisión:</span>
                            <span className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm mr-4">Vencimiento:</span>
                            <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="text-left py-3 font-semibold">Descripción</th>
                            <th className="text-center py-3 font-semibold width-[100px]">Cant.</th>
                            <th className="text-right py-3 font-semibold width-[150px]">Precio</th>
                            <th className="text-right py-3 font-semibold width-[150px]">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-100">
                                <td className="py-4">{item.description}</td>
                                <td className="text-center py-4">{item.quantity}</td>
                                <td className="text-right py-4">${Number(item.price).toFixed(2)}</td>
                                <td className="text-right py-4 font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>${Number(invoice.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>IVA (13%)</span>
                            <span>Included</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-900">
                            <span>Total</span>
                            <span>${Number(invoice.amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
                    <p>Documento Tributario Electrónico - El Salvador</p>
                    {invoice.generationCode && <p className="mt-1 font-mono text-xs">{invoice.generationCode}</p>}
                </div>
            </div>
        </div>
    );
}
