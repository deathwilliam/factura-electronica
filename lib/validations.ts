import { z } from "zod/v4";

// --- Auth ---

export const loginSchema = z.object({
    email: z.email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// --- Clients ---

export const createClientSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.email("Email inválido"),
    phone: z.string().optional().default(""),
    address: z.string().optional().default(""),
    razonSocial: z.string().optional().default(""),
    nit: z.string().optional().default(""),
    nrc: z.string().optional().default(""),
    dui: z.string().optional().default(""),
    giro: z.string().optional().default(""),
    tipo: z.enum(["NATURAL", "JURIDICO"]).default("NATURAL"),
});

// --- Invoice Items ---

export const invoiceItemSchema = z.object({
    description: z.string().min(1, "La descripción es requerida"),
    quantity: z.coerce.number().int().min(1, "Cantidad mínima es 1"),
    price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
});

// --- Invoices ---

export const createInvoiceSchema = z.object({
    clientId: z.string().uuid("Cliente inválido"),
    status: z.enum(["PENDING", "PAID", "OVERDUE"]).default("PENDING"),
    type: z.enum(["CONSUMIDOR_FINAL", "CREDITO_FISCAL"]).default("CONSUMIDOR_FINAL"),
    dueDate: z.coerce.date({ error: "Fecha de vencimiento inválida" }),
    items: z.array(invoiceItemSchema).min(1, "Debe agregar al menos un item"),
});

// --- Settings ---

export const updateSettingsSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.email("Email inválido"),
    razonSocial: z.string().optional().default(""),
    nit: z.string().optional().default(""),
    nrc: z.string().optional().default(""),
    giro: z.string().optional().default(""),
    direccion: z.string().optional().default(""),
    telefono: z.string().optional().default(""),
});

// --- Helper para extraer errores de Zod ---

export function formatZodErrors(error: z.ZodError): string {
    return error.issues.map((issue) => issue.message).join(", ");
}
