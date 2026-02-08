// CAT-017: Formas de Pago
// Fuente: Ministerio de Hacienda - DGII

export interface FormaPago {
    codigo: string;
    nombre: string;
    requiereReferencia: boolean;
    requierePlazo: boolean;
}

export const formasPago: FormaPago[] = [
    { codigo: "01", nombre: "Billetes y monedas", requiereReferencia: false, requierePlazo: false },
    { codigo: "02", nombre: "Tarjeta Débito", requiereReferencia: true, requierePlazo: false },
    { codigo: "03", nombre: "Tarjeta Crédito", requiereReferencia: true, requierePlazo: true },
    { codigo: "04", nombre: "Cheque", requiereReferencia: true, requierePlazo: false },
    { codigo: "05", nombre: "Transferencia - Depósito Bancario", requiereReferencia: true, requierePlazo: false },
    { codigo: "06", nombre: "Vales", requiereReferencia: false, requierePlazo: false },
    { codigo: "07", nombre: "Pagos con anticipos", requiereReferencia: true, requierePlazo: false },
    { codigo: "08", nombre: "Bitcoin", requiereReferencia: true, requierePlazo: false },
    { codigo: "09", nombre: "Billetera electrónica (Chivo, etc.)", requiereReferencia: true, requierePlazo: false },
    { codigo: "10", nombre: "Dinero electrónico", requiereReferencia: true, requierePlazo: false },
    { codigo: "11", nombre: "Acreditación de cuenta", requiereReferencia: true, requierePlazo: false },
    { codigo: "12", nombre: "Giro bancario", requiereReferencia: true, requierePlazo: false },
    { codigo: "13", nombre: "Letra de cambio", requiereReferencia: true, requierePlazo: true },
    { codigo: "14", nombre: "Otro", requiereReferencia: false, requierePlazo: false },
];

// CAT-016: Condición de la Operación
export interface CondicionOperacion {
    codigo: number;
    nombre: string;
    descripcion: string;
}

export const condicionesOperacion: CondicionOperacion[] = [
    { codigo: 1, nombre: "Contado", descripcion: "Pago inmediato" },
    { codigo: 2, nombre: "A crédito", descripcion: "Pago diferido" },
    { codigo: 3, nombre: "Otro", descripcion: "Otra condición" },
];

// CAT-019: Plazo
export interface Plazo {
    codigo: string;
    nombre: string;
}

export const plazos: Plazo[] = [
    { codigo: "01", nombre: "Día/s" },
    { codigo: "02", nombre: "Mes/es" },
    { codigo: "03", nombre: "Año/s" },
];

// Constantes para uso común
export const FORMA_PAGO_EFECTIVO = "01";
export const FORMA_PAGO_TARJETA_DEBITO = "02";
export const FORMA_PAGO_TARJETA_CREDITO = "03";
export const FORMA_PAGO_CHEQUE = "04";
export const FORMA_PAGO_TRANSFERENCIA = "05";
export const FORMA_PAGO_BITCOIN = "08";
export const FORMA_PAGO_BILLETERA = "09";

export const CONDICION_CONTADO = 1;
export const CONDICION_CREDITO = 2;

export function getFormaPagoByCodigo(codigo: string): FormaPago | undefined {
    return formasPago.find((f) => f.codigo === codigo);
}

export function getFormaPagoNombre(codigo: string): string {
    return getFormaPagoByCodigo(codigo)?.nombre || "";
}

export function getCondicionOperacion(codigo: number): CondicionOperacion | undefined {
    return condicionesOperacion.find((c) => c.codigo === codigo);
}

// Estructura para el JSON del DTE - Pagos
export interface PagoResumen {
    codigo: string;
    montoPago: number;
    referencia: string | null;
    plazo: string | null;
    periodo: number | null;
}

export function crearPagoResumen(
    codigo: string,
    montoPago: number,
    referencia?: string,
    plazo?: string,
    periodo?: number
): PagoResumen {
    const formaPago = getFormaPagoByCodigo(codigo);
    return {
        codigo,
        montoPago: Number(montoPago.toFixed(2)),
        referencia: formaPago?.requiereReferencia && referencia ? referencia : null,
        plazo: formaPago?.requierePlazo && plazo ? plazo : null,
        periodo: formaPago?.requierePlazo && periodo ? periodo : null,
    };
}

// Mapeo de códigos internos a códigos MH
export const mapeoFormasPago: Record<string, string> = {
    CASH: "01",
    TRANSFER: "05",
    CARD: "02",       // Por defecto débito
    CARD_CREDIT: "03",
    CHECK: "04",
    BITCOIN: "08",
    WALLET: "09",
    OTHER: "14",
};

export function convertirFormaPagoInterna(codigoInterno: string): string {
    return mapeoFormasPago[codigoInterno] || "14"; // Default: Otro
}
