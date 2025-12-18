"use client";

import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

export default function InvoicePDF() {
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
            pdf.save('factura.pdf');
        } catch (e) {
            console.error("Error generating PDF", e);
        }
    };

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
                        <div className="text-sm text-gray-500 mt-1"># INV-00123</div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">Tu Empresa S.A.</h2>
                        <p className="text-sm text-gray-500">Calle Falsa 123</p>
                        <p className="text-sm text-gray-500">Santiago, Chile</p>
                        <p className="text-sm text-gray-500">contacto@ejemplo.com</p>
                    </div>
                </div>

                {/* Client & Date */}
                <div className="flex justify-between mb-12 border-b border-gray-100 pb-8">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Facturado a:</h3>
                        <p className="text-gray-600">Cliente Ejemplo Ltda.</p>
                        <p className="text-gray-600 text-sm">Av. Libertador 444</p>
                    </div>
                    <div className="text-right">
                        <div className="mb-2">
                            <span className="text-gray-500 text-sm mr-4">Fecha:</span>
                            <span className="font-medium">20 Dic 2025</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm mr-4">Vencimiento:</span>
                            <span className="font-medium">30 Dic 2025</span>
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
                        <tr className="border-b border-gray-100">
                            <td className="py-4">Desarrollo Web - Factura Electrónica App</td>
                            <td className="text-center py-4">1</td>
                            <td className="text-right py-4">$1,500.00</td>
                            <td className="text-right py-4 font-medium">$1,500.00</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-4">Servicios de Consultoría</td>
                            <td className="text-center py-4">5</td>
                            <td className="text-right py-4">$100.00</td>
                            <td className="text-right py-4 font-medium">$500.00</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>$2,000.00</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>IVA (19%)</span>
                            <span>$380.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-900">
                            <span>Total</span>
                            <span>$2,380.00</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
                    <p>Gracias por su preferencia.</p>
                </div>
            </div>
        </div>
    );
}
