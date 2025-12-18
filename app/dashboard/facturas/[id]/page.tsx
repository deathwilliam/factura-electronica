import InvoicePDF from "@/components/invoice/InvoicePDF";
import Link from "next/link";

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
    // In a real app, fetch invoice data by params.id here and pass to comp
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/dashboard/facturas" className="text-sm text-muted-foreground hover:text-primary">← Volver a Facturas</Link>
            </div>
            <InvoicePDF />
        </div>
    );
}
