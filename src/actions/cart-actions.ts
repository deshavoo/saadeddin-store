"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
    MAX_LINES,
    clampQty,
    type CartActionResult,
    type CartLine,
    type CartProduct,
} from "@/lib/cart";

/* ───────────── مساعدات داخلية ───────────── */

async function currentUserId(): Promise<string | null> {
    const email = (await auth())?.user?.email;
    if (!email) return null;
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    return user?.id ?? null;
}

const isId = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length <= 64;

async function loadLines(userId: string): Promise<CartLine[]> {
    const rows = await db.cartItem.findMany({
        where: { cart: { userId } },
        orderBy: { createdAt: "asc" },
        select: {
            qty: true,
            product: {
                select: { id: true, name: true, image: true, price: true, compareAtPrice: true, isActive: true },
            },
        },
    });

    return rows
        .filter((row) => row.product.isActive)
        .map((row) => ({
            productId: row.product.id,
            name: row.product.name,
            image: row.product.image,
            price: row.product.price,
            compareAtPrice: row.product.compareAtPrice,
            qty: row.qty,
        }));
}

function ensureCart(userId: string) {
    return db.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
        select: { id: true },
    });
}

/** يكتب كمية منتج في سلة المستخدم. يرجع رسالة خطأ أو null عند النجاح. */
async function writeQty(
    userId: string,
    productId: string,
    qty: number,
    mode: "set" | "add"
): Promise<string | null> {
    const product = await db.product.findFirst({
        where: { id: productId, isActive: true },
        select: { id: true },
    });
    if (!product) return "هذا المنتج غير متوفر حاليًا.";

    const cart = await ensureCart(userId);
    const key = { cartId_productId: { cartId: cart.id, productId } };

    let next = clampQty(qty);
    if (mode === "add") {
        const existing = await db.cartItem.findUnique({ where: key, select: { qty: true } });
        next = clampQty((existing?.qty ?? 0) + next);
    } else {
        const count = await db.cartItem.count({ where: { cartId: cart.id } });
        const exists = await db.cartItem.findUnique({ where: key, select: { id: true } });
        if (!exists && count >= MAX_LINES) return "وصلت للحد الأقصى من المنتجات في السلة.";
    }

    await db.cartItem.upsert({
        where: key,
        create: { cartId: cart.id, productId, qty: next },
        update: { qty: next },
    });
    return null;
}

/** يغلّف أي عملية تعديل: تحقق من الجلسة، تنفيذ، ثم إرجاع السلة المحدّثة من الداتا بيز. */
async function mutate(job: (userId: string) => Promise<string | null>): Promise<CartActionResult> {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "يجب تسجيل الدخول لمزامنة السلة." };

    try {
        const error = await job(userId);
        if (error) return { ok: false, error };
        return { ok: true, lines: await loadLines(userId) };
    } catch (e) {
        console.error("[cart-actions]", e);
        return { ok: false, error: "تعذّر تحديث السلة، حاول مرة أخرى." };
    }
}

/* ───────────── قراءة ───────────── */

export async function getCartAction(): Promise<{ authenticated: boolean; lines: CartLine[] }> {
    const userId = await currentUserId();
    if (!userId) return { authenticated: false, lines: [] };
    return { authenticated: true, lines: await loadLines(userId) };
}

/** أسعار وبيانات حديثة لمنتجات سلة الزائر (المخزّنة محليًا قد تكون قديمة). */
export async function getProductsForCartAction(ids: string[]): Promise<CartProduct[]> {
    if (!Array.isArray(ids)) return [];
    const unique = Array.from(new Set(ids.filter(isId))).slice(0, MAX_LINES);
    if (unique.length === 0) return [];

    const products = await db.product.findMany({
        where: { id: { in: unique }, isActive: true },
        select: { id: true, name: true, image: true, price: true, compareAtPrice: true },
    });

    return products.map((p) => ({
        productId: p.id,
        name: p.name,
        image: p.image,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
    }));
}

/* ───────────── تعديل ───────────── */

export async function addToCartAction(productId: string, qty: number): Promise<CartActionResult> {
    if (!isId(productId)) return { ok: false, error: "منتج غير صالح." };
    return mutate((userId) => writeQty(userId, productId, qty, "add"));
}

export async function setCartItemQtyAction(productId: string, qty: number): Promise<CartActionResult> {
    if (!isId(productId)) return { ok: false, error: "منتج غير صالح." };

    if (!Number.isFinite(qty) || qty < 1) {
        return mutate(async (userId) => {
            await db.cartItem.deleteMany({ where: { productId, cart: { userId } } });
            return null;
        });
    }
    return mutate((userId) => writeQty(userId, productId, qty, "set"));
}

export async function removeFromCartAction(productId: string): Promise<CartActionResult> {
    if (!isId(productId)) return { ok: false, error: "منتج غير صالح." };
    return mutate(async (userId) => {
        await db.cartItem.deleteMany({ where: { productId, cart: { userId } } });
        return null;
    });
}

export async function clearCartAction(): Promise<CartActionResult> {
    return mutate(async (userId) => {
        await db.cartItem.deleteMany({ where: { cart: { userId } } });
        return null;
    });
}

/** يدمج سلة الزائر (localStorage) في سلة الحساب بعد تسجيل الدخول. */
export async function mergeGuestCartAction(
    items: { productId: string; qty: number }[]
): Promise<CartActionResult> {
    return mutate(async (userId) => {
        const clean = (Array.isArray(items) ? items : [])
            .filter((i) => i && isId(i.productId) && Number.isFinite(i.qty))
            .slice(0, MAX_LINES);
        if (clean.length === 0) return null;

        const products = await db.product.findMany({
            where: { id: { in: clean.map((i) => i.productId) }, isActive: true },
            select: { id: true },
        });
        const valid = new Set(products.map((p) => p.id));

        const cart = await ensureCart(userId);
        const existing = await db.cartItem.findMany({
            where: { cartId: cart.id },
            select: { productId: true, qty: true },
        });
        const current = new Map(existing.map((e) => [e.productId, e.qty]));

        // نجمع الكميات المتكررة لنفس المنتج قبل الدمج
        const guest = new Map<string, number>();
        for (const item of clean) {
            if (valid.has(item.productId)) {
                guest.set(item.productId, (guest.get(item.productId) ?? 0) + clampQty(item.qty));
            }
        }

        const ops = Array.from(guest, ([productId, qty]) => {
            const next = clampQty((current.get(productId) ?? 0) + qty);
            return db.cartItem.upsert({
                where: { cartId_productId: { cartId: cart.id, productId } },
                create: { cartId: cart.id, productId, qty: next },
                update: { qty: next },
            });
        });

        await db.$transaction(ops);
        return null;
    });
}
