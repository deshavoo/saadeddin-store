"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface OccasionInput {
    id?: string;
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    image: string;
    isActive?: boolean;
    sortOrder?: number;
    products: { productId: string; qty: number }[];
}

// التحقق من أن المستخدم أدمن
async function ensureAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("غير مصرح لك بإجراء هذه العملية.");
    }
}

export async function upsertOccasionAction(data: OccasionInput) {
    try {
        await ensureAdmin();

        const { id, name, slug, tagline, description, image, isActive, sortOrder, products } = data;

        if (id) {
            // 1. تحديث المناسبة وإعادة ربط المنتجات
            await prisma.occasion.update({
                where: { id },
                data: {
                    name,
                    slug,
                    tagline,
                    description,
                    image,
                    isActive: isActive ?? true,
                    sortOrder: sortOrder ?? 0,
                    products: {
                        deleteMany: {}, // مسح العلاقات القديمة
                        create: products.map((p, index) => ({
                            productId: p.productId,
                            qty: p.qty,
                            sortOrder: index,
                        })),
                    },
                },
            });
        } else {
            // 2. إنشاء مناسبة جديدة
            await prisma.occasion.create({
                data: {
                    name,
                    slug,
                    tagline,
                    description,
                    image,
                    isActive: isActive ?? true,
                    sortOrder: sortOrder ?? 0,
                    products: {
                        create: products.map((p, index) => ({
                            productId: p.productId,
                            qty: p.qty,
                            sortOrder: index,
                        })),
                    },
                },
            });
        }

        revalidatePath("/");
        revalidatePath("/occasions");
        revalidatePath("/admin/occasions");

        return { ok: true };
    } catch (err: any) {
        console.error("[upsertOccasionAction]", err);
        return { ok: false, error: err.message || "تعذّر حفظ المناسبة." };
    }
}

export async function deleteOccasionAction(id: string) {
    try {
        await ensureAdmin();

        await prisma.occasion.delete({
            where: { id },
        });

        revalidatePath("/");
        revalidatePath("/occasions");
        revalidatePath("/admin/occasions");

        return { ok: true };
    } catch (err: any) {
        console.error("[deleteOccasionAction]", err);
        return { ok: false, error: "تعذّر حذف المناسبة." };
    }
}

export async function toggleOccasionStatusAction(id: string, currentStatus: boolean) {
    try {
        await ensureAdmin();

        await prisma.occasion.update({
            where: { id },
            data: { isActive: !currentStatus },
        });

        revalidatePath("/");
        revalidatePath("/occasions");
        revalidatePath("/admin/occasions");

        return { ok: true };
    } catch (err: any) {
        return { ok: false, error: "تعذّر تغيير حالة المناسبة." };
    }
}