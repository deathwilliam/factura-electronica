import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { auth } from "@/auth";

async function getStats() {
    const session = await auth();
    if (!session?.user?.id) return { invoiceCount: 0, clientCount: 0, revenue: 0, chartData: [] };
    const userId = session.user.id;

    try {
        const invoiceCount = await prisma.invoice.count({ where: { userId } });
        const clientCount = await prisma.client.count({ where: { userId } });

        const paidInvoices = await prisma.invoice.findMany({
            where: { userId, status: 'PAID' },
            select: { amount: true, date: true }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalRevenue = paidInvoices.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);

        // Group by Month for Chart
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartData = months.map(name => ({ name, total: 0 }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paidInvoices.forEach((inv: any) => {
            const monthIndex = new Date(inv.date).getMonth();
            chartData[monthIndex].total += Number(inv.amount);
        });

        return { invoiceCount, clientCount, revenue: totalRevenue, chartData };
    } catch (e) {
        return { invoiceCount: 0, clientCount: 0, revenue: 0, chartData: [] };
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
                <div className="flex gap-3">
                    <Button variant="outline">Descargar Reporte</Button>
                    <Link href="/dashboard/facturas/new">
                        <Button>Nueva Factura</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Ingresos Totales</h3>
                    <div className="mt-2 text-2xl font-bold">${Number(stats.revenue).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1 text-green-600">+0% vs mes anterior</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Facturas Emitidas</h3>
                    <div className="mt-2 text-2xl font-bold">{stats.invoiceCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total acumulado</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Clientes Activos</h3>
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
                    <div className="space-y-4 text-center text-muted-foreground py-10">
                        No hay actividad reciente.
                    </div>
                </div>
            </div>
        </div>
    );
}
