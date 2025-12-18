import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-primary">Factura<span className="text-foreground">Premium</span></div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Características</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Precios</Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonios</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary hidden md:block">Iniciar Sesión</Link>
            <Link href="/dashboard">
              <Button>Comenzar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-6">
              ✨ La nueva era de facturación
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
              Facturación electrónica inteligente <br />
              <span className="text-primary">para negocios modernos</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Simplifica tus finanzas con nuestra plataforma todo en uno. Emite facturas, gestiona clientes y automatiza tus impuestos en segundos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/25">Empezar Ahora</Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">Ver Demo</Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-card">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Diseñado para freelancers y empresas que buscan eficiencia y profesionalismo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Facturación Ilimitada", icon: "📄", desc: "Crea y envía facturas sin límites. Personalízalas con tu marca." },
                { title: "Automatización Fiscal", icon: "⚖️", desc: "Cálculos automáticos de impuestos y reportes listos para declarar." },
                { title: "Pagos en Línea", icon: "💳", desc: "Acepta tarjetas de crédito y transferencias directamente desde tus facturas." },
                { title: "Gestión de Clientes", icon: "👥", desc: "CRM integrado para mantener toda la información de tus clientes organizada." },
                { title: "Reportes en Tiempo Real", icon: "📊", desc: "Visualiza el estado de tu negocio con dashboards interactivos." },
                { title: "Soporte 24/7", icon: "🛟", desc: "Equipo de expertos listos para ayudarte en cualquier momento." },
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-secondary py-12 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground text-sm">© 2024 Factura Electrónica Premium. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Privacidad</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Términos</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
