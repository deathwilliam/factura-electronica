import Link from "next/link";

export function Sidebar() {
    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: "📊" },
        { label: "Facturas", href: "/dashboard/facturas", icon: "📄" },
        { label: "Clientes", href: "/dashboard/clientes", icon: "👥" },
        { label: "Configuración", href: "/dashboard/settings", icon: "⚙️" },
    ];

    return (
        <aside className="w-64 border-r border-border bg-card h-screen hidden md:block fixed left-0 top-0">
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-bold text-primary">Factura<span className="text-foreground">Premium</span></h1>
            </div>
            <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all"
                    >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                        JD
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">Juan Doe</p>
                        <p className="text-xs text-muted-foreground truncate">Premium Plan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
