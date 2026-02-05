# Plan de Demo - Factura Electrónica Premium

## Objetivo
Demostrar el flujo completo del sistema de facturación electrónica para El Salvador, desde el registro hasta la transmisión de un DTE al Ministerio de Hacienda.

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

## Guión de la Demo (15-20 minutos)

### Parte 1: Introducción (2 min)
**Pantalla:** Landing page `/`

- Mostrar la página de inicio
- Explicar el propósito: "Sistema de facturación electrónica para freelancers y empresas en El Salvador"
- Destacar características principales visibles en la landing

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

**Punto a destacar:** Auto-login después del registro

---

### Parte 3: Configuración Fiscal (3 min)
**Pantalla:** `/dashboard/settings`

1. Navegar a "Configuración" en el sidebar
2. Explicar: "Antes de emitir DTEs, necesitamos configurar los datos fiscales"
3. Llenar datos:
   - **Razón Social:** "Demo Empresa S.A. de C.V."
   - **NIT:** "0614-123456-123-4"
   - **NRC:** "123456-7"
   - **Giro:** "Servicios de Consultoría"
   - **Dirección:** "Col. Escalón, San Salvador"
   - **Teléfono:** "2222-3333"
4. Click "Guardar Cambios"
5. **Resultado esperado:** Mensaje de éxito verde

**Punto a destacar:** Estos datos aparecerán automáticamente en todas las facturas

---

### Parte 4: Crear Cliente (3 min)
**Pantalla:** `/dashboard/clientes/new`

1. Navegar a "Clientes" → "+ Nuevo Cliente"
2. Explicar los tipos de cliente (Natural vs Jurídico)
3. Llenar formulario:
   - **Nombre:** "Cliente Ejemplo"
   - **Email:** "cliente@ejemplo.com"
   - **Teléfono:** "7777-8888"
   - **Tipo:** Persona Jurídica
   - **NIT:** "0614-987654-321-0"
   - **NRC:** "654321-8"
   - **Razón Social:** "Cliente Ejemplo S.A."
4. Click "Guardar Cliente"
5. **Resultado esperado:** Redirección a lista de clientes con tarjeta visible

**Punto a destacar:** Mostrar la tarjeta con badge "Jurídico" y datos fiscales

---

### Parte 5: Crear Factura con Items (4 min)
**Pantalla:** `/dashboard/facturas/new`

1. Navegar a "Facturas" → "+ Nueva Factura"
2. Explicar la interfaz:
   - Selector de cliente
   - Tipo de documento (Consumidor Final vs Crédito Fiscal)
   - Items dinámicos
3. Llenar formulario:
   - **Cliente:** Seleccionar "Cliente Ejemplo"
   - **Tipo:** "Crédito Fiscal"
   - **Fecha Vencimiento:** (seleccionar fecha futura)
   - **Item 1:**
     - Descripción: "Consultoría Técnica"
     - Cantidad: 10
     - Precio: $50.00
   - Click "+ Agregar item"
   - **Item 2:**
     - Descripción: "Soporte Mensual"
     - Cantidad: 1
     - Precio: $200.00
4. Observar cálculo automático del subtotal: $700.00
5. Click "Guardar Factura"
6. **Resultado esperado:** Redirección a lista de facturas

**Punto a destacar:** Cálculo en tiempo real, items dinámicos

---

### Parte 6: Ver Detalle y PDF (2 min)
**Pantalla:** `/dashboard/facturas/[id]`

1. Click en el número de factura en la lista
2. Mostrar el preview del PDF:
   - Header con datos de la empresa
   - Datos del cliente
   - Tabla de items con cantidades y precios
   - Cálculo de IVA (13% separado para CCF)
   - Total
3. Click "Descargar PDF"
4. **Resultado esperado:** Descarga del archivo PDF

**Punto a destacar:** IVA desglosado para Crédito Fiscal vs incluido para Consumidor Final

---

### Parte 7: Generar y Transmitir DTE (3 min)
**Pantalla:** `/dashboard/facturas/[id]`

1. Explicar el proceso de DTE:
   - Paso 1: Generar JSON según especificación MH
   - Paso 2: Firmar digitalmente
   - Paso 3: Transmitir al Ministerio de Hacienda
2. Click en "Generar, Firmar y Enviar DTE"
3. Observar los estados progresivos:
   - "Generando JSON DTE..."
   - "Firmando DTE..."
   - "Transmitiendo a Hacienda..."
4. **Resultado esperado:**
   - Si hay conexión MH: "DTE procesado. Sello: ..."
   - Si no hay conexión: Error explicativo

**Punto a destacar:** El sistema genera automáticamente:
- Código de Generación (UUID)
- Número de Control (DTE-01-0001-001-...)
- JSON completo según especificación MH

---

### Parte 8: Dashboard y Reportes (2 min)
**Pantalla:** `/dashboard`

1. Navegar al Dashboard principal
2. Mostrar:
   - Tarjetas de estadísticas (Ingresos, Facturas, Clientes)
   - Gráfico de ingresos por mes
   - Actividad reciente con enlaces
3. Click en una factura de la actividad reciente

**Punto a destacar:** Vista consolidada del negocio

---

### Parte 9: Filtros y Búsqueda (1 min)
**Pantalla:** `/dashboard/facturas`

1. Mostrar filtros por estado (Todos, Pendiente, Pagado, Vencido)
2. Demostrar búsqueda por cliente
3. Mostrar columna de estado DTE

**Punto a destacar:** Gestión eficiente de documentos

---

### Parte 10: Cierre (1 min)

1. Mostrar botón de cerrar sesión en el sidebar
2. Resumir características:
   - Registro e inicio de sesión seguro
   - Gestión de clientes con datos fiscales
   - Facturación con items dinámicos
   - Generación de PDF profesional
   - Integración con DTE El Salvador
   - Dashboard con estadísticas

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

### Facturas de Prueba
```
1. Factura #1 - Juan Pérez
   - Tipo: Consumidor Final
   - Items: Servicio básico ($100)
   - Estado: Pagado

2. Factura #2 - Empresa XYZ
   - Tipo: Crédito Fiscal
   - Items: Consultoría ($500), Capacitación ($300)
   - Estado: Pendiente

3. Factura #3 - Comercial ABC
   - Tipo: Crédito Fiscal
   - Items: Desarrollo web ($1,500)
   - Estado: Pendiente
```

---

## Troubleshooting Durante la Demo

### Si el DTE falla:
- Explicar que requiere conexión al firmador local y API de MH
- Mostrar el JSON generado en la base de datos (campo `dteJson`)
- Destacar que el sistema está preparado para producción

### Si hay errores de validación:
- Los mensajes de error son claros y en español
- Demostrar cómo el sistema guía al usuario

### Si la sesión expira:
- Mostrar la redirección automática al login
- Explicar la protección de rutas

---

## Checklist Pre-Demo

- [ ] Base de datos accesible
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Variables de entorno configuradas
- [ ] Navegador en modo incógnito (para empezar limpio)
- [ ] Datos de prueba preparados (opcional)
- [ ] Conexión a internet estable
- [ ] Pantalla/proyector configurado

---

## Duración Total Estimada
- **Demo mínima:** 10 minutos (registro → factura → PDF)
- **Demo completa:** 20 minutos (todo el flujo incluyendo DTE)
- **Demo + preguntas:** 30 minutos
