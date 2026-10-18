import { cache } from "react";
import { db } from "@/lib/db";
import type { OccasionView } from "@/lib/occasion-types";

/**
 * المناسبات الظاهرة الآن: فعّالة، ضمن نافذة التواريخ (إن وُجدت)،
 * ولها منتج فعّال واحد على الأقل. المنتجات غير الفعّالة تُستبعد.
 */
export const getActiveOccasions = cache(async (): Promise<OccasionView[]> => {
    const now = new Date();

    const rows = await db.occasion.findMany({
        where: {
            isActive: true,
            AND: [
                { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
                { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
            ],
            products: { some: { product: { isActive: true } } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
            id: true,
            name: true,
            slug: true,
            tagline: true,
            description: true,
            image: true,
            products: {
                where: { product: { isActive: true } },
                orderBy: { sortOrder: "asc" },
                select: {
                    qty: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            price: true,
                            compareAtPrice: true,
                            note: true,
                            badge: true,
                        },
                    },
                },
            },
        },
    });

    return rows.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        tagline: o.tagline,
        description: o.description,
        image: o.image,
        products: o.products.map(({ qty, product }) => ({
            productId: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            note: product.note,
            badge: product.badge,
            qty,
        })),
    }));
});
