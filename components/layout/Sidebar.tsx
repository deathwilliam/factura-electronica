"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: "Principal",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: "📊" },
            { label: "Facturas", href: "/dashboard/facturas", icon: "📄" },
            { label: "Cotizaciones", href: "/dashboard/cotizaciones", icon: "📋" },
            { label: "Clientes", href: "/dashboard/clientes", icon: "👥" },
        ],
    },
    {
        title: "Catálogo",
        items: [
            { label: "Productos", href: "/dashboard/productos", icon: "📦" },
        ],
    },
    {
        title: "Finanzas",
        items: [
            { label: "Pagos", href: "/dashboard/pagos", icon: "💳" },
            { label: "Gastos", href: "/dashboard/gastos", icon: "💸" },
            { label: "Reportes", href: "/dashboard/reportes", icon: "📈" },
        ],
    },
    {
        title: "DTE",
        items: [
            { label: "Anulaciones", href: "/dashboard/anulaciones", icon: "❌" },
            { label: "Contingencia", href: "/dashboard/contingencia", icon: "⚠️" },
        ],
    },
    {
        title: "Sistema",
        items: [
            { label: "Configuración", href: "/dashboard/configuracion", icon: "⚙️" },
            { label: "Perfil", href: "/dashboard/settings", icon: "👤" },
        ],
    },
];

interface SidebarProps {
    userName?: string;
    userEmail?: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const initials = userName
        ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <aside className="w-64 border-r border-border bg-card h-screen hidden md:flex md:flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-bold text-primary">
                    Factura<span className="text-foreground">Premium</span>
                </h1>
            </div>
            <nav className="p-4 flex-1 overflow-y-auto">
                {navSections.map((section) => (
                    <div key={section.title} className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                            {section.title}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                                        isActive(item.href)
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted-foreground hover:text-primary hover:bg-accent"
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                        {initials}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-medium truncate">{userName || "Usuario"}</p>
                        <p className="text-xs text-muted-foreground truncate">{userEmail || ""}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full mt-2 px-4 py-2 text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
