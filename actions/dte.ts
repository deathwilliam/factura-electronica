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
    tipoDocumento: string;
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
    condicionOperacion: number;
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
    return date.toTimeString().split(" ")[0];
}

function numberToLetters(num: number): string {
    const entero = Math.floor(num);
    const centavos = Math.round((num - entero) * 100);

    const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const especiales: Record<number, string> = {
        11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    };

    function convertGroup(n: number): string {
        if (n === 0) return "";
        if (n === 100) return "CIEN";
        if (especiales[n]) return especiales[n];

        let result = "";
        if (n >= 100) {
            result += (n >= 500 && n < 600 ? "QUINIENTOS" :
                n >= 700 && n < 800 ? "SETECIENTOS" :
                    n >= 900 && n < 1000 ? "NOVECIENTOS" :
                        unidades[Math.floor(n / 100)] + "CIENTOS") + " ";
            n %= 100;
        }
        if (n >= 10 && n <= 15 && especiales[n]) {
            result += especiales[n];
        } else if (n >= 10) {
            result += decenas[Math.floor(n / 10)];
            if (n % 10 !== 0) result += " Y " + unidades[n % 10];
        } else {
            result += unidades[n];
        }
        return result.trim();
    }

    let text = "";
    if (entero === 0) {
        text = "CERO";
    } else if (entero >= 1000) {
        const miles = Math.floor(entero / 1000);
        const resto = entero % 1000;
        text = (miles === 1 ? "MIL" : convertGroup(miles) + " MIL");
        if (resto > 0) text += " " + convertGroup(resto);
    } else {
        text = convertGroup(entero);
    }

    return `${text} ${centavos.toString().padStart(2, "0")}/100 DOLARES`;
}

function generateControlNumber(sequence: number): string {
    const prefix = "DTE";
    const type = "01";
    const establishment = "0001";
    const pos = "001";
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${type}-${establishment}-${pos}-${seq}`;
}

// --- Main Actions ---

const MH_SIGNER_URL = process.env.MH_SIGNER_URL || "http://localhost:8081/firmardocumento";
const MH_SIGNER_PWD = process.env.MH_SIGNER_PWD || "";
const MH_API_AUTH_URL = process.env.MH_API_AUTH_URL || "https://apitest.dtes.mh.gob.sv/seguridad/auth";
const MH_API_SEND_URL = process.env.MH_API_SEND_URL || "https://apitest.dtes.mh.gob.sv/fesv/recepciondte";
const MH_API_USER = process.env.MH_API_USER || "";
const MH_API_PWD = process.env.MH_API_PWD || "";

export async function generateDTE(invoiceId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" };
        }

        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, userId: session.user.id },
            include: { client: true, items: true, user: true },
        });

        if (!invoice) {
            return { success: false, error: "Factura no encontrada" };
        }

        if (!invoice.user.nit || !invoice.user.nrc) {
            return { success: false, error: "Completa tus datos fiscales (NIT/NRC) en Configuración antes de generar un DTE" };
        }

        if (invoice.items.length === 0) {
            return { success: false, error: "La factura no tiene items. Agrega al menos un item." };
        }

        const now = new Date();
        const codigoGeneracion = generateUUID();

        // Obtener secuencia para número de control
        const invoiceCount = await prisma.invoice.count({
            where: { userId: session.user.id, controlNumber: { not: null } },
        });
        const controlNumber = generateControlNumber(invoiceCount + 1);

        const tipoDte = invoice.type === "CREDITO_FISCAL" ? "03" : "01";

        // Construir cuerpo del documento
        const cuerpoDocumento: DTE_CuerpoDocumento[] = invoice.items.map((item, idx) => {
            const subtotal = Number(item.price) * item.quantity;
            // Para consumidor final, el IVA está incluido en el precio
            const isCCF = invoice.type === "CREDITO_FISCAL";
            const ventaGravada = isCCF ? subtotal : subtotal;
            const ivaItem = isCCF ? Number((subtotal * 0.13).toFixed(2)) : 0;

            return {
                numItem: idx + 1,
                tipoItem: 1,
                numeroDocumento: null,
                cantidad: item.quantity,
                codigo: null,
                codTributo: null,
                uniMedida: 99,
                descripcion: item.description,
                precioUni: Number(item.price),
                montoDescu: 0,
                ventaNoSuj: 0,
                ventaExenta: 0,
                ventaGravada,
                tributos: isCCF ? ["20"] : null,
                psv: 0,
                noGravado: 0,
                ivaItem,
            };
        });

        const totalGravada = cuerpoDocumento.reduce((s, i) => s + i.ventaGravada, 0);
        const totalIva = cuerpoDocumento.reduce((s, i) => s + i.ivaItem, 0);
        const isCCF = invoice.type === "CREDITO_FISCAL";
        const subTotal = totalGravada;
        const montoTotal = isCCF ? totalGravada + totalIva : totalGravada;

        const clientAddress: DTE_Direccion | null = invoice.client.address
            ? { departamento: "06", municipio: "14", complemento: invoice.client.address }
            : null;

        const dteJson: DTE_Factura = {
            identificacion: {
                version: isCCF ? 3 : 1,
                ambiente: "00",
                tipoDte,
                numeroControl: controlNumber,
                codigoGeneracion,
                tipoModelo: 1,
                tipoOperacion: 1,
                fecEmi: formatDate(now),
                horEmi: formatTime(now),
                tipoMoneda: "USD",
            },
            documentoRelacionado: null,
            emisor: {
                nit: invoice.user.nit,
                nrc: invoice.user.nrc,
                nombre: invoice.user.razonSocial || invoice.user.name,
                codActividad: "62010",
                descActividad: invoice.user.giro || "Servicios",
                nombreComercial: invoice.user.razonSocial || invoice.user.name,
                tipoEstablecimiento: "01",
                direccion: {
                    departamento: "06",
                    municipio: "14",
                    complemento: invoice.user.direccion || "San Salvador",
                },
                telefono: invoice.user.telefono || "00000000",
                correo: invoice.user.email,
            },
            receptor: {
                tipoDocumento: invoice.client.nit ? "36" : "13",
                numDocumento: invoice.client.nit || invoice.client.dui || "00000000-0",
                nrc: invoice.client.nrc || null,
                nombre: invoice.client.razonSocial || invoice.client.name,
                codActividad: null,
                descActividad: null,
                direccion: clientAddress,
                telefono: invoice.client.phone || null,
                correo: invoice.client.email,
            },
            otrosDocumentos: null,
            ventaTercero: null,
            cuerpoDocumento,
            resumen: {
                totalNoSuj: 0,
                totalExenta: 0,
                totalGravada: Number(totalGravada.toFixed(2)),
                subTotalVentas: Number(totalGravada.toFixed(2)),
                descuNoSuj: 0,
                descuExenta: 0,
                descuGravada: 0,
                porcentajeDescuento: 0,
                totalDescu: 0,
                tributos: isCCF
                    ? [{ codigo: "20", descripcion: "Impuesto al Valor Agregado 13%", valor: Number(totalIva.toFixed(2)) }]
                    : null,
                subTotal: Number(subTotal.toFixed(2)),
                ivaRete1: 0,
                reteRenta: 0,
                montoTotalOperacion: Number(montoTotal.toFixed(2)),
                totalNoGravado: 0,
                totalPagar: Number(montoTotal.toFixed(2)),
                totalLetras: numberToLetters(montoTotal),
                saldoFavor: 0,
                condicionOperacion: 1,
            },
            extension: null,
            apendice: null,
        };

        // Guardar en la base de datos
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                dteJson: JSON.parse(JSON.stringify(dteJson)),
                generationCode: codigoGeneracion,
                controlNumber,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error generando DTE:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido al generar DTE" };
    }
}

export async function signDTE(invoiceId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" };
        }

        if (!MH_SIGNER_PWD) {
            return { success: false, error: "Configuración del firmador incompleta (MH_SIGNER_PWD)" };
        }

        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, userId: session.user.id },
            include: { user: true },
        });

        if (!invoice || !invoice.dteJson) {
            return { success: false, error: "Factura o JSON DTE no encontrado" };
        }

        const payload = {
            nit: invoice.user.nit || "00000000000000",
            activo: true,
            passwordPri: MH_SIGNER_PWD,
            dteJson: invoice.dteJson,
        };

        const response = await fetch(MH_SIGNER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `Error del firmador (${response.status}): ${errorText}` };
        }

        const data = await response.json();
        if (data.status !== "OK" || !data.body) {
            return { success: false, error: "Respuesta inválida del firmador" };
        }

        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { dteSigned: data.body },
        });

        return { success: true };
    } catch (error) {
        console.error("Error firmando DTE:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido al firmar" };
    }
}

export async function transmitDTE(invoiceId: string): Promise<{ success: boolean; error?: string; sello?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" };
        }

        if (!MH_API_USER || !MH_API_PWD) {
            return { success: false, error: "Configuración de API MH incompleta (MH_API_USER/MH_API_PWD)" };
        }

        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, userId: session.user.id },
        });

        if (!invoice || !invoice.dteSigned) {
            return { success: false, error: "Factura no encontrada o no firmada" };
        }

        // 1. Autenticación
        const authPayload = new URLSearchParams();
        authPayload.append("user", MH_API_USER);
        authPayload.append("pwd", MH_API_PWD);

        const authRes = await fetch(MH_API_AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: authPayload,
        });

        if (!authRes.ok) {
            return { success: false, error: `Error de autenticación con MH (${authRes.status})` };
        }

        const authData = await authRes.json();
        if (!authData.body?.token) {
            return { success: false, error: "No se recibió token de MH" };
        }

        const token = authData.body.token;

        // 2. Transmisión
        const tipoDte = invoice.type === "CREDITO_FISCAL" ? "03" : "01";
        const sendPayload = {
            ambiente: "00",
            idEnvio: 1,
            version: invoice.type === "CREDITO_FISCAL" ? 3 : 1,
            tipoDte,
            documento: invoice.dteSigned,
            codigoGeneracion: invoice.generationCode,
        };

        const sendRes = await fetch(MH_API_SEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify(sendPayload),
        });

        const sendData = await sendRes.json();

        if (!sendRes.ok || sendData.estado !== "PROCESADO") {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { transmissionStatus: "REJECTED" },
            });
            return { success: false, error: `Rechazado por MH: ${JSON.stringify(sendData.observaciones || sendData)}` };
        }

        const sello = sendData.selloRecibido;

        await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                receptionSeal: sello,
                transmissionStatus: "SENT",
            },
        });

        return { success: true, sello };
    } catch (error) {
        console.error("Error transmitiendo DTE:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido al transmitir" };
    }
}
