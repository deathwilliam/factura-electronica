import { Button } from "@/components/ui/Button";
import { getBranches, getCompanySettings } from "@/actions/branches";
import { getUser } from "@/actions/settings";
import Link from "next/link";
import { CompanySettingsForm } from "./CompanySettingsForm";
import { BranchForm } from "./BranchForm";

export default async function ConfigurationPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const params = await searchParams;
    const tab = params.tab || "empresa";

    const [user, branches, companySettings] = await Promise.all([
        getUser(),
        getBranches(),
        getCompanySettings(),
    ]);

    const tabs = [
        { key: "empresa", label: "Datos de Empresa" },
        { key: "sucursales", label: "Sucursales" },
        { key: "documentos", label: "Documentos" },
        { key: "personalizacion", label: "Personalización" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">Ajustes del sistema y personalización.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
                {tabs.map((t) => (
                    <Link
                        key={t.key}
                        href={`/dashboard/configuracion?tab=${t.key}`}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                            tab === t.key
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            {/* Datos de Empresa */}
            {tab === "empresa" && user && (
                <div className="max-w-2xl">
                    <div className="p-6 rounded-lg border border-border bg-card space-y-4">
                        <h3 className="text-lg font-semibold">Información Fiscal</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Estos datos se utilizan para la emisión de documentos tributarios.
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Razón Social:</span>
                                <p className="font-medium">{user.razonSocial || "-"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">NIT:</span>
                                <p className="font-medium">{user.nit || "-"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">NRC:</span>
                                <p className="font-medium">{user.nrc || "-"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Giro:</span>
                                <p className="font-medium">{user.giro || "-"}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-muted-foreground">Dirección:</span>
                                <p className="font-medium">{user.direccion || "-"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Teléfono:</span>
                                <p className="font-medium">{user.telefono || "-"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link href="/dashboard/settings">
                                <Button variant="outline">Editar Datos Fiscales</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Sucursales */}
            {tab === "sucursales" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Configura los establecimientos y puntos de venta según el Ministerio de Hacienda.
                        </p>
                    </div>

                    <BranchForm />

                    {branches.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground border border-border rounded-lg">
                            No hay sucursales configuradas.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {branches.map((branch) => (
                                <div
                                    key={branch.id}
                                    className={`p-4 rounded-lg border ${branch.isMain ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold">{branch.name}</h4>
                                            {branch.isMain && (
                                                <span className="text-xs text-primary">Principal</span>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${branch.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                            {branch.active ? "Activa" : "Inactiva"}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Código: {branch.code} | POS: {branch.posCode}</p>
                                        <p>{branch.address}</p>
                                        {branch.phone && <p>{branch.phone}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Documentos */}
            {tab === "documentos" && companySettings && (
                <div className="max-w-2xl">
                    <CompanySettingsForm settings={companySettings} type="documents" />
                </div>
            )}

            {/* Personalización */}
            {tab === "personalizacion" && companySettings && (
                <div className="max-w-2xl">
                    <CompanySettingsForm settings={companySettings} type="customization" />
                </div>
            )}
        </div>
    );
}
