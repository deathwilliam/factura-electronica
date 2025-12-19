'use server';

import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciales Inválidas.';
                default:
                    console.error('SignIn Error:', error);
                    return `Algo salió mal: ${error.message}`;
            }
        }
        console.error('Auth Error:', error);
        throw error;
    }
}

export async function register(prevState: string | undefined, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return 'Por favor completa todos los campos.';
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return 'El email ya está registrado.';

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        // Auto login setup effectively requires client-side redirection after success or calling signIn directly here.
        // For simplicity in this flow, we will return 'Success' and let the client redirect, or just invoke signIn directly.
        // Invoking signIn here might throw redirect which is fine.
        await signIn('credentials', formData);

    } catch (error) {
        if (error instanceof AuthError) {
            // Re-throw redirect errors from signIn
            throw error;
        }
        console.error('Registration Error:', error);
        return `Error al registrar usuario: ${error instanceof Error ? error.message : String(error)}`;
    }
}
