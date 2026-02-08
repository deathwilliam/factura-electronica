"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActividadDescripcion, UNIDAD_UNIDAD } from "@/lib/catalogs";

interface ShippingItem {
    description: string;
    quantity: number;
    unitValue: number;
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

function generateControlNumber(
    sequence: number,
    codEstable: string = "0001",
    codPuntoVenta: string = "001"
): string {
    const prefix = "DTE";
    const tipoDte = "04"; // Nota de Remisión
    const seq = sequence.toString().padStart(15, "0");
    return `${prefix}-${tipoDte}-${codEstable}-${codPuntoVenta}-${seq}`;
}

// --- Actions ---

export async function getShippingNoteList(options?: {
    page?: number;
    limit?: number;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { notes: [], total: 0, totalPages: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.status) {
        where.transmissionStatus = options.status;
    }

    const [notes, total] = await Promise.all([
        prisma.shippingNote.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.shippingNote.count({ where }),
    ]);

    return {
        notes: notes.map((n) => ({
            ...n,
            items: n.items.map((i) => ({
                ...i,
                unitValue: Number(i.unitValue),
            })),
        })),
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function createShippingNote(
    prevState: unknown,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const recipientName = formData.get("recipientName") as string;
    const recipientNit = formData.get("recipientNit") as string;
    const recipientNrc = formData.get("recipientNrc") as string;
    const recipientAddress = formData.get("recipientAddress") as string;
    const recipientDepartamento = formData.get("recipientDepartamento") as string;
    const recipientMunicipio = formData.get("recipientMunicipio") as string;
    const recipientPhone = formData.get("recipientPhone") as string;
    const driverName = formData.get("driverName") as string;
    const driverDui = formData.get("driverDui") as string;
    const vehiclePlate = formData.get("vehiclePlate") as string;
    const transportReason = formData.get("transportReason") as string;
    const itemsJson = formData.get("items") as string;

    if (!recipientName || !recipientAddress || !transportReason || !itemsJson) {
        return { success: false, error: "Datos incompletos" };
    }

    let items: ShippingItem[];
    try {
        items = JSON.parse(itemsJson);
    } catch {
        return { success: false, error: "Items inválidos" };
    }

    if (items.length === 0) {
        return { success: false, error: "Debe agregar al menos un item" };
    }

    const note = await prisma.shippingNote.create({
        data: {
            userId: session.user.id,
            recipientName,
            recipientNit: recipientNit || null,
            recipientNrc: recipientNrc || null,
            recipientAddress,
            recipientDepartamento: recipientDepartamento || null,
            recipientMunicipio: recipientMunicipio || null,
            recipientPhone: recipientPhone || null,
            driverName: driverName || null,
            driverDui: driverDui || null,
            vehiclePlate: vehiclePlate || null,
            transportReason,
            items: {
                create: items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitValue: item.unitValue,
                    tipoItem: item.tipoItem || 1,
                })),
            },
        },
        include: { items: true },
    });

    revalidatePath("/dashboard/notas-remision");
    return { success: true, noteId: note.id };
}

export async function generateShippingNoteDTE(noteId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const note = await prisma.shippingNote.findFirst({
        where: { id: noteId, userId: session.user.id },
        include: { items: true },
    });

    if (!note) {
        return { success: false, error: "Nota de remisión no encontrada" };
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

    const count = await prisma.shippingNote.count({
        where: { userId: session.user.id, controlNumber: { not: null } },
    });
    const controlNumber = generateControlNumber(count + 1, codEstable, codPuntoVenta);

    const codActividad = user.codActividad || "62010";
    const descActividad = getActividadDescripcion(codActividad) || user.giro || "Programación informática";

    const cuerpoDocumento = note.items.map((item, idx) => ({
        numItem: idx + 1,
        tipoItem: item.tipoItem,
        cantidad: item.quantity,
        codigo: null,
        uniMedida: UNIDAD_UNIDAD,
        descripcion: item.description,
        precioUni: Number(item.unitValue),
        montoDescu: 0,
        ventaNoSuj: 0,
        ventaExenta: 0,
        ventaGravada: 0,
    }));

    const dteJson = {
        identificacion: {
            version: 1,
            ambiente: process.env.DTE_AMBIENTE || "00",
            tipoDte: "04",
            numeroControl: controlNumber,
            codigoGeneracion,
            tipoModelo: 1,
            tipoOperacion: 1,
            fecEmi: formatDate(now),
            horEmi: formatTime(now),
            tipoMoneda: "USD",
        },
        emisor: {
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
        },
        receptor: {
            nit: note.recipientNit || null,
            nrc: note.recipientNrc || null,
            nombre: note.recipientName,
            direccion: {
                departamento: note.recipientDepartamento || "06",
                municipio: note.recipientMunicipio || "14",
                complemento: note.recipientAddress,
            },
            telefono: note.recipientPhone || null,
        },
        cuerpoDocumento,
        resumen: {
            totalNoSuj: 0,
            totalExenta: 0,
            totalGravada: 0,
            subTotalVentas: 0,
            descuNoSuj: 0,
            descuExenta: 0,
            descuGravada: 0,
            totalDescu: 0,
            subTotal: 0,
            ivaRete1: 0,
            reteRenta: 0,
            montoTotalOperacion: 0,
            totalLetras: "CERO 00/100 DOLARES",
            observaciones: note.transportReason,
        },
        extension: {
            nombEntrega: user.razonSocial || user.name,
            docuEntrega: user.nit,
            nombRecibe: note.recipientName,
            docuRecibe: note.recipientNit || note.recipientNrc || null,
            placaVehiculo: note.vehiclePlate || null,
        },
        apendice: null,
    };

    await prisma.shippingNote.update({
        where: { id: noteId },
        data: {
            dteJson: JSON.parse(JSON.stringify(dteJson)),
            generationCode: codigoGeneracion,
            controlNumber,
        },
    });

    revalidatePath("/dashboard/notas-remision");
    return { success: true };
}

export async function getShippingNoteById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const note = await prisma.shippingNote.findFirst({
        where: { id, userId: session.user.id },
        include: { items: true },
    });

    if (!note) return null;

    return {
        ...note,
        items: note.items.map((item) => ({
            ...item,
            unitValue: Number(item.unitValue),
        })),
    };
}
