"use client";

/**
 * نظام السلة بالكامل في ملف واحد — src/components/Cart.tsx
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, X, Zap } from "lucide-react";
import {
    addToCartAction,
    clearCartAction,
    getCartAction,
    getProductsForCartAction,
    mergeGuestCartAction,
    removeFromCartAction,
    setCartItemQtyAction,
} from "@/actions/cart-actions";
import {
    MAX_LINES,
    MAX_QTY,
    calculateTotals,
    clampQty,
    formatCount,
    formatPrice,
    type CartActionResult,
    type CartLine,
    type CartProduct,
    type CartTotals,
} from "@/lib/cart";


/* ─────────── CartProvider ─────────── */

const STORAGE_KEY = "saadeddin-cart-v1";

const isLine = (v: unknown): v is CartLine => {
    if (typeof v !== "object" || v === null) return false;
    const l = v as Record<string, unknown>;
    return (
        typeof l.productId === "string" &&
        typeof l.name === "string" &&
        typeof l.image === "string" &&
        typeof l.price === "number" &&
        (l.compareAtPrice === null || typeof l.compareAtPrice === "number") &&
        typeof l.qty === "number" &&
        l.qty >= 1
    );
};

function readLocal(): CartLine[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter(isLine)
            .slice(0, MAX_LINES)
            .map((l) => ({ ...l, qty: clampQty(l.qty) }));
    } catch {
        return [];
    }
}

function writeLocal(lines: CartLine[]) {
    try {
        if (lines.length === 0) window.localStorage.removeItem(STORAGE_KEY);
        else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
        /* نتجاهل التخزين المحلي غير المتاح */
    }
}

interface CartContextValue {
    lines: CartLine[];
    itemCount: number;
    totals: CartTotals;
    status: "loading" | "ready";
    isAuthenticated: boolean;
    isOpen: boolean;
    addToCart: (product: CartProduct, qty?: number, options?: { openDrawer?: boolean }) => void;
    updateQuantity: (productId: string, qty: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    flush: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart يجب أن يُستخدم داخل <CartProvider>.");
    return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [lines, setLines] = useState<CartLine[]>([]);
    const [status, setStatus] = useState<"loading" | "ready">("loading");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const linesRef = useRef<CartLine[]>([]);
    const authRef = useRef(false);
    const startedRef = useRef(false);

    const queueRef = useRef<Promise<void>>(Promise.resolve());
    const pendingRef = useRef(0);
    const latestServerRef = useRef<CartLine[] | null>(null);
    const resyncRef = useRef(false);

    const commit = useCallback((next: CartLine[]) => {
        linesRef.current = next;
        setLines(next);
    }, []);

    const sync = useCallback(
        (job: () => Promise<CartActionResult>) => {
            pendingRef.current += 1;
            queueRef.current = queueRef.current.then(async () => {
                try {
                    const res = await job();
                    if (res.ok) {
                        latestServerRef.current = res.lines;
                    } else {
                        resyncRef.current = true;
                        setNotice(res.error);
                    }
                } catch {
                    resyncRef.current = true;
                    setNotice("تعذّر الاتصال بالخادم، حاول مرة أخرى.");
                } finally {
                    pendingRef.current -= 1;
                    if (pendingRef.current === 0) {
                        try {
                            if (resyncRef.current) {
                                const fresh = await getCartAction();
                                if (fresh.authenticated) {
                                    commit(fresh.lines);
                                } else {
                                    authRef.current = false;
                                    setIsAuthenticated(false);
                                }
                            } else if (latestServerRef.current) {
                                commit(latestServerRef.current);
                            }
                        } catch {
                            /* نتجاهل */
                        }
                        resyncRef.current = false;
                        latestServerRef.current = null;
                    }
                }
            });
        },
        [commit]
    );

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        (async () => {
            const local = readLocal();
            try {
                const res = await getCartAction();

                if (res.authenticated) {
                    authRef.current = true;
                    setIsAuthenticated(true);

                    let serverLines = res.lines;
                    if (local.length > 0) {
                        const merged = await mergeGuestCartAction(
                            local.map((l) => ({ productId: l.productId, qty: l.qty }))
                        );
                        if (merged.ok) {
                            serverLines = merged.lines;
                            writeLocal([]);
                        }
                    }
                    commit(serverLines);
                } else {
                    let next = local;
                    if (local.length > 0) {
                        const fresh = await getProductsForCartAction(local.map((l) => l.productId));
                        const map = new Map(fresh.map((p) => [p.productId, p]));
                        next = local.flatMap((l) => {
                            const p = map.get(l.productId);
                            return p ? [{ ...p, qty: l.qty }] : [];
                        });
                    }
                    commit(next);
                }
            } catch {
                commit(local);
            } finally {
                setStatus("ready");
            }
        })();
    }, [commit]);

    useEffect(() => {
        if (status !== "ready" || isAuthenticated) return;
        writeLocal(lines);
    }, [lines, status, isAuthenticated]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && !authRef.current) commit(readLocal());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [commit]);

    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(null), 3500);
        return () => clearTimeout(timer);
    }, [notice]);

    const addToCart = useCallback<CartContextValue["addToCart"]>(
        (product, qty = 1, options) => {
            const amount = clampQty(qty);
            const current = linesRef.current;
            const exists = current.some((l) => l.productId === product.productId);

            if (!exists && current.length >= MAX_LINES) {
                setNotice("وصلت للحد الأقصى من المنتجات في السلة.");
                return;
            }

            commit(
                exists
                    ? current.map((l) =>
                        l.productId === product.productId ? { ...l, qty: clampQty(l.qty + amount) } : l
                    )
                    : [...current, { ...product, qty: amount }]
            );

            if (authRef.current) sync(() => addToCartAction(product.productId, amount));
            if (options?.openDrawer !== false) setIsOpen(true);
        },
        [commit, sync]
    );

    const removeFromCart = useCallback<CartContextValue["removeFromCart"]>(
        (productId) => {
            commit(linesRef.current.filter((l) => l.productId !== productId));
            if (authRef.current) sync(() => removeFromCartAction(productId));
        },
        [commit, sync]
    );

    const updateQuantity = useCallback<CartContextValue["updateQuantity"]>(
        (productId, qty) => {
            if (!Number.isFinite(qty) || qty < 1) {
                removeFromCart(productId);
                return;
            }
            const next = clampQty(qty);
            commit(linesRef.current.map((l) => (l.productId === productId ? { ...l, qty: next } : l)));
            if (authRef.current) sync(() => setCartItemQtyAction(productId, next));
        },
        [commit, removeFromCart, sync]
    );

    const clearCart = useCallback(() => {
        commit([]);
        if (authRef.current) sync(() => clearCartAction());
    }, [commit, sync]);

    const flush = useCallback(() => queueRef.current, []);
    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);

    const totals = useMemo(() => calculateTotals(lines), [lines]);

    const value = useMemo<CartContextValue>(
        () => ({
            lines,
            itemCount: totals.itemCount,
            totals,
            status,
            isAuthenticated,
            isOpen,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            openCart,
            closeCart,
            flush,
        }),
        [lines, totals, status, isAuthenticated, isOpen, addToCart, updateQuantity, removeFromCart, clearCart, openCart, closeCart, flush]
    );

    return (
        <CartContext.Provider value={value}>
            {children}

            <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-6 z-70 flex justify-center">
                {notice && (
                    <p
                        role="status"
                        className="rounded-xl border border-[#c5a880]/60 bg-[#FEF8EB] px-5 py-3 text-sm font-semibold text-[#0b3c2e] shadow-xl"
                    >
                        {notice}
                    </p>
                )}
            </div>
        </CartContext.Provider>
    );
}


/* ─────────── QuantityStepper ─────────── */

interface QuantityStepperProps {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    size?: "sm" | "md";
}

export function QuantityStepper({
    value,
    onChange,
    min = 1,
    max = MAX_QTY,
    size = "md",
}: QuantityStepperProps) {
    const btn =
        (size === "sm" ? "h-8 w-8" : "h-10 w-10") +
        " flex items-center justify-center text-[#0b3c2e] transition hover:bg-[#c5a880]/25 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c5a880] " +
        "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";

    return (
        <div dir="ltr" className="inline-flex items-center overflow-hidden rounded-xl border border-[#c5a880]/40 bg-[#FEF8EB]">
            <button
                type="button"
                onClick={() => onChange(value - 1)}
                disabled={value <= min}
                aria-label="إنقاص الكمية"
                className={btn}
            >
                <Minus size={size === "sm" ? 14 : 16} />
            </button>

            <span
                aria-live="polite"
                className={`${size === "sm" ? "min-w-8 text-sm" : "min-w-10 text-base"} text-center font-bold text-[#0b3c2e]`}
            >
                {formatCount(value)}
            </span>

            <button
                type="button"
                onClick={() => onChange(value + 1)}
                disabled={value >= max}
                aria-label="زيادة الكمية"
                className={btn}
            >
                <Plus size={size === "sm" ? 14 : 16} />
            </button>
        </div>
    );
}


/* ─────────── CartSummary ─────────── */

export function FreeShippingBar({ totals }: { totals: CartTotals }) {
    if (totals.subtotal <= 0) return null;
    const unlocked = totals.amountToFreeShipping === 0;

    return (
        <div className="rounded-2xl border border-[#c5a880]/30 bg-white px-4 py-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-[#0b3c2e]">
                <Truck size={16} className="shrink-0 text-[#A88746]" aria-hidden="true" />
                {unlocked ? (
                    "طلبك مؤهل للشحن المجاني"
                ) : (
                    <span>
                        أضف <span className="text-[#A88746]">{formatPrice(totals.amountToFreeShipping)} ر.س</span> للحصول على شحن مجاني
                    </span>
                )}
            </p>
            <div
                role="progressbar"
                aria-label="التقدم نحو الشحن المجاني"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={totals.freeShippingProgress}
                className="h-2 overflow-hidden rounded-full bg-[#c5a880]/20"
            >
                <div
                    className="h-full rounded-full bg-linear-to-l from-[#c5a880] to-[#e8d5b0] transition-[width] duration-500"
                    style={{ width: `${totals.freeShippingProgress}%` }}
                />
            </div>
        </div>
    );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[#70685C]">{label}</span>
            <span className={`font-bold ${tone === "good" ? "text-emerald-700" : "text-[#0b3c2e]"}`}>{value}</span>
        </div>
    );
}

export function CartSummary({ totals }: { totals: CartTotals }) {
    return (
        <aside
            aria-label="ملخص الطلب"
            className="space-y-5 rounded-3xl border border-[#c5a880]/30 bg-white p-6 shadow-md"
        >
            <h2 className="text-lg font-black text-[#0b3c2e]">ملخص الطلب</h2>

            <FreeShippingBar totals={totals} />

            <div className="space-y-3">
                <Row label="المجموع الفرعي" value={`${formatPrice(totals.originalTotal)} ر.س`} />
                {totals.discount > 0 && (
                    <Row label="خصم العروض" value={`- ${formatPrice(totals.discount)} ر.س`} tone="good" />
                )}
                <Row label="الشحن" value={totals.shipping === 0 ? "مجاني" : `${formatPrice(totals.shipping)} ر.س`} tone={totals.shipping === 0 ? "good" : undefined} />
            </div>

            <div className="flex items-end justify-between gap-3 border-t border-[#c5a880]/30 pt-5">
                <span className="text-base font-bold text-[#0b3c2e]">الإجمالي</span>
                <span className="text-3xl font-black text-[#0b3c2e]">
                    {formatPrice(totals.total)} <span className="text-sm font-bold text-[#A88746]">ر.س</span>
                </span>
            </div>
            <p className="-mt-3 text-[11px] text-[#70685C]">شامل ضريبة القيمة المضافة 15%</p>

            <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-xl bg-[#0b3c2e] px-6 py-4 text-sm font-bold text-white shadow-md transition-colors duration-200 hover:bg-[#062920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2"
            >
                إتمام الطلب
            </Link>

            <Link
                href="/#products"
                className="block text-center text-sm font-semibold text-[#A88746] underline-offset-4 hover:underline"
            >
                متابعة التسوق
            </Link>

            <p className="flex items-center justify-center gap-2 text-xs text-[#70685C]">
                <ShieldCheck size={15} className="text-[#A88746]" aria-hidden="true" />
                دفع آمن 100%
            </p>
        </aside>
    );
}


/* ─────────── CartLineRow ─────────── */

interface CartLineRowProps {
    line: CartLine;
    compact?: boolean;
    onNavigate?: () => void;
}

export function CartLineRow({ line, compact = false, onNavigate }: CartLineRowProps) {
    const { updateQuantity, removeFromCart } = useCart();
    const hasDiscount = line.compareAtPrice != null && line.compareAtPrice > line.price;
    const imageSize = compact ? "h-20 w-20" : "h-24 w-24 sm:h-28 sm:w-28";

    return (
        <li className="flex gap-4 rounded-2xl border border-[#c5a880]/30 bg-white p-3 shadow-sm sm:p-4">
            <Link
                href={`/products/${line.productId}`}
                onClick={onNavigate}
                className={`relative ${imageSize} shrink-0 overflow-hidden rounded-xl border border-[#c5a880]/20 bg-[#F3EBDD]`}
                aria-label={`عرض ${line.name}`}
            >
                <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes={compact ? "80px" : "(min-width: 640px) 112px, 96px"}
                    className="object-cover"
                />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={`/products/${line.productId}`}
                            onClick={onNavigate}
                            className="line-clamp-2 text-sm font-bold text-[#0b3c2e] transition-colors hover:text-[#A88746] sm:text-base"
                        >
                            {line.name}
                        </Link>

                        <p className="mt-1 flex items-baseline gap-2 text-xs">
                            <span className="font-bold text-[#0b3c2e]">{formatPrice(line.price)} ر.س</span>
                            {hasDiscount && (
                                <span className="text-[#968B7A] line-through">{formatPrice(line.compareAtPrice as number)}</span>
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => removeFromCart(line.productId)}
                        aria-label={`حذف ${line.name} من السلة`}
                        className="shrink-0 rounded-lg p-2 text-[#70685C] transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                    >
                        <Trash2 size={compact ? 16 : 18} />
                    </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <QuantityStepper
                        size={compact ? "sm" : "md"}
                        value={line.qty}
                        onChange={(next) => updateQuantity(line.productId, next)}
                    />
                    <p className="text-sm font-black text-[#0b3c2e] sm:text-base">
                        {formatPrice(line.price * line.qty)} <span className="text-xs font-bold text-[#A88746]">ر.س</span>
                    </p>
                </div>
            </div>
        </li>
    );
}


/* ─────────── CartButton ─────────── */

export function CartButton({ className = "" }: { className?: string }) {
    const { itemCount, status, openCart } = useCart();
    const showBadge = status === "ready" && itemCount > 0;

    return (
        <button
            type="button"
            onClick={openCart}
            aria-label={showBadge ? `فتح سلة التسوق، ${formatCount(itemCount)} عنصر` : "فتح سلة التسوق"}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-[#c5a880]/40 text-current transition-colors duration-200 hover:bg-[#c5a880]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] ${className}`}
        >
            <ShoppingBag size={20} aria-hidden="true" />

            {showBadge && (
                <span
                    key={itemCount}
                    className="absolute -inset-e-1.5 -top-1.5 min-w-5 rounded-full bg-[#c5a880] px-1.5 text-center text-[11px] font-black leading-5 text-[#062920] shadow"
                >
                    {itemCount > 99 ? `${formatCount(99)}+` : formatCount(itemCount)}
                </span>
            )}
        </button>
    );
}


/* ─────────── CartDrawer ─────────── */

export function CartDrawer() {
    const { lines, totals, status, isOpen, closeCart } = useCart();
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeCart();
        };
        document.addEventListener("keydown", onKey);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, closeCart]);

    // عدم عرض الدرج نهائياً في الشجرة إذا لم يكن مفتوحاً (لتحسين الأداء ومنع التعارضات)
    if (!isOpen) return null;

    const isEmpty = status === "ready" && lines.length === 0;

    return (
        <div className="fixed inset-0 z-60 flex justify-end" dir="rtl">
            {/* طبقة الخلفية المعتمة */}
            <div
                aria-hidden="true"
                onClick={closeCart}
                className="absolute inset-0 bg-[#062920]/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* درج السلة من اليمين */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="سلة التسوق"
                className="relative z-10 flex w-full max-w-md flex-col border-l border-[#c5a880]/30 bg-[#FEF8EB] font-['Cairo'] text-[#0b3c2e] shadow-2xl h-full animate-in slide-in-from-left duration-300"
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-[#c5a880]/30 bg-[#0b3c2e] px-5 py-4 text-[#FEF8EB]">
                    <h2 className="flex items-center gap-2 text-base font-black">
                        <ShoppingBag size={18} className="text-[#c5a880]" aria-hidden="true" />
                        سلة التسوق
                        {totals.itemCount > 0 && (
                            <span className="rounded-full bg-[#c5a880] px-2 py-0.5 text-xs font-black text-[#062920]">
                                {formatCount(totals.itemCount)}
                            </span>
                        )}
                    </h2>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={closeCart}
                        aria-label="إغلاق السلة"
                        className="rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                    {status === "loading" && (
                        <div className="space-y-3" aria-busy="true">
                            {[0, 1].map((i) => (
                                <div key={i} className="h-28 animate-pulse rounded-2xl border border-[#c5a880]/20 bg-white" />
                            ))}
                        </div>
                    )}

                    {isEmpty && (
                        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c5a880]/50 bg-white">
                                <ShoppingBag size={32} className="text-[#A88746]" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-lg font-black">سلتك فارغة</p>
                                <p className="mt-1 text-sm text-[#70685C]">اختر من حلوياتنا الفاخرة وأضفها هنا.</p>
                            </div>
                            <Link
                                href="/#products"
                                onClick={closeCart}
                                className="rounded-xl bg-[#0b3c2e] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#062920]"
                            >
                                تصفح المنتجات
                            </Link>
                        </div>
                    )}

                    {status === "ready" && lines.length > 0 && (
                        <>
                            <FreeShippingBar totals={totals} />
                            <ul className="space-y-3">
                                {lines.map((line) => (
                                    <CartLineRow key={line.productId} line={line} compact onNavigate={closeCart} />
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* Footer */}
                {status === "ready" && lines.length > 0 && (
                    <div className="space-y-3 border-t border-[#c5a880]/30 bg-white px-5 py-5">
                        {totals.discount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#70685C]">خصم العروض</span>
                                <span className="font-bold text-emerald-700">- {formatPrice(totals.discount)} ر.س</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">المجموع (قبل الشحن)</span>
                            <span className="text-xl font-black">
                                {formatPrice(totals.subtotal)} <span className="text-xs font-bold text-[#A88746]">ر.س</span>
                            </span>
                        </div>

                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="flex w-full items-center justify-center rounded-xl bg-[#0b3c2e] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#062920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2"
                        >
                            إتمام الطلب
                        </Link>
                        <Link
                            href="/cart"
                            onClick={closeCart}
                            className="flex w-full items-center justify-center rounded-xl border border-[#c5a880] px-6 py-3 text-sm font-bold text-[#0b3c2e] transition-colors hover:bg-[#c5a880]/15"
                        >
                            عرض السلة
                        </Link>
                    </div>
                )}
            </aside>
        </div>
    );
}


/* ─────────── CartView ─────────── */

export function CartView() {
    const { lines, totals, status, clearCart } = useCart();

    if (status === "loading") {
        return (
            <div className="grid gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]" aria-busy="true">
                <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-36 animate-pulse rounded-2xl border border-[#c5a880]/20 bg-white" />
                    ))}
                </div>
                <div className="h-96 animate-pulse rounded-3xl border border-[#c5a880]/20 bg-white" />
            </div>
        );
    }

    if (lines.length === 0) {
        return (
            <div className="relative mx-auto max-w-lg overflow-hidden rounded-3xl border border-[#c5a880]/30 bg-white px-6 py-14 text-center shadow-sm">
                <div aria-hidden="true" className="pointer-events-none absolute -top-16 inset-s-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#c5a880]/20 blur-3xl" />

                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#c5a880]/50 bg-[#FEF8EB]">
                    <ShoppingBag size={38} className="text-[#A88746]" aria-hidden="true" />
                </div>

                <h1 className="relative text-2xl font-black text-[#0b3c2e]">سلة التسوق فارغة</h1>
                <p className="relative mx-auto mt-2 max-w-xs text-sm leading-7 text-[#70685C]">
                    لم تضف أي منتج بعد. اكتشف تشكيلتنا الفاخرة من الحلويات والهدايا.
                </p>

                <Link
                    href="/#products"
                    className="relative mt-7 inline-flex items-center justify-center rounded-xl bg-[#0b3c2e] px-8 py-3.5 text-sm font-bold text-white shadow-md transition-colors duration-200 hover:bg-[#062920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2"
                >
                    العودة للتسوق
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-[#0b3c2e] sm:text-3xl">سلة التسوق</h1>
                    <p className="mt-1 text-sm text-[#70685C]">{formatCount(totals.itemCount)} عنصر في سلتك</p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm("هل تريد تفريغ السلة بالكامل؟")) clearCart();
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                    <Trash2 size={15} aria-hidden="true" />
                    تفريغ السلة
                </button>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
                <ul className="space-y-4">
                    {lines.map((line) => (
                        <CartLineRow key={line.productId} line={line} />
                    ))}
                </ul>

                <div className="lg:sticky lg:top-6">
                    <CartSummary totals={totals} />
                </div>
            </div>
        </div>
    );
}


/* ─────────── ProductPurchase ─────────── */

export function ProductPurchase({ product }: { product: CartProduct }) {
    const router = useRouter();
    const { addToCart, flush } = useCart();
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [buying, setBuying] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        []
    );

    const handleAdd = () => {
        addToCart(product, qty);
        setAdded(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1800);
    };

    const handleBuyNow = async () => {
        if (buying) return;
        setBuying(true);
        try {
            addToCart(product, qty, { openDrawer: false });
            await flush();
            router.push("/checkout");
        } finally {
            setBuying(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#c5a880]/30 bg-white p-6 shadow-md sm:flex-row lg:col-span-4">
            <div className="flex w-full items-center justify-center gap-4 sm:w-auto">
                <span className="text-sm font-bold text-[#0b3c2e]">الكمية</span>
                <QuantityStepper value={qty} onChange={setQty} />
            </div>

            <div className="flex w-full max-w-xl flex-1 flex-col gap-3 sm:w-auto sm:flex-row">
                <button
                    type="button"
                    onClick={handleAdd}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-md transition-colors duration-200 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 ${added ? "bg-emerald-700" : "bg-[#0b3c2e] hover:bg-[#062920]"}`}
                >
                    {added ? <Check size={18} aria-hidden="true" /> : <ShoppingBag size={18} aria-hidden="true" />}
                    <span aria-live="polite">{added ? "تمت الإضافة" : "أضف إلى السلة"}</span>
                </button>

                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={buying}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#c5a880] bg-[#e8d5b0]/40 px-8 py-4 text-sm font-bold text-[#0b3c2e] shadow-xs transition-colors duration-200 hover:bg-[#c5a880] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Zap size={18} className="text-[#A88746]" aria-hidden="true" />
                    <span>{buying ? "جارٍ التحويل..." : "اشتري الآن"}</span>
                </button>
            </div>

            <div className="hidden items-center gap-2 border-r border-[#c5a880]/20 pr-6 text-xs text-[#70685C] xl:flex">
                <span>قسطها على 4 دفعات بدون فوائد</span>
            </div>
        </div>
    );
}


/* ─────────── QuickAddButton ─────────── */

export function QuickAddButton({ product }: { product: CartProduct }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        []
    );

    const handleClick = () => {
        addToCart(product, 1, { openDrawer: false });
        setAdded(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1500);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={added ? `تمت إضافة ${product.name}` : `أضف ${product.name} إلى السلة`}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] ${added
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-[#C5A880] text-[#0b3c2e] hover:border-[#0b3c2e] hover:bg-[#0b3c2e] hover:text-white"
                }`}
        >
            {added ? <Check size={18} aria-hidden="true" /> : <ShoppingBag size={18} aria-hidden="true" />}
        </button>
    );
}