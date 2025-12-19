
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function check() {
    try {
        console.log("Connecting...");
        // Force a connection first
        await prisma.$connect();
        console.log("Connected. Attempting to find first user...");

        // Find a user to attach the client to
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error("No user found!");
            process.exit(1);
        }
        console.log("Found user:", user.id);

        // Attempt to create a client
        console.log("Creating client...");
        const client = await prisma.client.create({
            data: {
                userId: user.id,
                name: "Debug Local Client",
                email: "debug@local.com",
                address: "123 Local St",
                phone: "0000000000"
            }
        });
        console.log("Client created successfully:", client);

    } catch (e) {
        console.error("ERROR DETAIL:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
