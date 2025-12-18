import { Button } from "@/components/ui/Button";

export function Header() {
    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
            <div className="md:hidden">
                {/* Mobile menu trigger placeholder */}
                <span className="text-xl">☰</span>
            </div>

            <div className="flex-1 max-w-xl mx-4 hidden md:block">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar facturas, clientes..."
                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                    />
                    <span className="absolute left-3 top-2.5 text-muted-foreground">🔍</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                    🔔
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <Button size="sm" variant="outline">Ayuda</Button>
            </div>
        </header>
    );
}
