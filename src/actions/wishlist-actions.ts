'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// قاموس مؤقت يطابق الحقول الحقيقية لجدول Product في Prisma
const PRODUCTS_MAP: Record<string, { name: string; price: number; image: string; category: string }> = {
    "prod-1": { name: "كيكة الشوكولاتة الفاخرة", price: 350, image: "/images/products/chocolate-cake.jpg", category: "الكيك" },
    "prod-2": { name: "تشيز كيك التوت", price: 280, image: "/images/products/berry-cheesecake.jpg", category: "الكيك" },
    "prod-3": { name: "بوكس الشوكولاتة", price: 420, image: "/images/products/chocolate-box.jpg", category: "الشوكولاتة" },
    "prod-4": { name: "كنافة بالقشطة", price: 240, image: "/images/products/kunafa.jpg", category: "الكنافة" },
    "prod-5": { name: "بقلاوة مشكلة", price: 320, image: "/images/products/baklava.jpg", category: "الحلويات الشرقية" },
    "prod-6": { name: "آيس كريم الفانيليا", price: 120, image: "/images/products/vanillaIceCream.jpg", category: "الآيس كريم" },
    "prod-7": { name: "قهوة عربية", price: 95, image: "/images/products/arabicCoffe.jpg", category: "القهوة" },
    "prod-8": { name: "قهوة تركية", price: 85, image: "/images/products/turkishCoffe.jpg", category: "القهوة" },
};

export async function toggleWishlistAction(productId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: "يجب تسجيل الدخول أولاً لإدارة المفضلة." };
    }

    try {
        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return { error: "المستخدم غير موجود." };

        // 1. التأكد من وجود المنتج في جدول Product بقاعدة البيانات بالاعتماد على الحقول الصحيحة فقط
        const productInfo = PRODUCTS_MAP[productId];
        if (productInfo) {
            await db.product.upsert({
                where: { id: productId },
                update: {},
                create: {
                    id: productId,
                    name: productInfo.name,
                    price: productInfo.price,
                    image: productInfo.image,
                    
                },
            });
        } else {
            const existingProduct = await db.product.findUnique({ where: { id: productId } });
            if (!existingProduct) {
                await db.product.create({
                    data: {
                        id: productId,
                        name: "منتج سعد الدين",
                        price: 100,
                        image: "/images/products/chocolate-cake.jpg", // توفير صورة افتراضية لتوافق الشروط الإجبارية
                    },
                });
            }
        }

        // 2. التحقق مما إذا كان المنتج موجوداً مسبقاً في مفضلة المستخدم
        const existingItem = await db.wishlist.findFirst({
            where: {
                userId: user.id,
                productId: productId,
            },
        });

        if (existingItem) {
            // إزالة من المفضلة
            await db.wishlist.delete({
                where: { id: existingItem.id },
            });
            revalidatePath("/");
            revalidatePath("/profile");
            return { success: "تمت الإزالة من المفضلة", action: "removed" };
        } else {
            // إضافة إلى المفضلة
            await db.wishlist.create({
                data: {
                    userId: user.id,
                    productId: productId,
                },
            });
            revalidatePath("/");
            revalidatePath("/profile");
            return { success: "تمت الإضافة إلى المفضلة", action: "added" };
        }
    } catch (error) {
        console.error("Wishlist error:", error);
        return { error: "حدث خطأ أثناء تحديث المفضلة." };
    }
}