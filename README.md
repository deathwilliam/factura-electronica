# Factura Electrónica Premium - El Salvador

Sistema completo de facturación electrónica para El Salvador, compatible con los 11 tipos de DTE del Ministerio de Hacienda.

## Características

- **11 Tipos de DTE Completos** - Todos los documentos tributarios electrónicos
- **Catálogos MH Oficiales** - Departamentos, municipios, actividades económicas
- **Generación de JSON DTE** - Formato oficial del Ministerio de Hacienda
- **Multi-usuario** - Sistema de autenticación con roles
- **Dashboard Completo** - Estadísticas y reportes

## Tipos de DTE Implementados

| Código | Tipo | Descripción |
|--------|------|-------------|
| 01 | Factura | Consumidor Final |
| 03 | CCF | Comprobante de Crédito Fiscal |
| 04 | Nota de Remisión | Traslado de mercadería |
| 05 | Nota de Crédito | Devoluciones y ajustes |
| 06 | Nota de Débito | Cargos adicionales |
| 07 | Comprobante Retención | Retenciones IVA/Renta |
| 08 | Comprobante Liquidación | Liquidación con terceros |
| 09 | Doc. Contable | Documento contable de liquidación |
| 11 | Factura Exportación | Ventas al exterior |
| 14 | FSE | Factura Sujeto Excluido |
| 15 | Comprobante Donación | Donaciones |

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4
- **Backend:** Next.js Server Actions, Prisma 6
- **Database:** PostgreSQL (Supabase)
- **Auth:** NextAuth.js 5 (JWT + Credentials)

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd factura-electronica

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Sincronizar base de datos
npx prisma db push

# Cargar datos de prueba
npx tsx prisma/seed.ts

# Iniciar servidor
npm run dev
```

## Demo

### Credenciales de Acceso
```
Email: demo@facturapremium.com
Password: demo123456
```

### Datos de Prueba Incluidos
- 1 Usuario con datos fiscales completos
- 3 Clientes (1 Natural, 2 Jurídicos)
- 5 Facturas (Consumidor Final y Crédito Fiscal)
- 1 Nota de Crédito
- 1 Nota de Débito
- 1 Nota de Remisión
- 1 Comprobante de Retención
- 1 Comprobante de Liquidación
- 1 Documento Contable
- 1 Factura de Exportación
- 1 Factura Sujeto Excluido
- 1 Comprobante de Donación

### Recargar Datos Demo
```bash
npx tsx prisma/seed.ts
```

## Estructura del Proyecto

```
├── actions/                 # Server Actions
│   ├── invoices.ts         # Facturas CF y CCF
│   ├── credit-notes.ts     # Notas de crédito
│   ├── debit-notes.ts      # Notas de débito
│   ├── shipping-note.ts    # Notas de remisión
│   ├── withholding.ts      # Retenciones
│   ├── settlement.ts       # Liquidaciones
│   ├── accounting-settlement.ts
│   ├── export-invoice.ts   # Exportaciones
│   ├── fse.ts              # Sujeto excluido
│   ├── donation.ts         # Donaciones
│   └── dte.ts              # Generación DTE
├── app/dashboard/          # Páginas del dashboard
├── components/             # Componentes React
├── lib/
│   ├── catalogs/           # Catálogos MH
│   │   ├── departamentos.ts
│   │   ├── municipios.ts
│   │   ├── actividades.ts
│   │   ├── unidades-medida.ts
│   │   ├── tributos.ts
│   │   └── formas-pago.ts
│   ├── constants.ts        # Constantes
│   └── prisma.ts           # Cliente Prisma
└── prisma/
    ├── schema.prisma       # Modelos de datos
    └── seed.ts             # Datos de prueba
```

## Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Panel principal |
| `/dashboard/facturas` | Gestión de facturas |
| `/dashboard/clientes` | Gestión de clientes |
| `/dashboard/notas-credito` | Notas de crédito |
| `/dashboard/notas-debito` | Notas de débito |
| `/dashboard/notas-remision` | Notas de remisión |
| `/dashboard/retenciones` | Comprobantes retención |
| `/dashboard/liquidaciones` | Liquidaciones |
| `/dashboard/doc-contable` | Documentos contables |
| `/dashboard/exportaciones` | Facturas exportación |
| `/dashboard/sujeto-excluido` | FSE |
| `/dashboard/donaciones` | Donaciones |
| `/dashboard/anulaciones` | Anulación de DTEs |
| `/dashboard/contingencia` | Modo contingencia |

## Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="tu-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# DTE
DTE_AMBIENTE="00"  # 00=Pruebas, 01=Producción
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Generar cliente Prisma
npx prisma generate

# Sincronizar esquema
npx prisma db push

# Ver base de datos
npx prisma studio

# Ejecutar seed
npx tsx prisma/seed.ts
```

## Licencia

Privado - Todos los derechos reservados.
