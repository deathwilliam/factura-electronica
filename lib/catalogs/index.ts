// Catálogos del Ministerio de Hacienda - El Salvador
// Exportación centralizada de todos los catálogos

export * from "./departamentos";
export * from "./municipios";
export * from "./actividades";
export * from "./unidades-medida";
export * from "./tributos";
export * from "./formas-pago";

// CAT-002: Tipo de Ítem
export const tiposItem = [
    { codigo: 1, nombre: "Bienes" },
    { codigo: 2, nombre: "Servicios" },
    { codigo: 3, nombre: "Ambos (Bienes y Servicios)" },
    { codigo: 4, nombre: "Otros tributos por ítem" },
];

// CAT-003: Tipo de Documento de Identificación
export const tiposDocumentoId = [
    { codigo: "36", nombre: "NIT", descripcion: "Número de Identificación Tributaria" },
    { codigo: "13", nombre: "DUI", descripcion: "Documento Único de Identidad" },
    { codigo: "02", nombre: "Carnet de Residente", descripcion: "Carnet de Residente" },
    { codigo: "03", nombre: "Pasaporte", descripcion: "Pasaporte" },
    { codigo: "37", nombre: "Otro", descripcion: "Otro tipo de documento" },
];

// CAT-004: Tipo de Modelo de Facturación
export const tiposModelo = [
    { codigo: 1, nombre: "Modelo de facturación previo" },
    { codigo: 2, nombre: "Modelo de facturación diferido" },
];

// CAT-005: Tipo de Transmisión
export const tiposTransmision = [
    { codigo: 1, nombre: "Transmisión normal" },
    { codigo: 2, nombre: "Transmisión por contingencia" },
];

// CAT-009: Tipo de Establecimiento
export const tiposEstablecimiento = [
    { codigo: "01", nombre: "Sucursal / Agencia" },
    { codigo: "02", nombre: "Casa Matriz" },
    { codigo: "04", nombre: "Bodega" },
    { codigo: "07", nombre: "Punto de venta" },
    { codigo: "20", nombre: "Otro" },
];

// CAT-011: Tipo de DTE
export const tiposDTE = [
    { codigo: "01", nombre: "Factura", descripcion: "Factura Electrónica" },
    { codigo: "03", nombre: "Comprobante de Crédito Fiscal", descripcion: "CCF Electrónico" },
    { codigo: "04", nombre: "Nota de Remisión", descripcion: "Nota de Remisión Electrónica" },
    { codigo: "05", nombre: "Nota de Crédito", descripcion: "Nota de Crédito Electrónica" },
    { codigo: "06", nombre: "Nota de Débito", descripcion: "Nota de Débito Electrónica" },
    { codigo: "07", nombre: "Comprobante de Retención", descripcion: "Comprobante de Retención Electrónico" },
    { codigo: "08", nombre: "Comprobante de Liquidación", descripcion: "Comprobante de Liquidación Electrónico" },
    { codigo: "09", nombre: "Documento Contable de Liquidación", descripcion: "DCL Electrónico" },
    { codigo: "11", nombre: "Factura de Exportación", descripcion: "Factura de Exportación Electrónica" },
    { codigo: "14", nombre: "Factura de Sujeto Excluido", descripcion: "FSE Electrónica" },
    { codigo: "15", nombre: "Comprobante de Donación", descripcion: "Comprobante de Donación Electrónico" },
];

// CAT-018: Tipo de Invalidación
export const tiposInvalidacion = [
    { codigo: 1, nombre: "Anulación de la operación" },
    { codigo: 2, nombre: "Anulación por error en información" },
    { codigo: 3, nombre: "Anulación por resarcimiento/devolución" },
];

// CAT-020: Tipo de Contingencia
export const tiposContingencia = [
    { codigo: 1, nombre: "No hay conexión a internet" },
    { codigo: 2, nombre: "Servicio del MH no disponible" },
    { codigo: 3, nombre: "Falla en el sistema del contribuyente" },
    { codigo: 4, nombre: "Corte de energía eléctrica" },
    { codigo: 5, nombre: "Otro (especificar)" },
];

// CAT-022: Tipo de Servicio Médico (para FSE)
export const tiposServicioMedico = [
    { codigo: 1, nombre: "Consulta médica" },
    { codigo: 2, nombre: "Hospitalización" },
    { codigo: 3, nombre: "Cirugía" },
    { codigo: 4, nombre: "Laboratorio clínico" },
    { codigo: 5, nombre: "Rayos X" },
    { codigo: 6, nombre: "Otro" },
];

// CAT-023: Título de Bienes Remitidos
export const titulosBienesRemitidos = [
    { codigo: "01", nombre: "Propio" },
    { codigo: "02", nombre: "Consignación" },
    { codigo: "03", nombre: "Otros" },
];

// CAT-024: Tipo de Persona
export const tiposPersona = [
    { codigo: 1, nombre: "Natural", descripcion: "Persona natural" },
    { codigo: 2, nombre: "Jurídica", descripcion: "Persona jurídica (empresa)" },
];

// Ambiente
export const ambientes = [
    { codigo: "00", nombre: "Pruebas", descripcion: "Ambiente de pruebas" },
    { codigo: "01", nombre: "Producción", descripcion: "Ambiente de producción" },
];

// Helper para obtener tipo DTE
export function getTipoDTE(codigo: string) {
    return tiposDTE.find((t) => t.codigo === codigo);
}

export function getTipoDocumentoId(codigo: string) {
    return tiposDocumentoId.find((t) => t.codigo === codigo);
}

export function getTipoEstablecimiento(codigo: string) {
    return tiposEstablecimiento.find((t) => t.codigo === codigo);
}
