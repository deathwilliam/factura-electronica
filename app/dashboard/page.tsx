import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { auth } from "@/auth";
import { Decimal } from "@prisma/client/runtime/library";

interface RecentInvoice {
    id: string;
    amount: Decimal;
    status: string;
    controlNumber: string | null;
    createdAt: Date;
    client: { name: string };
}

async function getStats() {
    const session = await auth();
    if (!session?.user?.id) return { invoiceCount: 0, clientCount: 0, revenue: 0, chartData: [], recentInvoices: [] as RecentInvoice[] };
    const userId = session.user.id;

    try {
        const [invoiceCount, clientCount, paidInvoices, recentInvoices] = await Promise.all([
            prisma.invoice.count({ where: { userId } }),
            prisma.client.count({ where: { userId } }),
            prisma.invoice.findMany({
                where: { userId, status: "PAID" },
                select: { amount: true, date: true },
            }),
            prisma.invoice.findMany({
                where: { userId },
                include: { client: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
        ]);

        const totalRevenue = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const chartData = months.map((name) => ({ name, total: 0 }));

        paidInvoices.forEach((inv) => {
            const monthIndex = new Date(inv.date).getMonth();
            chartData[monthIndex].total += Number(inv.amount);
        });

        return { invoiceCount, clientCount, revenue: totalRevenue, chartData, recentInvoices };
    } catch {
        return { invoiceCount: 0, clientCount: 0, revenue: 0, chartData: [], recentInvoices: [] as RecentInvoice[] };
    }
}

export default async function DashboardPage() {
    const stats = await getStats();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground mt-1">Bienvenido de nuevo, aquí tienes el resumen de hoy.</p>
                </div>
                <Link href="/dashboard/facturas/new">
                    <Button>+ Nueva Factura</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Ingresos Totales</h3>
                    <div className="mt-2 text-2xl font-bold">${Number(stats.revenue).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Facturas pagadas</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Facturas Emitidas</h3>
                    <div className="mt-2 text-2xl font-bold">{stats.invoiceCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total acumulado</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Clientes</h3>
                    <div className="mt-2 text-2xl font-bold">{stats.clientCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total registrados</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-4">Resumen de Ingresos</h3>
                    <div className="h-[350px] w-full">
                        <RevenueChart data={stats.chartData} />
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {stats.recentInvoices.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">
                                No hay actividad reciente.
                            </div>
                        ) : (
                            stats.recentInvoices.map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    href={`/dashboard/facturas/${invoice.id}`}
                                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{invoice.client.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {invoice.controlNumber || "Sin DTE"} · {new Date(invoice.createdAt).toLocaleDateString("es-SV")}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">${Number(invoice.amount).toFixed(2)}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            invoice.status === "PAID" ? "bg-green-100 text-green-700" :
                                            invoice.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                        }`}>
                                            {invoice.status === "PAID" ? "Pagado" : invoice.status === "PENDING" ? "Pendiente" : "Vencido"}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
