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
