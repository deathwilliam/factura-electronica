import InvoicePDF from "@/components/invoice/InvoicePDF";
import Link from "next/link";
import { getInvoiceById } from "@/actions/invoices";
import { GenerateDTEButton } from "./generate-dte-button";
import { notFound } from "next/navigation";

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await getInvoiceById(id);

    if (!invoice) {
        return notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-2 mb-4">
                <Link href="/dashboard/facturas" className="text-sm text-muted-foreground hover:text-primary">
                    ← Volver a Facturas
                </Link>
                <div className="w-[250px]">
                    <GenerateDTEButton
                        invoiceId={invoice.id}
                        hasItems={invoice.items.length > 0}
                        alreadySent={invoice.transmissionStatus === "SENT"}
                    />
                </div>
            </div>
            <InvoicePDF invoice={invoice} />
        </div>
    );
}
