# Plan de Demo - Factura Electrónica Premium

## Objetivo
Demostrar el flujo completo del sistema de facturación electrónica para El Salvador, incluyendo gestión de productos, cotizaciones, pagos, gastos, reportes y funcionalidades DTE avanzadas.

---

## Pre-requisitos

### Antes de la demo:
1. **Base de datos limpia** o con datos de prueba preparados
2. **Variables de entorno configuradas** (`.env.local`):
   - `DATABASE_URL` - PostgreSQL/Supabase
   - `MH_SIGNER_URL` - Firmador local (opcional para demo)
   - `MH_API_USER` / `MH_API_PWD` - Credenciales MH (opcional)
3. **Servidor corriendo**: `npm run dev`
4. **Navegador abierto** en `http://localhost:3000`

---

## Guión de la Demo (30-40 minutos)

### Parte 1: Introducción (2 min)
**Pantalla:** Landing page `/`

- Mostrar la página de inicio
- Explicar el propósito: "Sistema completo de facturación electrónica para freelancers y empresas en El Salvador"
- Destacar: Gestión de productos, cotizaciones, pagos, gastos y reportes

---

### Parte 2: Registro de Usuario (2 min)
**Pantalla:** `/register`

1. Click en "Regístrate" o navegar a `/register`
2. Llenar formulario:
   - **Nombre:** "Demo Empresa S.A."
   - **Email:** "demo@empresa.com"
   - **Contraseña:** "demo123456"
3. Click "Registrarse"
4. **Resultado esperado:** Redirección automática al Dashboard

**Punto a destacar:** Auto-login después del registro, sidebar con navegación organizada por secciones

---

### Parte 3: Configuración Fiscal y Sucursales (3 min)
**Pantalla:** `/dashboard/configuracion`

1. Navegar a "Configuración" en el sidebar (sección Sistema)
2. Mostrar las pestañas disponibles:
   - **Datos de Empresa** - Información fiscal
   - **Sucursales** - Establecimientos y puntos de venta
   - **Documentos** - Prefijos y notas predeterminadas
   - **Personalización** - Logo y colores
3. En "Sucursales", crear una sucursal:
   - **Nombre:** "Casa Matriz"
   - **Código:** "0001"
   - **Código POS:** "0001"
   - **Dirección:** "Col. Escalón, San Salvador"
   - Marcar como "Sucursal principal"
4. Click "Crear Sucursal"

**Punto a destacar:** Códigos de establecimiento requeridos por MH para los DTEs

---

### Parte 4: Configurar Perfil Fiscal (2 min)
**Pantalla:** `/dashboard/settings`

1. Navegar a "Perfil" en el sidebar
2. Llenar datos fiscales:
   - **Razón Social:** "Demo Empresa S.A. de C.V."
   - **NIT:** "0614-123456-123-4"
   - **NRC:** "123456-7"
   - **Giro:** "Servicios de Consultoría"
   - **Dirección:** "Col. Escalón, San Salvador"
   - **Teléfono:** "2222-3333"
3. Click "Guardar Cambios"

---

### Parte 5: Crear Catálogo de Productos (3 min)
**Pantalla:** `/dashboard/productos`

1. Navegar a "Productos" en el sidebar (sección Catálogo)
2. Click "+ Nuevo Producto"
3. Crear dos productos/servicios:

**Producto 1:**
   - **Código:** "CONS-001"
   - **Tipo:** Servicio
   - **Nombre:** "Consultoría por Hora"
   - **Precio:** $75.00
   - **Unidad:** Hora
   - Gravado con IVA: ✓

**Producto 2:**
   - **Código:** "DEV-001"
   - **Tipo:** Servicio
   - **Nombre:** "Desarrollo de Software"
   - **Precio:** $1,500.00
   - **Unidad:** Servicio
   - Gravado con IVA: ✓

4. Mostrar la tabla con filtros por tipo (Producto/Servicio)

**Punto a destacar:** Los productos se pueden seleccionar al crear facturas o cotizaciones

---

### Parte 6: Crear Cliente (2 min)
**Pantalla:** `/dashboard/clientes/new`

1. Navegar a "Clientes" → "+ Nuevo Cliente"
2. Llenar formulario:
   - **Nombre:** "Empresa ABC"
   - **Email:** "contacto@empresaabc.com"
   - **Tipo:** Persona Jurídica
   - **NIT:** "0614-987654-321-0"
   - **NRC:** "654321-8"
   - **Razón Social:** "Empresa ABC S.A. de C.V."
3. Click "Guardar Cliente"

---

### Parte 7: Crear Cotización (3 min)
**Pantalla:** `/dashboard/cotizaciones/new`

1. Navegar a "Cotizaciones" → "+ Nueva Cotización"
2. Explicar: "Las cotizaciones permiten enviar propuestas antes de facturar"
3. Llenar formulario:
   - **Cliente:** Seleccionar "Empresa ABC"
   - **Válida hasta:** (30 días en el futuro)
   - **Items:**
     - Seleccionar "Consultoría por Hora" → Cantidad: 20 → $1,500.00
     - Seleccionar "Desarrollo de Software" → Cantidad: 1 → $1,500.00
   - **Notas:** "Propuesta válida por 30 días"
4. Observar cálculo automático: Subtotal $3,000 + IVA $390 = Total $3,390
5. Click "Crear Cotización"
6. Ver detalle de la cotización con opciones:
   - Cambiar estado (Enviada, Aceptada, Rechazada)
   - **Convertir a Factura** ← Destacar esta función

**Punto a destacar:** Workflow completo de cotización → factura

---

### Parte 8: Crear Factura con Productos (3 min)
**Pantalla:** `/dashboard/facturas/new`

1. Navegar a "Facturas" → "+ Nueva Factura"
2. Llenar formulario:
   - **Cliente:** Seleccionar "Empresa ABC"
   - **Tipo:** "Crédito Fiscal"
   - **Items:** Seleccionar productos del catálogo
3. Click "Guardar Factura"
4. Ver detalle y descargar PDF

**Punto a destacar:** Los productos del catálogo facilitan la facturación

---

### Parte 9: Registrar Pagos (3 min)
**Pantalla:** `/dashboard/pagos`

1. Navegar a "Pagos" en el sidebar (sección Finanzas)
2. Click "+ Registrar Pago"
3. Seleccionar la factura creada
4. Mostrar información de la factura (monto total, saldo pendiente)
5. Registrar un pago parcial:
   - **Monto:** $1,000.00
   - **Método:** Transferencia
   - **Referencia:** "TRF-12345"
6. Click "Registrar Pago"
7. Observar que el estado de la factura cambia a "Pago Parcial"
8. Registrar segundo pago por el saldo restante
9. Observar que el estado cambia a "Pagada"

**Punto a destacar:** Control de pagos parciales con historial

---

### Parte 10: Gestión de Gastos (3 min)
**Pantalla:** `/dashboard/gastos`

1. Navegar a "Gastos" en el sidebar
2. Click "Categorías" para crear categorías:
   - "Servicios" (color azul)
   - "Oficina" (color verde)
   - "Transporte" (color naranja)
3. Click "+ Nuevo Gasto"
4. Registrar gastos:
   - **Descripción:** "Internet mensual"
   - **Monto:** $45.00
   - **Categoría:** Servicios
   - **Proveedor:** "Claro"
   - **Deducible:** ✓
5. Ver resumen con total de gastos por categoría

**Punto a destacar:** Clasificación de gastos para contabilidad y declaraciones

---

### Parte 11: Reportes y Análisis (4 min)
**Pantalla:** `/dashboard/reportes`

1. Navegar a "Reportes" en el sidebar
2. Mostrar las pestañas disponibles:

**Pestaña Ventas:**
   - Total de facturas y monto
   - IVA débito fiscal
   - Gráfico por estado y tipo
   - Detalle de facturas

**Pestaña Clientes:**
   - Ranking de clientes por volumen
   - Montos pagados vs pendientes

**Pestaña Gastos:**
   - Total de gastos
   - Distribución por categoría (con colores)
   - Montos deducibles

**Pestaña Utilidad:**
   - Ingresos vs Gastos
   - Utilidad bruta
   - Margen de ganancia (%)
   - Gráfico mensual

3. Demostrar filtros por fecha
4. Explicar que los datos se pueden exportar a CSV

**Punto a destacar:** Visión completa del negocio para toma de decisiones

---

### Parte 12: Proceso DTE (3 min)
**Pantalla:** `/dashboard/facturas/[id]`

1. Ir al detalle de una factura
2. Click en "Generar, Firmar y Enviar DTE"
3. Explicar el proceso:
   - Generación de JSON según especificación MH
   - Firma digital
   - Transmisión al Ministerio de Hacienda
4. Mostrar el Número de Control y Código de Generación

**Punto a destacar:** Cumplimiento total con normativa MH El Salvador

---

### Parte 13: Anulación de DTE (2 min)
**Pantalla:** `/dashboard/anulaciones`

1. Navegar a "Anulaciones" en el sidebar (sección DTE)
2. Explicar: "Para anular un DTE ya transmitido"
3. Click "+ Nueva Anulación"
4. Mostrar:
   - Solo facturas transmitidas disponibles
   - Motivos de anulación según MH:
     - Solicitud del receptor
     - Error en facturación
     - Devolución de mercadería
5. Crear una solicitud (sin enviar)

**Punto a destacar:** Proceso formal de invalidación según normativa

---

### Parte 14: Modo Contingencia (2 min)
**Pantalla:** `/dashboard/contingencia`

1. Navegar a "Contingencia" en el sidebar
2. Explicar: "Cuando no hay conexión a internet o MH no disponible"
3. Mostrar el botón "Iniciar Modo Contingencia"
4. Explicar el flujo:
   - Se registran facturas localmente
   - Se acumulan en un lote
   - Al recuperar conexión, se transmiten todas juntas
5. Mostrar historial de contingencias

**Punto a destacar:** El negocio no se detiene por problemas de conexión

---

### Parte 15: Dashboard Principal (2 min)
**Pantalla:** `/dashboard`

1. Navegar al Dashboard
2. Mostrar tarjetas de resumen:
   - Ingresos totales
   - Facturas del mes
   - Clientes activos
3. Mostrar gráfico de ingresos por mes
4. Mostrar actividad reciente

**Punto a destacar:** Vista ejecutiva del negocio

---

### Parte 16: Cierre (2 min)

Resumir todas las funcionalidades:

| Módulo | Funcionalidad |
|--------|---------------|
| **Productos** | Catálogo con precios y unidades |
| **Cotizaciones** | Propuestas convertibles a factura |
| **Facturas** | CF y CCF con items dinámicos |
| **Pagos** | Registro parcial/total con métodos |
| **Gastos** | Control con categorías y deducibles |
| **Reportes** | Ventas, clientes, gastos, utilidad |
| **DTE** | Generación, firma y transmisión MH |
| **Anulaciones** | Invalidación formal de DTEs |
| **Contingencia** | Facturación offline |
| **Configuración** | Sucursales, prefijos, personalización |

---

## Datos de Prueba Sugeridos

### Usuario Demo
```
Email: demo@facturapremium.com
Password: demo123456
Razón Social: Demo Corp S.A. de C.V.
NIT: 0614-010101-101-0
NRC: 100001-1
```

### Productos de Prueba
```
1. CONS-001 - Consultoría por Hora ($75/hora)
2. DEV-001 - Desarrollo de Software ($1,500/servicio)
3. SOP-001 - Soporte Técnico Mensual ($200/mes)
4. CAP-001 - Capacitación ($500/día)
```

### Clientes de Prueba
```
1. Juan Pérez (Natural)
   - DUI: 01234567-8

2. Empresa XYZ S.A. (Jurídico)
   - NIT: 0614-020202-202-0
   - NRC: 200002-2

3. Comercial ABC (Jurídico)
   - NIT: 0614-030303-303-0
   - NRC: 300003-3
```

### Categorías de Gastos
```
1. Servicios (azul) - Internet, teléfono, hosting
2. Oficina (verde) - Papelería, suministros
3. Transporte (naranja) - Combustible, parqueo
4. Marketing (púrpura) - Publicidad, diseño
```

---

## Rutas de Demo Rápida

### Demo Mínima (10 min)
1. `/register` - Crear cuenta
2. `/dashboard/clientes/new` - Crear cliente
3. `/dashboard/facturas/new` - Crear factura
4. `/dashboard/facturas/[id]` - Ver PDF
5. `/dashboard` - Ver resumen

### Demo Financiera (15 min)
1. Crear productos en `/dashboard/productos`
2. Crear factura con productos
3. Registrar pagos parciales
4. Registrar gastos con categorías
5. Ver reportes de utilidad

### Demo DTE Completa (20 min)
1. Configurar datos fiscales y sucursales
2. Crear factura tipo CCF
3. Generar y transmitir DTE
4. Mostrar anulaciones
5. Explicar contingencia

---

## Troubleshooting Durante la Demo

### Si el DTE falla:
- Explicar que requiere conexión al firmador local y API de MH
- Mostrar el JSON generado en la base de datos
- Destacar modo contingencia como alternativa

### Si hay errores de validación:
- Los mensajes son claros y en español
- Demostrar cómo el sistema guía al usuario

### Si la sesión expira:
- Mostrar la redirección automática al login
- Explicar la protección de rutas

---

## Checklist Pre-Demo

- [ ] Base de datos accesible
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Variables de entorno configuradas
- [ ] Navegador en modo incógnito
- [ ] Datos de prueba preparados (opcional)
- [ ] Conexión a internet estable
- [ ] Pantalla/proyector configurado

---

## Duración Total Estimada

| Tipo | Duración | Contenido |
|------|----------|-----------|
| **Demo mínima** | 10 min | Registro → Factura → PDF |
| **Demo estándar** | 20 min | + Productos, Pagos, Gastos |
| **Demo completa** | 35 min | + Reportes, DTE, Contingencia |
| **Demo + preguntas** | 45 min | Todo + sesión de Q&A |
