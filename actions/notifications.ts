"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications(options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { notifications: [], total: 0, unreadCount: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.user.id };

    if (options?.unreadOnly) {
        where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
            where: { userId: session.user.id, read: false },
        }),
    ]);

    return {
        notifications,
        total,
        unreadCount,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getUnreadNotificationCount() {
    const session = await auth();
    if (!session?.user?.id) {
        return 0;
    }

    return prisma.notification.count({
        where: { userId: session.user.id, read: false },
    });
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId: session.user.id },
    });

    if (!notification) {
        return { success: false, error: "Notificación no encontrada" };
    }

    await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true, readAt: new Date() },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true, readAt: new Date() },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteNotification(notificationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autenticado" };
    }

    const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId: session.user.id },
    });

    if (!notification) {
        return { success: false, error: "Notificación no encontrada" };
    }

    await prisma.notification.delete({ where: { id: notificationId } });

    revalidatePath("/dashboard");
    return { success: true };
}

// ============================================
// Crear notificaciones (uso interno)
// ============================================

export async function createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
}) {
    return prisma.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link || null,
        },
    });
}

// Tipos de notificación (uso interno)
const notificationTypes = {
    INVOICE_DUE: "Factura por vencer",
    INVOICE_OVERDUE: "Factura vencida",
    PAYMENT_RECEIVED: "Pago recibido",
    DTE_SENT: "DTE transmitido",
    DTE_ERROR: "Error en DTE",
    QUOTATION_EXPIRED: "Cotización expirada",
    SYSTEM: "Sistema",
};

export async function getNotificationTypes() {
    return notificationTypes;
}
