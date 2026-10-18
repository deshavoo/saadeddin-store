import type { CartProduct } from "@/lib/cart";

// أنواع بسيطة قابلة للتمرير من Server Component إلى Client Component

export interface OccasionProductView extends CartProduct {
    note: string | null;
    badge: string | null;
    /** كمية هذا المنتج داخل باقة المناسبة */
    qty: number;
}

export interface OccasionView {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    image: string;
    products: OccasionProductView[];
}
