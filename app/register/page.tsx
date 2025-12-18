"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
// import { register } from "@/app/lib/actions";

export default function RegisterPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:block bg-secondary relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary/50" />
                <div className="relative z-10 h-full flex flex-col justify-center p-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-white text-2xl font-bold mb-8">FE</div>
                    <h2 className="text-4xl font-bold text-foreground mb-6">Únete a miles de emprendedores.</h2>
                    <div className="space-y-4">
                        {["Facturación Ilimitada", "Soporte Prioritario", "Reportes Mensuales"].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-sm">✓</div>
                                <span className="font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Crear cuenta</h1>
                        <p className="text-muted-foreground">Comienza tu prueba gratuita de 14 días</p>
                    </div>

                    <form className="space-y-4">
                        <Input
                            label="Nombre Completo"
                            type="text"
                            name="name"
                            placeholder="Juan Pérez"
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="nombre@ejemplo.com"
                            required
                        />
                        <Input
                            label="Contraseña"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                        <Button className="w-full" type="submit">
                            Registrarse
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Inicia Sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
