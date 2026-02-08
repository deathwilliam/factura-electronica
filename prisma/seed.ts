import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seed de datos de prueba...\n");

    // 1. Crear usuario demo
    const hashedPassword = await bcrypt.hash("demo123456", 10);

    const user = await prisma.user.upsert({
        where: { email: "demo@facturapremium.com" },
        update: {},
        create: {
            name: "Usuario Demo",
            email: "demo@facturapremium.com",
            password: hashedPassword,
            razonSocial: "Demo Corp S.A. de C.V.",
            nit: "0614-010101-101-0",
            nrc: "100001-1",
            giro: "Servicios de Consultoría y Desarrollo",
            direccion: "Col. Escalón, Calle La Reforma #123, San Salvador",
            telefono: "2222-3333",
        },
    });

    console.log(`✅ Usuario creado: ${user.email}`);

    // 2. Crear clientes de prueba
    const cliente1 = await prisma.client.upsert({
        where: { id: "demo-client-1" },
        update: {},
        create: {
            id: "demo-client-1",
            userId: user.id,
            name: "Juan Pérez",
            email: "juan.perez@email.com",
            phone: "7777-1111",
            address: "Res. Los Héroes, Casa #45, San Salvador",
            tipo: "NATURAL",
            dui: "01234567-8",
        },
    });

    const cliente2 = await prisma.client.upsert({
        where: { id: "demo-client-2" },
        update: {},
        create: {
            id: "demo-client-2",
            userId: user.id,
            name: "Empresa XYZ",
            email: "contacto@empresaxyz.com",
            phone: "2555-6666",
            address: "Blvd. Los Próceres #500, Antiguo Cuscatlán",
            tipo: "JURIDICO",
            razonSocial: "Empresa XYZ S.A. de C.V.",
            nit: "0614-020202-202-0",
            nrc: "200002-2",
            giro: "Comercio al por mayor",
        },
    });

    const cliente3 = await prisma.client.upsert({
        where: { id: "demo-client-3" },
        update: {},
        create: {
            id: "demo-client-3",
            userId: user.id,
            name: "Comercial ABC",
            email: "ventas@comercialabc.com",
            phone: "2333-4444",
            address: "Centro Comercial Metrocentro, Local 25",
            tipo: "JURIDICO",
            razonSocial: "Comercial ABC S.A. de C.V.",
            nit: "0614-030303-303-0",
            nrc: "300003-3",
            giro: "Venta de productos electrónicos",
        },
    });

    console.log(`✅ Clientes creados: ${cliente1.name}, ${cliente2.name}, ${cliente3.name}`);

    // 3. Crear facturas de prueba
    const hoy = new Date();
    const hace30dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    const hace15dias = new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000);
    const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const en15dias = new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000);
    const en30dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Factura 1 - Pagada (Consumidor Final)
    const factura1 = await prisma.invoice.create({
        data: {
            userId: user.id,
            clientId: cliente1.id,
            amount: 113.00, // IVA incluido
            status: "PAID",
            type: "CONSUMIDOR_FINAL",
            date: hace30dias,
            dueDate: hace15dias,
            items: {
                create: [
                    { description: "Servicio de mantenimiento básico", quantity: 1, price: 100.00 },
                    { description: "Materiales", quantity: 1, price: 13.00 },
                ],
            },
        },
    });

    // Factura 2 - Pendiente (Crédito Fiscal)
    const factura2 = await prisma.invoice.create({
        data: {
            userId: user.id,
            clientId: cliente2.id,
            amount: 800.00,
            status: "PENDING",
            type: "CREDITO_FISCAL",
            date: hace15dias,
            dueDate: en15dias,
            items: {
                create: [
                    { description: "Consultoría estratégica", quantity: 8, price: 75.00 },
                    { description: "Capacitación al personal", quantity: 1, price: 200.00 },
                ],
            },
        },
    });

    // Factura 3 - Pendiente (Crédito Fiscal)
    const factura3 = await prisma.invoice.create({
        data: {
            userId: user.id,
            clientId: cliente3.id,
            amount: 1500.00,
            status: "PENDING",
            type: "CREDITO_FISCAL",
            date: hace7dias,
            dueDate: en30dias,
            items: {
                create: [
                    { description: "Desarrollo de sitio web corporativo", quantity: 1, price: 1200.00 },
                    { description: "Configuración de hosting y dominio", quantity: 1, price: 150.00 },
                    { description: "Capacitación en administración del sitio", quantity: 3, price: 50.00 },
                ],
            },
        },
    });

    // Factura 4 - Vencida
    const factura4 = await prisma.invoice.create({
        data: {
            userId: user.id,
            clientId: cliente2.id,
            amount: 350.00,
            status: "OVERDUE",
            type: "CREDITO_FISCAL",
            date: hace30dias,
            dueDate: hace7dias,
            items: {
                create: [
                    { description: "Soporte técnico mensual", quantity: 1, price: 250.00 },
                    { description: "Actualizaciones de seguridad", quantity: 2, price: 50.00 },
                ],
            },
        },
    });

    // Factura 5 - Pagada reciente
    const factura5 = await prisma.invoice.create({
        data: {
            userId: user.id,
            clientId: cliente1.id,
            amount: 226.00,
            status: "PAID",
            type: "CONSUMIDOR_FINAL",
            date: hace7dias,
            dueDate: en15dias,
            items: {
                create: [
                    { description: "Reparación de equipo", quantity: 1, price: 150.00 },
                    { description: "Repuestos", quantity: 2, price: 38.00 },
                ],
            },
        },
    });

    console.log(`✅ Facturas creadas: 5 facturas de prueba`);
    console.log(`   - 2 Pagadas (Consumidor Final)`);
    console.log(`   - 2 Pendientes (Crédito Fiscal)`);
    console.log(`   - 1 Vencida (Crédito Fiscal)`);

    // 4. Crear Nota de Crédito
    const notaCredito = await prisma.creditNote.create({
        data: {
            userId: user.id,
            invoiceId: factura1.id,
            clientId: cliente1.id,
            amount: 50.00,
            reason: "Devolución parcial de servicio no utilizado",
            reasonCode: 1, // Devolución
            type: "CONSUMIDOR_FINAL",
            items: {
                create: [
                    { description: "Devolución servicio mantenimiento", quantity: 1, price: 50.00 },
                ],
            },
        },
    });
    console.log(`✅ Nota de Crédito creada: $${notaCredito.amount}`);

    // 5. Crear Nota de Débito
    const notaDebito = await prisma.debitNote.create({
        data: {
            userId: user.id,
            invoiceId: factura2.id,
            clientId: cliente2.id,
            amount: 25.00,
            reason: "Intereses por mora en pago",
            reasonCode: 1, // Intereses
            type: "CREDITO_FISCAL",
            items: {
                create: [
                    { description: "Intereses por mora (15 días)", quantity: 1, price: 25.00 },
                ],
            },
        },
    });
    console.log(`✅ Nota de Débito creada: $${notaDebito.amount}`);

    // 6. Crear Nota de Remisión (traslado de mercadería)
    const notaRemision = await prisma.shippingNote.create({
        data: {
            userId: user.id,
            recipientName: "Bodega Central Demo Corp",
            recipientNit: "0614-010101-101-0",
            recipientAddress: "Zona Industrial, Bodega #5, Soyapango",
            recipientDepartamento: "06",
            recipientMunicipio: "14",
            recipientPhone: "2222-4444",
            driverName: "Carlos Martínez",
            driverDui: "04567890-1",
            vehiclePlate: "P-123-456",
            transportReason: "Traslado entre bodegas para reorganización de inventario",
            items: {
                create: [
                    { description: "Laptops Dell Inspiron 15", quantity: 10, unitValue: 650.00, tipoItem: 1 },
                    { description: "Monitores Samsung 24\"", quantity: 15, unitValue: 180.00, tipoItem: 1 },
                    { description: "Teclados inalámbricos", quantity: 20, unitValue: 25.00, tipoItem: 1 },
                ],
            },
        },
    });
    console.log(`✅ Nota de Remisión creada: ${notaRemision.recipientName}`);

    // 7. Crear Comprobante de Retención
    const retencion = await prisma.withholdingReceipt.create({
        data: {
            userId: user.id,
            supplierName: "Consultores Profesionales S.A. de C.V.",
            supplierNit: "0614-050505-505-0",
            supplierNrc: "500005-5",
            supplierAddress: "Col. San Benito, Calle La Mascota #100",
            supplierDepartamento: "06",
            supplierMunicipio: "14",
            supplierPhone: "2555-1234",
            supplierEmail: "contacto@consultores.com",
            relatedDocType: "03",
            relatedDocNumber: "DTE-03-0001-001-000000000000001",
            relatedDocDate: hace15dias,
            totalSubject: 1000.00,
            ivaWithheld: 10.00, // 1%
            rentaWithheld: 100.00, // 10%
            totalWithheld: 110.00,
            items: {
                create: [
                    { description: "Retención IVA 1% sobre servicios profesionales", withholdingType: "IVA_1", subjectAmount: 1000.00, withheldAmount: 10.00 },
                    { description: "Retención Renta 10% sobre servicios", withholdingType: "RENTA_10", subjectAmount: 1000.00, withheldAmount: 100.00 },
                ],
            },
        },
    });
    console.log(`✅ Comprobante Retención creado: $${retencion.totalWithheld} retenido`);

    // 8. Crear Comprobante de Liquidación
    const liquidacion = await prisma.settlementReceipt.create({
        data: {
            userId: user.id,
            providerName: "Distribuidora El Éxito S.A. de C.V.",
            providerNit: "0614-060606-606-0",
            providerNrc: "600006-6",
            providerAddress: "Blvd. del Hipódromo #250",
            providerDepartamento: "06",
            providerMunicipio: "14",
            providerPhone: "2666-7777",
            providerEmail: "ventas@distribuidora.com",
            periodStart: hace30dias,
            periodEnd: hace7dias,
            grossAmount: 5000.00,
            deductions: 150.00,
            commissions: 250.00,
            netAmount: 4600.00,
            items: {
                create: [
                    { description: "Ventas de productos electrónicos - Semana 1", quantity: 1, unitPrice: 1500.00, amount: 1500.00 },
                    { description: "Ventas de productos electrónicos - Semana 2", quantity: 1, unitPrice: 1800.00, amount: 1800.00 },
                    { description: "Ventas de productos electrónicos - Semana 3", quantity: 1, unitPrice: 1700.00, amount: 1700.00 },
                ],
            },
        },
    });
    console.log(`✅ Comprobante Liquidación creado: $${liquidacion.netAmount} neto`);

    // 9. Crear Documento Contable de Liquidación
    const docContable = await prisma.accountingSettlement.create({
        data: {
            userId: user.id,
            originalEmitterNit: "0614-070707-707-0",
            originalEmitterName: "Proveedores Asociados S.A. de C.V.",
            concept: "Ajuste contable por diferencias en inventario del período",
            amount: 2500.00,
            taxAmount: 325.00,
            totalAmount: 2825.00,
            items: {
                create: [
                    { description: "Ajuste por faltante de inventario", amount: 1500.00 },
                    { description: "Ajuste por mercadería dañada", amount: 1000.00 },
                ],
            },
        },
    });
    console.log(`✅ Documento Contable creado: $${docContable.totalAmount}`);

    // 10. Crear Factura Sujeto Excluido (compra a proveedor sin NIT)
    const fse = await prisma.excludedSubjectInvoice.create({
        data: {
            userId: user.id,
            subjectName: "María del Carmen López",
            subjectDocType: "DUI",
            subjectDocNumber: "02345678-9",
            subjectAddress: "Cantón El Rosario, San Martín",
            subjectDepartamento: "06",
            subjectMunicipio: "17",
            subjectPhone: "7890-1234",
            subjectActivity: "Agricultura y cultivo de hortalizas",
            amount: 450.00,
            items: {
                create: [
                    { description: "Tomates frescos (caja x 25 lb)", quantity: 10, price: 20.00, tipoItem: 1 },
                    { description: "Chiles verdes (caja x 20 lb)", quantity: 5, price: 25.00, tipoItem: 1 },
                    { description: "Cebollas (quintal)", quantity: 2, price: 50.00, tipoItem: 1 },
                ],
            },
        },
    });
    console.log(`✅ Factura Sujeto Excluido creada: $${fse.amount}`);

    // 11. Crear Factura de Exportación
    const exportacion = await prisma.exportInvoice.create({
        data: {
            userId: user.id,
            clientName: "Tech Solutions Inc.",
            clientCountry: "US",
            clientCountryName: "Estados Unidos",
            clientDocNumber: "EIN-12-3456789",
            clientAddress: "1234 Innovation Drive, Austin, TX 78701",
            clientPhone: "+1 512 555 0123",
            clientEmail: "procurement@techsolutions.com",
            exportType: "DEFINITIVE",
            incoterm: "FOB",
            portOfExit: "Puerto de Acajutla",
            destinationCountry: "US",
            amount: 15000.00,
            items: {
                create: [
                    { description: "Software de gestión empresarial - Licencia anual", quantity: 5, price: 2000.00, tipoItem: 2 },
                    { description: "Servicio de implementación remota", quantity: 1, price: 3000.00, tipoItem: 2 },
                    { description: "Soporte técnico 24/7 - 12 meses", quantity: 1, price: 2000.00, tipoItem: 2 },
                ],
            },
        },
    });
    console.log(`✅ Factura Exportación creada: $${exportacion.amount} (${exportacion.clientCountryName})`);

    // 12. Crear Comprobante de Donación
    const donacion = await prisma.donationReceipt.create({
        data: {
            userId: user.id,
            donorName: "Fundación Empresarial para el Desarrollo",
            donorNit: "0614-080808-808-0",
            donorAddress: "Col. Flor Blanca, Calle El Progreso #50",
            donorDepartamento: "06",
            donorMunicipio: "14",
            donorPhone: "2555-8888",
            donorEmail: "direccion@fundacion.org",
            recipientName: "Asociación Pro-Educación El Salvador",
            recipientNit: "0614-090909-909-0",
            authorizationNumber: "MH-DON-2024-001234",
            donationType: "GOODS",
            amount: 3500.00,
            items: {
                create: [
                    { description: "Computadoras portátiles para escuelas rurales", quantity: 5, value: 500.00, tipoItem: 1 },
                    { description: "Proyectores multimedia", quantity: 2, value: 350.00, tipoItem: 1 },
                    { description: "Material didáctico y útiles escolares", quantity: 1, value: 500.00, tipoItem: 1 },
                ],
            },
        },
    });
    console.log(`✅ Comprobante Donación creado: $${donacion.amount}`);

    // Resumen
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Seed completado exitosamente!");
    console.log("=".repeat(50));
    console.log("\n📋 Credenciales de acceso:");
    console.log("   Email: demo@facturapremium.com");
    console.log("   Password: demo123456");
    console.log("\n📊 Datos cargados:");
    console.log(`   - 1 Usuario con datos fiscales completos`);
    console.log(`   - 3 Clientes (1 Natural, 2 Jurídicos)`);
    console.log(`   - 5 Facturas (CF y CCF)`);
    console.log(`   - 1 Nota de Crédito`);
    console.log(`   - 1 Nota de Débito`);
    console.log(`   - 1 Nota de Remisión (DTE-04)`);
    console.log(`   - 1 Comprobante Retención (DTE-07)`);
    console.log(`   - 1 Comprobante Liquidación (DTE-08)`);
    console.log(`   - 1 Documento Contable (DTE-09)`);
    console.log(`   - 1 Factura Exportación (DTE-11)`);
    console.log(`   - 1 Factura Sujeto Excluido (DTE-14)`);
    console.log(`   - 1 Comprobante Donación (DTE-15)`);
    console.log("\n🚀 Inicia el servidor con: npm run dev");
    console.log("🌐 Abre: http://localhost:3000/login\n");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error en seed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
