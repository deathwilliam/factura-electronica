// Constantes estáticas del sistema

// Códigos de motivo de anulación según MH El Salvador
export const invalidationReasons = [
    { code: 1, label: "Anulación por solicitud del receptor/comprador" },
    { code: 2, label: "Error en información de facturación" },
    { code: 3, label: "Devolución de mercadería" },
];

// Códigos de motivo de contingencia según MH El Salvador
export const contingencyReasons = [
    { code: 1, label: "Sin conexión a internet" },
    { code: 2, label: "Servicio del MH no disponible" },
    { code: 3, label: "Falla en sistema del contribuyente" },
    { code: 4, label: "Corte de energía eléctrica" },
    { code: 5, label: "Otro (especificar)" },
];

// Métodos de pago
export const paymentMethods = [
    { value: "CASH", label: "Efectivo" },
    { value: "TRANSFER", label: "Transferencia" },
    { value: "CARD", label: "Tarjeta" },
    { value: "CHECK", label: "Cheque" },
    { value: "OTHER", label: "Otro" },
];

// Estados de factura
export const invoiceStatuses = {
    PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    PAID: { label: "Pagada", color: "bg-green-100 text-green-700" },
    PARTIAL: { label: "Pago Parcial", color: "bg-blue-100 text-blue-700" },
    OVERDUE: { label: "Vencida", color: "bg-red-100 text-red-700" },
};

// Estados de cotización
export const quotationStatuses = {
    DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
    SENT: { label: "Enviada", color: "bg-blue-100 text-blue-700" },
    ACCEPTED: { label: "Aceptada", color: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rechazada", color: "bg-red-100 text-red-700" },
    EXPIRED: { label: "Expirada", color: "bg-orange-100 text-orange-700" },
    INVOICED: { label: "Facturada", color: "bg-purple-100 text-purple-700" },
};

// Estados de transmisión DTE
export const transmissionStatuses = {
    PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    SENT: { label: "Transmitido", color: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rechazado", color: "bg-red-100 text-red-700" },
    CONTINGENCY: { label: "Contingencia", color: "bg-orange-100 text-orange-700" },
};

// Motivos de Nota de Crédito
export const creditNoteReasons = [
    { code: 1, label: "Devolución de mercadería" },
    { code: 2, label: "Descuento o bonificación" },
    { code: 3, label: "Ajuste de precio" },
    { code: 4, label: "Anulación de operación" },
    { code: 5, label: "Otros" },
];

// Motivos de Nota de Débito
export const debitNoteReasons = [
    { code: 1, label: "Intereses por mora" },
    { code: 2, label: "Gastos administrativos" },
    { code: 3, label: "Cargo por servicio adicional" },
    { code: 4, label: "Ajuste de precio" },
    { code: 5, label: "Otros" },
];

// Tipos de documento para Sujeto Excluido
export const subjectDocTypes = [
    { value: "DUI", label: "DUI - Documento Único de Identidad" },
    { value: "PASAPORTE", label: "Pasaporte" },
    { value: "CARNET_RESIDENTE", label: "Carnet de Residente" },
    { value: "OTRO", label: "Otro" },
];

// Tipos de retención
export const withholdingTypes = [
    { value: "IVA_1", label: "Retención IVA 1%", rate: 0.01 },
    { value: "RENTA_10", label: "Retención Renta 10%", rate: 0.10 },
    { value: "RENTA_5", label: "Retención Renta 5%", rate: 0.05 },
];

// Incoterms
export const incoterms = [
    { value: "EXW", label: "EXW - Ex Works" },
    { value: "FCA", label: "FCA - Free Carrier" },
    { value: "CPT", label: "CPT - Carriage Paid To" },
    { value: "CIP", label: "CIP - Carriage and Insurance Paid To" },
    { value: "DAP", label: "DAP - Delivered at Place" },
    { value: "DPU", label: "DPU - Delivered at Place Unloaded" },
    { value: "DDP", label: "DDP - Delivered Duty Paid" },
    { value: "FAS", label: "FAS - Free Alongside Ship" },
    { value: "FOB", label: "FOB - Free on Board" },
    { value: "CFR", label: "CFR - Cost and Freight" },
    { value: "CIF", label: "CIF - Cost, Insurance and Freight" },
];

// Países principales para exportación
export const countries = [
    { code: "US", name: "Estados Unidos" },
    { code: "GT", name: "Guatemala" },
    { code: "HN", name: "Honduras" },
    { code: "NI", name: "Nicaragua" },
    { code: "CR", name: "Costa Rica" },
    { code: "PA", name: "Panamá" },
    { code: "MX", name: "México" },
    { code: "CO", name: "Colombia" },
    { code: "PE", name: "Perú" },
    { code: "CL", name: "Chile" },
    { code: "AR", name: "Argentina" },
    { code: "BR", name: "Brasil" },
    { code: "ES", name: "España" },
    { code: "DE", name: "Alemania" },
    { code: "FR", name: "Francia" },
    { code: "IT", name: "Italia" },
    { code: "GB", name: "Reino Unido" },
    { code: "CN", name: "China" },
    { code: "JP", name: "Japón" },
    { code: "CA", name: "Canadá" },
];
