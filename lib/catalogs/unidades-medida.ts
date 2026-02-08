// CAT-014: Unidades de Medida
// Fuente: Ministerio de Hacienda - DGII

export interface UnidadMedida {
    codigo: number;
    nombre: string;
    abreviatura: string;
}

export const unidadesMedida: UnidadMedida[] = [
    { codigo: 1, nombre: "Metro", abreviatura: "m" },
    { codigo: 2, nombre: "Yarda", abreviatura: "yd" },
    { codigo: 3, nombre: "Vara", abreviatura: "vr" },
    { codigo: 4, nombre: "Pie", abreviatura: "ft" },
    { codigo: 5, nombre: "Pulgada", abreviatura: "in" },
    { codigo: 6, nombre: "Milímetro", abreviatura: "mm" },
    { codigo: 7, nombre: "Centímetro", abreviatura: "cm" },
    { codigo: 8, nombre: "Kilómetro", abreviatura: "km" },
    { codigo: 9, nombre: "Milla", abreviatura: "mi" },
    { codigo: 10, nombre: "Metro cuadrado", abreviatura: "m²" },
    { codigo: 11, nombre: "Hectárea", abreviatura: "ha" },
    { codigo: 12, nombre: "Manzana", abreviatura: "mz" },
    { codigo: 13, nombre: "Vara cuadrada", abreviatura: "vr²" },
    { codigo: 14, nombre: "Pie cuadrado", abreviatura: "ft²" },
    { codigo: 15, nombre: "Metro cúbico", abreviatura: "m³" },
    { codigo: 16, nombre: "Yarda cúbica", abreviatura: "yd³" },
    { codigo: 17, nombre: "Barril", abreviatura: "bbl" },
    { codigo: 18, nombre: "Litro", abreviatura: "L" },
    { codigo: 19, nombre: "Galón", abreviatura: "gal" },
    { codigo: 20, nombre: "Onza fluida", abreviatura: "fl oz" },
    { codigo: 21, nombre: "Mililitro", abreviatura: "mL" },
    { codigo: 22, nombre: "Kilogramo", abreviatura: "kg" },
    { codigo: 23, nombre: "Gramo", abreviatura: "g" },
    { codigo: 24, nombre: "Miligramo", abreviatura: "mg" },
    { codigo: 25, nombre: "Libra", abreviatura: "lb" },
    { codigo: 26, nombre: "Onza", abreviatura: "oz" },
    { codigo: 27, nombre: "Tonelada métrica", abreviatura: "t" },
    { codigo: 28, nombre: "Tonelada corta", abreviatura: "tn" },
    { codigo: 29, nombre: "Quintal", abreviatura: "qq" },
    { codigo: 30, nombre: "Arroba", abreviatura: "@" },
    { codigo: 31, nombre: "Caja", abreviatura: "cj" },
    { codigo: 32, nombre: "Fardo", abreviatura: "fdo" },
    { codigo: 33, nombre: "Rollo", abreviatura: "rll" },
    { codigo: 34, nombre: "Bolsa", abreviatura: "bls" },
    { codigo: 35, nombre: "Saco", abreviatura: "sco" },
    { codigo: 36, nombre: "Botella", abreviatura: "bot" },
    { codigo: 37, nombre: "Carrete", abreviatura: "cte" },
    { codigo: 38, nombre: "Cilindro", abreviatura: "cil" },
    { codigo: 39, nombre: "Lata", abreviatura: "lt" },
    { codigo: 40, nombre: "Paquete", abreviatura: "pqt" },
    { codigo: 41, nombre: "Par", abreviatura: "par" },
    { codigo: 42, nombre: "Docena", abreviatura: "dz" },
    { codigo: 43, nombre: "Ciento", abreviatura: "100" },
    { codigo: 44, nombre: "Millar", abreviatura: "1000" },
    { codigo: 45, nombre: "Gruesa", abreviatura: "grs" },
    { codigo: 46, nombre: "Resma", abreviatura: "rsm" },
    { codigo: 47, nombre: "Juego", abreviatura: "jgo" },
    { codigo: 48, nombre: "Kit", abreviatura: "kit" },
    { codigo: 49, nombre: "Pieza", abreviatura: "pz" },
    { codigo: 50, nombre: "Pliego", abreviatura: "plg" },
    { codigo: 51, nombre: "Segundo", abreviatura: "s" },
    { codigo: 52, nombre: "Minuto", abreviatura: "min" },
    { codigo: 53, nombre: "Hora", abreviatura: "h" },
    { codigo: 54, nombre: "Día", abreviatura: "d" },
    { codigo: 55, nombre: "Semana", abreviatura: "sem" },
    { codigo: 56, nombre: "Mes", abreviatura: "mes" },
    { codigo: 57, nombre: "Año", abreviatura: "año" },
    { codigo: 58, nombre: "Unidad", abreviatura: "u" },
    { codigo: 59, nombre: "Otro (especificar)", abreviatura: "otro" },
];

// Código 99 es para "Otra" - unidad no especificada (legacy)
export const UNIDAD_OTRA = 59;
export const UNIDAD_UNIDAD = 58;
export const UNIDAD_HORA = 53;
export const UNIDAD_DIA = 54;
export const UNIDAD_MES = 56;

export function getUnidadByCodigo(codigo: number): UnidadMedida | undefined {
    return unidadesMedida.find((u) => u.codigo === codigo);
}

export function getUnidadNombre(codigo: number): string {
    return getUnidadByCodigo(codigo)?.nombre || "Otro";
}

export function getUnidadAbreviatura(codigo: number): string {
    return getUnidadByCodigo(codigo)?.abreviatura || "";
}

// Para servicios comunes
export const unidadesServicio: UnidadMedida[] = unidadesMedida.filter((u) =>
    [53, 54, 55, 56, 57, 58, 59].includes(u.codigo)
);

// Para productos comunes
export const unidadesProducto: UnidadMedida[] = unidadesMedida.filter((u) =>
    [18, 22, 23, 25, 31, 34, 40, 41, 42, 49, 58].includes(u.codigo)
);
