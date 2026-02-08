// CAT-015: Tributos
// Fuente: Ministerio de Hacienda - DGII

export interface Tributo {
    codigo: string;
    nombre: string;
    descripcion: string;
    porcentaje?: number;
    aplicaA: ("CF" | "CCF" | "EXPORT" | "FSE")[]; // Tipos de DTE que aplican
}

export const tributos: Tributo[] = [
    // IVA
    {
        codigo: "20",
        nombre: "IVA",
        descripcion: "Impuesto al Valor Agregado 13%",
        porcentaje: 13,
        aplicaA: ["CCF", "CF"],
    },

    // Retenciones
    {
        codigo: "C3",
        nombre: "FOVIAL",
        descripcion: "Fondo de Conservación Vial",
        porcentaje: 0.20, // $0.20 por galón
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "59",
        nombre: "Turismo",
        descripcion: "Contribución Especial para la Promoción del Turismo",
        porcentaje: 5,
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "71",
        nombre: "Bebidas Alcohólicas",
        descripcion: "Impuesto Específico a Bebidas Alcohólicas",
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "72",
        nombre: "Bebidas Gaseosas",
        descripcion: "Impuesto Específico a Bebidas Gaseosas",
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "73",
        nombre: "Tabaco",
        descripcion: "Impuesto Específico al Tabaco",
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "74",
        nombre: "Armas",
        descripcion: "Impuesto Específico a Armas de Fuego y Municiones",
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "75",
        nombre: "Pirotécnicos",
        descripcion: "Impuesto Específico a Productos Pirotécnicos",
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "A1",
        nombre: "COTRANS",
        descripcion: "Contribución Especial para el Transporte Público",
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "A8",
        nombre: "Ad-valorem",
        descripcion: "Impuesto Ad-valorem Bebidas Alcohólicas",
        porcentaje: 8,
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "C8",
        nombre: "Bomberos",
        descripcion: "Contribución Especial Cuerpo de Bomberos",
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "D1",
        nombre: "DAI",
        descripcion: "Derecho Arancelario a la Importación",
        aplicaA: ["CCF"],
    },
    {
        codigo: "D5",
        nombre: "Retención IVA",
        descripcion: "Retención del Impuesto al Valor Agregado 1%",
        porcentaje: 1,
        aplicaA: ["CCF"],
    },
    {
        codigo: "D4",
        nombre: "Percepción IVA",
        descripcion: "Percepción del Impuesto al Valor Agregado 1%",
        porcentaje: 1,
        aplicaA: ["CCF"],
    },
    {
        codigo: "A5",
        nombre: "Retención Renta",
        descripcion: "Retención del Impuesto sobre la Renta 10%",
        porcentaje: 10,
        aplicaA: ["CCF", "FSE"],
    },
    {
        codigo: "22",
        nombre: "Renta Servicios",
        descripcion: "Retención Impuesto sobre la Renta por Servicios",
        porcentaje: 10,
        aplicaA: ["CCF"],
    },

    // Impuestos especiales
    {
        codigo: "57",
        nombre: "CESC",
        descripcion: "Contribución Especial para la Seguridad Ciudadana",
        aplicaA: ["CCF", "CF"],
    },
    {
        codigo: "90",
        nombre: "ISR Definitivo",
        descripcion: "Impuesto sobre la Renta Definitivo",
        aplicaA: ["EXPORT"],
    },

    // Otros
    {
        codigo: "00",
        nombre: "Sin tributo",
        descripcion: "Operación sin tributos específicos",
        aplicaA: ["CF", "CCF", "EXPORT", "FSE"],
    },
];

// Tributo principal para IVA
export const TRIBUTO_IVA = "20";
export const TRIBUTO_RETENCION_IVA = "D5";
export const TRIBUTO_PERCEPCION_IVA = "D4";
export const TRIBUTO_RETENCION_RENTA = "A5";

export function getTributoByCodigo(codigo: string): Tributo | undefined {
    return tributos.find((t) => t.codigo === codigo);
}

export function getTributosParaTipoDTE(tipo: "CF" | "CCF" | "EXPORT" | "FSE"): Tributo[] {
    return tributos.filter((t) => t.aplicaA.includes(tipo));
}

export function calcularIVA(montoGravado: number): number {
    return Number((montoGravado * 0.13).toFixed(2));
}

export function calcularRetencionIVA(montoGravado: number): number {
    return Number((montoGravado * 0.01).toFixed(2));
}

export function calcularRetencionRenta(monto: number): number {
    return Number((monto * 0.10).toFixed(2));
}

// Estructura para el JSON del DTE
export interface TributoResumen {
    codigo: string;
    descripcion: string;
    valor: number;
}

export function crearTributoResumen(codigo: string, valor: number): TributoResumen {
    const tributo = getTributoByCodigo(codigo);
    return {
        codigo,
        descripcion: tributo?.descripcion || "",
        valor: Number(valor.toFixed(2)),
    };
}
