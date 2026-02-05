'use server';

import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';
import { loginSchema, registerSchema, formatZodErrors } from '@/lib/validations';

export async function authenticate(prevState: string | undefined, formData: FormData) {
    const parsed = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!parsed.success) {
        return formatZodErrors(parsed.error);
    }

    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciales inválidas.';
                default:
                    return 'Algo salió mal. Intenta de nuevo.';
            }
        }
        throw error;
    }
}

export async function register(prevState: string | undefined, formData: FormData) {
    const parsed = registerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!parsed.success) {
        return formatZodErrors(parsed.error);
    }

    const { name, email, password } = parsed.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return 'El email ya está registrado.';

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        return 'Error al registrar usuario. Intenta de nuevo.';
    }
}
