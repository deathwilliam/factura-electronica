"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { authenticate } from "@/actions/auth";

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
                        <p className="text-muted-foreground">Ingresa tus credenciales para acceder</p>
                    </div>

                    <form action={dispatch} className="space-y-4">
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
                            Iniciar Sesión
                        </Button>
                        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                            {errorMessage && (
                                <p className="text-sm text-red-500">{errorMessage}</p>
                            )}
                        </div>
                    </form>

                    <div className="text-center text-sm">
                        ¿No tienes cuenta?{" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Regístrate
                        </Link>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900 opacity-90" />
                <div className="relative z-10 h-full flex flex-col justify-center p-12 text-white">
                    <h2 className="text-4xl font-bold mb-6">Tu negocio, bajo control.</h2>
                    <p className="text-lg opacity-80 max-w-md">Gestiona facturas, clientes e inventario desde una sola plataforma intuitiva y segura.</p>
                </div>
            </div>
        </div>
    );
}
