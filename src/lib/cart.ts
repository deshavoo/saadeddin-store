// أنواع وثوابت وحسابات السلة — ملف نقي يُستخدم في الخادم والمتصفح معًا.

/** الشحن مجاني عند بلوغ هذا المبلغ (يطابق نص صفحة المنتج: "للطلبات فوق 299 ر.س") */
export const FREE_SHIPPING_THRESHOLD = 299;
/** رسوم الشحن عند عدم بلوغ الحد المجاني — عدّلها حسب سياسة المتجر */
export const SHIPPING_FEE = 25;
export const MAX_QTY = 20;
export const MAX_LINES = 50;

export interface CartProduct {
    productId: string;
    name: string;
    image: string;
    price: number;
    compareAtPrice: number | null;
}

export interface CartLine extends CartProduct {
    qty: number;
}

export type CartActionResult =
    | { ok: true; lines: CartLine[] }
    | { ok: false; error: string };

export interface CartTotals {
    itemCount: number;
    /** مجموع الأسعار قبل الخصم (يعتمد compareAtPrice إن وجد) */
    originalTotal: number;
    /** خصم العروض = الفرق بين سعر الشطب والسعر الفعلي */
    discount: number;
    /** المجموع بعد الخصم وقبل الشحن */
    subtotal: number;
    shipping: number;
    total: number;
    amountToFreeShipping: number;
    /** نسبة التقدم نحو الشحن المجاني من 0 إلى 100 */
    freeShippingProgress: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const clampQty = (n: number) => {
    const value = Number.isFinite(n) ? Math.floor(n) : 1;
    return Math.max(1, Math.min(MAX_QTY, value));
};

export function calculateTotals(lines: CartLine[]): CartTotals {
    let itemCount = 0;
    let originalTotal = 0;
    let subtotal = 0;

    for (const line of lines) {
        const listPrice =
            line.compareAtPrice != null && line.compareAtPrice > line.price
                ? line.compareAtPrice
                : line.price;
        itemCount += line.qty;
        originalTotal += listPrice * line.qty;
        subtotal += line.price * line.qty;
    }

    originalTotal = round2(originalTotal);
    subtotal = round2(subtotal);

    const discount = round2(originalTotal - subtotal);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const amountToFreeShipping = subtotal === 0 ? FREE_SHIPPING_THRESHOLD : round2(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal));

    return {
        itemCount,
        originalTotal,
        discount,
        subtotal,
        shipping,
        total: round2(subtotal + shipping),
        amountToFreeShipping,
        freeShippingProgress: Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)),
    };
}

export const formatPrice = (value: number) =>
    new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(value);

export const formatCount = (value: number) => new Intl.NumberFormat("ar-SA").format(value);
