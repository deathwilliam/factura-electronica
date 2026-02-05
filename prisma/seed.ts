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
    console.log(`   - 5 Facturas con items`);
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
