"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// --- Interfaces DTE (El Salvador) ---

interface DTE_Identificacion {
    version: number;
    ambiente: string;
    tipoDte: string;
    numeroControl: string;
    codigoGeneracion: string;
    tipoModelo: number;
    tipoOperacion: number;
    fecEmi: string;
    horEmi: string;
    tipoMoneda: string;
}

interface DTE_Direccion {
    departamento: string;
    municipio: string;
    complemento: string;
}

interface DTE_Emisor {
    nit: string;
    nrc: string;
    nombre: string;
    codActividad: string;
    descActividad: string;
    nombreComercial: string;
    tipoEstablecimiento: string;
    direccion: DTE_Direccion;
    telefono: string;
    correo: string;
}

interface DTE_Receptor {
    tipoDocumento: string; // 36: NIT, 13: DUI
    numDocumento: string;
    nrc: string | null;
    nombre: string;
    codActividad: string | null;
    descActividad: string | null;
    direccion: DTE_Direccion | null;
    telefono: string | null;
    correo: string;
}

interface DTE_CuerpoDocumento {
    numItem: number;
    tipoItem: number;
    numeroDocumento: string | null;
    cantidad: number;
    codigo: string | null;
    codTributo: string | null;
    uniMedida: number;
    descripcion: string;
    precioUni: number;
    montoDescu: number;
    ventaNoSuj: number;
    ventaExenta: number;
    ventaGravada: number;
    tributos: string[] | null;
    psv: number;
    noGravado: number;
    ivaItem: number;
}

interface DTE_Resumen {
    totalNoSuj: number;
    totalExenta: number;
    totalGravada: number;
    subTotalVentas: number;
    descuNoSuj: number;
    descuExenta: number;
    descuGravada: number;
    porcentajeDescuento: number;
    totalDescu: number;
    tributos: { codigo: string; descripcion: string; valor: number }[] | null;
    subTotal: number;
    ivaRete1: number;
    reteRenta: number;
    montoTotalOperacion: number;
    totalNoGravado: number;
    totalPagar: number;
    totalLetras: string;
    saldoFavor: number;
    condicionOperacion: number; // 1: Contado, 2: Crédito
}

export interface DTE_Factura {
    identificacion: DTE_Identificacion;
    documentoRelacionado: null;
    emisor: DTE_Emisor;
    receptor: DTE_Receptor;
    otrosDocumentos: null;
    ventaTercero: null;
    cuerpoDocumento: DTE_CuerpoDocumento[];
    resumen: DTE_Resumen;
    extension: null;
    apendice: null;
}

// --- Helper Functions ---

function generateUUID(): string {
    return crypto.randomUUID().toUpperCase();
}

function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

function formatTime(date: Date): string {
    return date.toTimeString().split(" ")[0]; // HH:MM:SS
}

// --- Main Action ---

export async function generateDTE(invoiceId: string): Promise<{ success: boolean; dte?: DTE_Factura; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("No autorizado");

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                client: true,
                user: true,
                items: true,
            },
        });

        if (!invoice) throw new Error("Factura no encontrada");

        const user = invoice.user;
        const client = invoice.client;

        // Validación básica de datos del emisor
        if (!user.nit || !user.nrc) {
            return { success: false, error: "Datos del emisor incompletos (NIT/NRC faltantes en Configuración)" };
        }

        const codigoGeneracion = generateUUID();
        const numeroControl = `DTE-01-M001P001-${Math.floor(Math.random() * 1000000000000)}`;

        // Construcción del DTE (Factura - Consumidor Final)
        const dte: DTE_Factura = {
            identificacion: {
                version: 1,
                ambiente: "00", // 00: Pruebas, 01: Producción
                tipoDte: "01", // 01: Factura, 03: CCF
                numeroControl,
                codigoGeneracion,
                tipoModelo: 1, // 1: Previo, 2: Diferido
                tipoOperacion: 1, // 1: Normal
                fecEmi: formatDate(new Date()),
                horEmi: formatTime(new Date()),
                tipoMoneda: "USD",
            },
            documentoRelacionado: null,
            emisor: {
                // @ts-ignore
                nit: user.nit,
                // @ts-ignore
                nrc: user.nrc,
                // @ts-ignore
                nombre: user.razonSocial || user.name,
                codActividad: "00000", // TODO: Obtener de DB
                // @ts-ignore
                descActividad: user.giro || "Otras Actividades",
                // @ts-ignore
                nombreComercial: user.razonSocial || user.name,
                tipoEstablecimiento: "01", // Sucursal / Casa Matriz
                direccion: {
                    departamento: "06", // San Salvador (Default por ahora)
                    municipio: "14", // San Salvador (Default por ahora)
                    // @ts-ignore
                    complemento: user.direccion || "San Salvador",
                },
                // @ts-ignore
                telefono: user.telefono || "00000000",
                correo: user.email,
            },
            receptor: {
                // @ts-ignore
                tipoDocumento: client.dui ? "13" : "36", // 13: DUI, 36: NIT
                // @ts-ignore
                numDocumento: client.dui || client.nit || client.id.substring(0, 8), // Fallback warning
                // @ts-ignore
                nrc: client.nrc,
                nombre: client.name,
                codActividad: null,
                descActividad: null,
                direccion: {
                    departamento: "06",
                    municipio: "14",
                    complemento: client.address || "San Salvador",
                },
                telefono: client.phone,
                correo: client.email,
            },
            otrosDocumentos: null,
            ventaTercero: null,
            cuerpoDocumento: invoice.items.map((item, index) => {
                const precioUni = Number(item.price);
                const cantidad = item.quantity;
                const ventaGravada = precioUni * cantidad;

                return {
                    numItem: index + 1,
                    tipoItem: 1, // 1: Bien, 2: Servicio
                    numeroDocumento: null,
                    cantidad: cantidad,
                    codigo: null,
                    codTributo: null,
                    uniMedida: 59, // 59: Unidad
                    descripcion: item.description,
                    precioUni: precioUni,
                    montoDescu: 0,
                    ventaNoSuj: 0,
                    ventaExenta: 0,
                    ventaGravada: ventaGravada,
                    tributos: null,
                    psv: 0,
                    noGravado: 0,
                    ivaItem: ventaGravada * 0.13 // Solo referencial en FE
                };
            }),
            resumen: {
                totalNoSuj: 0,
                totalExenta: 0,
                totalGravada: Number(invoice.amount),
                subTotalVentas: Number(invoice.amount),
                descuNoSuj: 0,
                descuExenta: 0,
                descuGravada: 0,
                porcentajeDescuento: 0,
                totalDescu: 0,
                tributos: null,
                subTotal: Number(invoice.amount),
                ivaRete1: 0,
                reteRenta: 0,
                montoTotalOperacion: Number(invoice.amount),
                totalNoGravado: 0,
                totalPagar: Number(invoice.amount),
                totalLetras: "DOLARES", // TODO: Implementar conversor
                saldoFavor: 0,
                condicionOperacion: 1, // Contado
            },
            extension: null,
            apendice: null,
        };

        // Actualizar factura con el JSON generado
        await prisma.invoice.update({
            where: { id: invoiceId },
            // @ts-ignore
            data: {
                dteJson: dte as any, // Cast temporal
                generationCode: codigoGeneracion,
                controlNumber: numeroControl,
                type: "01", // Factura
            },
        });

        return { success: true, dte };
    } catch (error) {
        console.error("Error generating DTE:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}
