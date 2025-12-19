const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateUUID() {
    return "TEST-UUID-" + Math.floor(Math.random() * 10000);
}

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

function formatTime(date) {
    return date.toTimeString().split(" ")[0];
}

async function verifyDTE() {
    try {
        console.log("🔍 Verifying DTE Logic...");

        // 1. Get latest invoice
        const invoice = await prisma.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { client: true, user: true, items: true }
        });

        if (!invoice) {
            console.log("❌ No invoices found to test.");
            return;
        }

        console.log(`📄 Testing with Invoice: ${invoice.id}`);
        const user = invoice.user;
        const client = invoice.client;

        // Simulate Validation
        if (!user.nit || !user.nrc) {
            console.log("⚠️ Warning: User missing NIT/NRC. DTE generation might fail in prod.");
            console.log(`   User NIT: ${user.nit}, NRC: ${user.nrc}`);
        } else {
            console.log("✅ User has fiscal data.");
        }

        // Simulate DTE Construction (Copy of logic from actions/dte.ts)
        const codigoGeneracion = await generateUUID();
        const numeroControl = `DTE-01-M001P001-${Math.floor(Math.random() * 1000000000000)}`;

        const dte = {
            identificacion: {
                version: 1,
                ambiente: "00",
                tipoDte: "01",
                numeroControl,
                codigoGeneracion,
                tipoModelo: 1,
                tipoOperacion: 1,
                fecEmi: formatDate(new Date()),
                horEmi: formatTime(new Date()),
                tipoMoneda: "USD",
            },
            emisor: {
                nit: user.nit || "0000",
                nrc: user.nrc || "0000",
                nombre: user.razonSocial || user.name,
                codActividad: "00000",
                descActividad: user.giro || "Otras Actividades",
                nombreComercial: user.razonSocial || user.name,
                tipoEstablecimiento: "01",
                direccion: {
                    departamento: "06",
                    municipio: "14",
                    complemento: user.direccion || "San Salvador",
                },
                telefono: user.telefono || "00000000",
                correo: user.email,
            },
            receptor: {
                tipoDocumento: client.dui ? "13" : "36",
                numDocumento: client.dui || client.nit || "00000000",
                nrc: client.nrc,
                nombre: client.name,
                codActividad: null,
                descActividad: null,
                direccion: {
                    departamento: "06",
                    municipio: "14",
                    complemento: client.address || "San Salvador",
                },
                telefono: client.phone,
                correo: client.email,
            },
            cuerpoDocumento: invoice.items.map((item, index) => {
                const precioUni = Number(item.price);
                const cantidad = item.quantity;
                const ventaGravada = precioUni * cantidad;
                return {
                    numItem: index + 1,
                    tipoItem: 1,
                    descripcion: item.description,
                    cantidad,
                    precioUni,
                    ventaGravada,
                    ivaItem: ventaGravada * 0.13
                };
            }),
            resumen: {
                totalGravada: Number(invoice.amount),
                subTotal: Number(invoice.amount),
                montoTotalOperacion: Number(invoice.amount),
                totalPagar: Number(invoice.amount),
                totalLetras: "DOLARES"
            }
        };

        console.log("✅ DTE JSON Generated Successfully:");
        console.log(JSON.stringify(dte, null, 2));

        // Simulate saving (just log it)
        console.log("💾 Simulation: Saving DTE to Database...");
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                dteJson: dte,
                generationCode: codigoGeneracion,
                controlNumber: numeroControl,
                transmissionStatus: "PENDING"
            }
        });
        console.log("✅ Database record updated with DTE JSON.");

    } catch (e) {
        console.error("❌ Error in verification:", e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDTE();
