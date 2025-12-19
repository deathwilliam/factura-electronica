
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ status: 'ok', message: 'Database connection successful' }, { status: 200 });
    } catch (error) {
        console.error('Health Check Error:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
