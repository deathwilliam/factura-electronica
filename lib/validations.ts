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

// --- Products ---

export const createProductSchema = z.object({
    code: z.string().min(1, "El código es requerido"),
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional().default(""),
    price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    cost: z.coerce.number().optional(),
    type: z.enum(["PRODUCT", "SERVICE"]).default("SERVICE"),
    unit: z.string().default("UNIDAD"),
    taxable: z.coerce.boolean().default(true),
    active: z.coerce.boolean().default(true),
    categoryId: z.string().uuid().optional().nullable(),
});

export const createProductCategorySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional().default(""),
});

// --- Quotations ---

export const quotationItemSchema = z.object({
    productId: z.string().uuid().optional().nullable(),
    description: z.string().min(1, "La descripción es requerida"),
    quantity: z.coerce.number().int().min(1, "Cantidad mínima es 1"),
    price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
    discount: z.coerce.number().min(0).default(0),
});

export const createQuotationSchema = z.object({
    clientId: z.string().uuid("Cliente inválido"),
    validUntil: z.coerce.date({ error: "Fecha de validez inválida" }),
    notes: z.string().optional().default(""),
    discount: z.coerce.number().min(0).default(0),
    items: z.array(quotationItemSchema).min(1, "Debe agregar al menos un item"),
});

// --- Payments ---

export const createPaymentSchema = z.object({
    invoiceId: z.string().uuid("Factura inválida"),
    amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
    method: z.enum(["CASH", "TRANSFER", "CARD", "CHECK", "OTHER"]).default("CASH"),
    reference: z.string().optional().default(""),
    notes: z.string().optional().default(""),
    paymentDate: z.coerce.date().default(() => new Date()),
});

// --- Expenses ---

export const createExpenseCategorySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional().default(""),
    color: z.string().optional().default("#6b7280"),
});

export const createExpenseSchema = z.object({
    description: z.string().min(1, "La descripción es requerida"),
    amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
    date: z.coerce.date().default(() => new Date()),
    categoryId: z.string().uuid().optional().nullable(),
    vendor: z.string().optional().default(""),
    reference: z.string().optional().default(""),
    deductible: z.coerce.boolean().default(true),
});

// --- DTE Invalidation ---

export const createInvalidationSchema = z.object({
    invoiceId: z.string().uuid("Factura inválida"),
    reason: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
    reasonCode: z.coerce.number().int().min(1).max(3),
});

// --- Contingency ---

export const createContingencySchema = z.object({
    reason: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
    reasonCode: z.coerce.number().int().min(1).max(5),
});

// --- Branches ---

export const createBranchSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    code: z.string().length(4, "El código debe tener 4 dígitos"),
    posCode: z.string().length(4, "El código POS debe tener 4 dígitos"),
    address: z.string().min(1, "La dirección es requerida"),
    phone: z.string().optional().default(""),
    isMain: z.coerce.boolean().default(false),
});

// --- Company Settings ---

export const updateCompanySettingsSchema = z.object({
    logo: z.string().optional().nullable(),
    invoicePrefix: z.string().default("FAC"),
    quotationPrefix: z.string().default("COT"),
    invoiceNotes: z.string().optional().default(""),
    quotationNotes: z.string().optional().default(""),
    paymentTerms: z.string().optional().default(""),
    emailFooter: z.string().optional().default(""),
    primaryColor: z.string().default("#3b82f6"),
});

// --- Notifications ---

export const markNotificationReadSchema = z.object({
    notificationId: z.string().uuid("Notificación inválida"),
});

// --- Helper para extraer errores de Zod ---

export function formatZodErrors(error: z.ZodError): string {
    return error.issues.map((issue) => issue.message).join(", ");
}
