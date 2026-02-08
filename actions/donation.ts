"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActividadDescripcion } from "@/lib/catalogs";

interface DonationItem {
    description: string;
    quantity: number;
    value: number;
    tipoItem: number;
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

    function convertGroup(n: number): string {
        if (n === 0) return "";
        if (n === 100) return "CIEN";
        let result = "";
        if (n >= 100) {
            result += unidades[Math.floor(n / 100)] + "CIENTOS ";
            n %= 100;
        }
        if (n >= 10) {
            result += decenas[Math.floor(n / 10)];
            if (n % 10 !== 0) result += " Y " + unidades[n % 10];
        } else {
            result += unidades[n];
        }
        return result.trim();
    }

    let text = entero === 0 ? "CERO" : convertGroup(entero);
    return `${text} ${centavos.toString().padStart(2, "0")}/100 DOLARES`;
}

function generateControlNumber(
    sequence: number,
    codEstable: string = "0001",
    codPuntoVenta: string = "001"
): string {
    const prefix = "DTE";
    const tipoDte = "15";
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${tipoDte}-${codEstable}-${codPuntoVenta}-${seq}`;
}

// --- Actions ---

export async function getDonationList(options?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { donations: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.transmissionStatus = options.status;
    }

    const [donations, total] = await Promise.all([
        prisma.donationReceipt.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.donationReceipt.count({ where }),
    ]);

    return {
        donations: donations.map((d) => ({
            ...d,
            amount: Number(d.amount),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function createDonation(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const donorName = formData.get("donorName") as string;
    const donorNit = formData.get("donorNit") as string;
    const donorDui = formData.get("donorDui") as string;
    const donorAddress = formData.get("donorAddress") as string;
    const donorDepartamento = formData.get("donorDepartamento") as string;
    const donorMunicipio = formData.get("donorMunicipio") as string;
    const donorPhone = formData.get("donorPhone") as string;
    const donorEmail = formData.get("donorEmail") as string;
    const recipientName = formData.get("recipientName") as string;
    const recipientNit = formData.get("recipientNit") as string;
    const authorizationNumber = formData.get("authorizationNumber") as string;
    const donationType = formData.get("donationType") as string || "GOODS";
    const itemsJson = formData.get("items") as string;

    if (!donorName || !recipientName || !recipientNit || !itemsJson) {
        return { success: false, error: "Datos incompletos" };
    }

    let items: DonationItem[];
    try {
        items = JSON.parse(itemsJson);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    if (items.length === 0) {
        return { success: false, error: "Debe agregar al menos un item" };
    }

    const amount = items.reduce((sum, item) => sum + item.quantity * item.value, 0);

    const donation = await prisma.donationReceipt.create({
        data: {
            userId: session.user.id,
            donorName,
            donorNit: donorNit || null,
            donorDui: donorDui || null,
            donorAddress: donorAddress || null,
            donorDepartamento: donorDepartamento || null,
            donorMunicipio: donorMunicipio || null,
            donorPhone: donorPhone || null,
            donorEmail: donorEmail || null,
            recipientName,
            recipientNit,
            authorizationNumber: authorizationNumber || null,
            donationType,
            amount,
            items: {
                create: items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    value: item.value,
                    tipoItem: item.tipoItem || 1,
                })),
            },
        },
        include: { items: true },
    });

    revalidatePath("/dashboard/donaciones");
    return { success: true, donationId: donation.id };
}

export async function generateDonationDTE(donationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const donation = await prisma.donationReceipt.findFirst({
        where: { id: donationId, userId: session.user.id },
        include: { items: true },
    });

    if (!donation) {
        return { success: false, error: "Donación no encontrada" };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user?.nit || !user?.nrc) {
        return { success: false, error: "Complete sus datos fiscales (NIT/NRC) en Configuración" };
    }

    const now = new Date();
    const codigoGeneracion = generateUUID();

    const codEstable = "0001";
    const codPuntoVenta = "001";

    const count = await prisma.donationReceipt.count({
        where: { userId: session.user.id, controlNumber: { not: null } },
    });
    const controlNumber = generateControlNumber(count + 1, codEstable, codPuntoVenta);

    const codActividad = user.codActividad || "62010";
    const descActividad = getActividadDescripcion(codActividad) || user.giro || "Programación informática";

    const cuerpoDocumento = donation.items.map((item, idx) => ({
        numItem: idx + 1,
        tipoItem: item.tipoItem,
        cantidad: item.quantity,
        codigo: null,
        descripcion: item.description,
        valorUni: Number(item.value),
        valor: Number(item.value) * item.quantity,
        depreciacion: 0,
    }));

    const totalDonacion = Number(donation.amount);

    const dteJson = {
        identificacion: {
            version: 1,
            ambiente: process.env.DTE_AMBIENTE || "00",
            tipoDte: "15",
            numeroControl: controlNumber,
            codigoGeneracion,
            tipoModelo: 1,
            tipoOperacion: 1,
            fecEmi: formatDate(now),
            horEmi: formatTime(now),
            tipoMoneda: "USD",
        },
        donante: {
            tipoDocumento: donation.donorNit ? "36" : "13",
            numDocumento: donation.donorNit || donation.donorDui || "",
            nombre: donation.donorName,
            codActividad: null,
            descActividad: null,
            direccion: donation.donorAddress ? {
                departamento: donation.donorDepartamento || "06",
                municipio: donation.donorMunicipio || "14",
                complemento: donation.donorAddress,
            } : null,
            telefono: donation.donorPhone || null,
            correo: donation.donorEmail || null,
        },
        donatario: {
            nit: user.nit,
            nrc: user.nrc,
            nombre: user.razonSocial || user.name,
            codActividad,
            descActividad,
            direccion: {
                departamento: user.departamento || "06",
                municipio: user.municipio || "14",
                complemento: user.direccion || "San Salvador",
            },
            telefono: user.telefono || "00000000",
            correo: user.email,
            codDomiciliado: null,
            codPais: null,
        },
        cuerpoDocumento,
        resumen: {
            valorTotal: totalDonacion,
            totalLetras: numberToLetters(totalDonacion),
            pagos: null,
            observaciones: `Donación tipo: ${donation.donationType === "CASH" ? "Efectivo" : donation.donationType === "GOODS" ? "Bienes" : "Servicios"}`,
        },
        apendice: null,
    };

    await prisma.donationReceipt.update({
        where: { id: donationId },
        data: {
            dteJson: JSON.parse(JSON.stringify(dteJson)),
            generationCode: codigoGeneracion,
            controlNumber,
        },
    });

    revalidatePath("/dashboard/donaciones");
    return { success: true };
}

export async function getDonationById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const donation = await prisma.donationReceipt.findFirst({
        where: { id, userId: session.user.id },
        include: { items: true },
    });

    if (!donation) return null;

    return {
        ...donation,
        amount: Number(donation.amount),
        items: donation.items.map((item) => ({
            ...item,
            value: Number(item.value),
        })),
    };
}
