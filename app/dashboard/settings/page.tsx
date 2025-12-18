import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">Administra tu cuenta y preferencias de la aplicación.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <a href="#" className="bg-primary/10 text-primary px-3 py-2 rounded-md font-medium">General</a>
                    <a href="#" className="hover:bg-accent px-3 py-2 rounded-md transition-colors">Facturación</a>
                    <a href="#" className="hover:bg-accent px-3 py-2 rounded-md transition-colors">Notificaciones</a>
                    <a href="#" className="hover:bg-accent px-3 py-2 rounded-md transition-colors">Seguridad</a>
                </nav>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Perfil de Usuario</h3>
                            <p className="text-sm text-muted-foreground">Información visible para tus clientes.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input label="Nombre de Empresa / Razón Social" defaultValue="Mi Empresa S.A." />
                            <Input label="RUT / ID Fiscal" defaultValue="12345678-9" />
                            <Input label="Correo Electrónico" defaultValue="contacto@miempresa.com" />
                            <Input label="Teléfono" defaultValue="+56 9 1234 5678" />
                        </div>

                        <Button>Guardar Cambios</Button>
                    </div>

                    {/* Preferences Section */}
                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Preferencias de Facturación</h3>
                            <p className="text-sm text-muted-foreground">Configuración predeterminada para tus documentos.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                                <div>
                                    <p className="font-medium">Impuestos Automáticos</p>
                                    <p className="text-sm text-muted-foreground">Calcular IVA automáticamente (19%)</p>
                                </div>
                                <input type="checkbox" className="toggle" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                                <div>
                                    <p className="font-medium">Recordatorios de Vencimiento</p>
                                    <p className="text-sm text-muted-foreground">Enviar correos a clientes 3 días antes</p>
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
