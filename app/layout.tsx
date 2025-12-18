import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Factura Premium",
    default: "Factura Electrónica Premium",
  },
  description: "La solución definitiva para tu facturación electrónica. Gestiona clientes, facturas y reportes en un solo lugar.",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://factura-premium.vercel.app",
    title: "Factura Electrónica Premium",
    description: "Gestión inteligente de documentos tributarios.",
    siteName: "Factura Premium",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
