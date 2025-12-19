import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserSettingsForm } from "./user-settings-form";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">Administra tu perfil fiscal y preferencias.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <a href="#" className="bg-primary/10 text-primary px-3 py-2 rounded-md font-medium">Perfil Fiscal</a>
                    <a href="#" className="hover:bg-accent px-3 py-2 rounded-md transition-colors">Preferencias</a>
                </nav>

                <div className="space-y-6">
                    {/* Fiscal Profile Section */}
                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Datos Fiscales (El Salvador)</h3>
                            <p className="text-sm text-muted-foreground">Información requerida para emitir DTEs.</p>
                        </div>

                        {/* @ts-ignore */}
                        <UserSettingsForm user={user} />
                    </div>

                    {/* Preferences Section (Visual Only for now) */}
                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6 opacity-60 pointer-events-none">
                        <div>
                            <h3 className="text-lg font-medium">Preferencias de Facturación</h3>
                            <p className="text-sm text-muted-foreground">Configuración predeterminada (Próximamente).</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                                <div>
                                    <p className="font-medium">IVA (13%)</p>
                                    <p className="text-sm text-muted-foreground">Aplicar automáticamente</p>
                                </div>
                                <input type="checkbox" className="toggle" defaultChecked />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
