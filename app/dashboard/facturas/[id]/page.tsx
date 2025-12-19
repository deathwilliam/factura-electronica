import InvoicePDF from "@/components/invoice/InvoicePDF";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GenerateDTEButton } from "./generate-dte-button";
import { notFound } from "next/navigation";

export default async function InvoiceDetailsPage({ params }: { params: { id: string } }) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: params.id },
        include: { client: true, items: true, user: true }
    });

    if (!invoice) {
        return notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-2 mb-4">
                <Link href="/dashboard/facturas" className="text-sm text-muted-foreground hover:text-primary">← Volver a Facturas</Link>
                <div className="w-[200px]">
                    <GenerateDTEButton invoiceId={invoice.id} />
                </div>
            </div>
            {/* Dynamic PDF Component */}
            <InvoicePDF invoice={invoice} />
        </div>
    );
}
