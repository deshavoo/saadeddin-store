"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Gift, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/Cart";
import { calculateTotals, formatCount, formatPrice, type CartProduct } from "@/lib/cart";
import type { OccasionProductView, OccasionView } from "@/lib/occasion-types";

const toCartProduct = ({ productId, name, image, price, compareAtPrice }: OccasionProductView): CartProduct => ({
    productId,
    name,
    image,
    price,
    compareAtPrice,
});

const PREVIEW_ITEMS = 5;

export default function OccasionsShowcase({ occasions }: { occasions: OccasionView[] }) {
    const { addToCart, openCart } = useCart();
    const [activeId, setActiveId] = useState(occasions[0]?.id ?? "");
    const [flash, setFlash] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        []
    );

    const active = occasions.find((o) => o.id === activeId) ?? occasions[0];
    if (!active) return null;

    const totals = calculateTotals(active.products.map((p) => ({ ...toCartProduct(p), qty: p.qty })));
    const hasSavings = totals.discount > 0;

    const showFlash = (key: string) => {
        setFlash(key);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setFlash(null), 1800);
    };

    // منتج واحد: قطعة واحدة، والعدّاد يتحدث فورًا عبر CartProvider
    const addProduct = (product: OccasionProductView) => {
        addToCart(toCartProduct(product), 1, { openDrawer: false });
        showFlash(`p:${product.productId}`);
    };

    // الباقة كاملة: كل منتج بكميته داخل المناسبة، ثم نفتح الدرج دون أي تنقل بين الصفحات
    const addBundle = () => {
        active.products.forEach((p) => addToCart(toCartProduct(p), p.qty, { openDrawer: false }));
        openCart();
        showFlash(`b:${active.id}`);
    };

    const bundleAdded = flash === `b:${active.id}`;

    return (
        <section
            id="occasions"
            dir="rtl"
            aria-labelledby="occasions-heading"
            className="overflow-hidden bg-[#FEF8EB] py-16 font-['Cairo'] text-[#0b3c2e] sm:py-20 lg:py-24"
        >
            <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10">
                {/* Heading */}
                <div className="mb-10 text-center sm:mb-12">
                    <span className="mb-4 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-[#A88746] sm:text-sm">
                        <span className="h-px w-8 bg-[#c5a880]" />
                        OCCASIONS
                        <span className="h-px w-8 bg-[#c5a880]" />
                    </span>

                    <h2 id="occasions-heading" className="mb-4 text-3xl font-bold leading-tight text-[#0b3c2e] sm:text-4xl lg:text-5xl">
                        تسوّق حسب المناسبة
                    </h2>

                    <p className="mx-auto max-w-2xl text-sm leading-8 text-[#70685C] sm:text-base">
                        باقات مختارة بعناية لأجمل لحظاتكم، أضف الباقة كاملة بضغطة واحدة أو اختر منها ما يناسبك.
                    </p>

                    <div className="mx-auto mt-6 h-0.5 w-16 rounded-full bg-[#c5a880]" />
                </div>

                {/* Occasion tiles */}
                <div className="mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    <div role="tablist" aria-label="المناسبات" className="mx-auto flex w-max snap-x gap-3 px-1 py-2">
                        {occasions.map((o) => {
                            const on = o.id === active.id;
                            return (
                                <button
                                    key={o.id}
                                    type="button"
                                    role="tab"
                                    id={`occasion-tab-${o.id}`}
                                    aria-selected={on}
                                    aria-controls="occasion-panel"
                                    onClick={(e) => {
                                        setActiveId(o.id);
                                        e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                                    }}
                                    className={`group relative h-32 w-44 shrink-0 snap-center overflow-hidden rounded-2xl border text-start transition-shadow duration-300 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FEF8EB] sm:h-36 sm:w-52 ${on
                                        ? "border-[#c5a880] shadow-[0_10px_30px_rgba(11,60,46,0.25)] ring-2 ring-[#c5a880] ring-offset-2 ring-offset-[#FEF8EB]"
                                        : "border-[#c5a880]/30 hover:shadow-md"
                                        }`}
                                >
                                    <Image
                                        src={o.image}
                                        alt=""
                                        fill
                                        sizes="208px"
                                        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu ${on ? "" : "brightness-90"}`}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,41,32,0.92),rgba(6,41,32,0.25)_60%,transparent)]"
                                    />
                                    <span className="absolute inset-x-0 bottom-0 p-3">
                                        <span className="block text-sm font-bold text-[#FEF8EB] sm:text-base">{o.name}</span>
                                        <span className="block text-[11px] text-[#c5a880]">
                                            {formatCount(o.products.length)} منتجات
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Active occasion panel */}
                <div
                    role="tabpanel"
                    id="occasion-panel"
                    aria-labelledby={`occasion-tab-${active.id}`}
                    className="grid gap-6 lg:grid-cols-12"
                >
                    {/* Bundle card */}
                    <article className="relative overflow-hidden rounded-3xl border border-[#c5a880]/40 bg-[#0b3c2e] text-[#FEF8EB] shadow-xl lg:col-span-5 xl:col-span-4">
                        <div aria-hidden="true" className="pointer-events-none absolute -inset-s-16 -top-20 h-56 w-56 rounded-full bg-[#c5a880]/20 blur-3xl" />

                        <div className="relative aspect-16/10 overflow-hidden">
                            <Image
                                key={active.id}
                                src={active.image}
                                alt={active.name}
                                fill
                                sizes="(min-width: 1024px) 33vw, 100vw"
                                className="object-cover"
                            />
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-[linear-gradient(to_top,#0b3c2e,rgba(11,60,46,0.2)_55%,transparent)]"
                            />
                            <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#c5a880]/70 bg-[#FEF8EB]/95 px-3 py-1.5 text-xs font-bold text-[#0b3c2e] shadow-sm">
                                <Gift size={14} aria-hidden="true" />
                                باقة المناسبة
                            </span>
                        </div>

                        <div className="relative p-6">
                            <h3 className="text-2xl font-black">{active.name}</h3>
                            {active.tagline && <p className="mt-1 text-sm font-semibold text-[#c5a880]">{active.tagline}</p>}
                            {active.description && (
                                <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#FEF8EB]/75">{active.description}</p>
                            )}

                            <ul className="mt-5 space-y-2 border-t border-[#c5a880]/25 pt-5 text-sm">
                                {active.products.slice(0, PREVIEW_ITEMS).map((p) => (
                                    <li key={p.productId} className="flex items-center justify-between gap-3">
                                        <span className="truncate text-[#FEF8EB]/90">{p.name}</span>
                                        <span className="shrink-0 font-bold text-[#c5a880]">× {formatCount(p.qty)}</span>
                                    </li>
                                ))}
                                {active.products.length > PREVIEW_ITEMS && (
                                    <li className="text-xs text-[#FEF8EB]/60">
                                        + {formatCount(active.products.length - PREVIEW_ITEMS)} منتجات أخرى
                                    </li>
                                )}
                            </ul>

                            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <p className="text-3xl font-black">
                                    {formatPrice(totals.subtotal)} <span className="text-sm font-bold text-[#c5a880]">ر.س</span>
                                </p>
                                {hasSavings && (
                                    <>
                                        <span className="text-base text-[#FEF8EB]/55 line-through">{formatPrice(totals.originalTotal)}</span>
                                        <span className="rounded-full bg-[#c5a880] px-2.5 py-0.5 text-xs font-bold text-[#062920]">
                                            وفّر {formatPrice(totals.discount)} ر.س
                                        </span>
                                    </>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={addBundle}
                                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-[#062920] shadow-md transition-colors duration-200 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b3c2e] ${bundleAdded ? "bg-emerald-300" : "bg-[#c5a880] hover:bg-[#d6bc96]"
                                    }`}
                            >
                                {bundleAdded ? <Check size={18} aria-hidden="true" /> : <ShoppingBag size={18} aria-hidden="true" />}
                                <span aria-live="polite">{bundleAdded ? "تمت إضافة الباقة إلى السلة" : "أضف الباقة إلى السلة"}</span>
                            </button>
                        </div>
                    </article>

                    {/* Products */}
                    <ul className="grid grid-cols-1 content-start gap-5 min-[480px]:grid-cols-2 xl:grid-cols-3 lg:col-span-7 xl:col-span-8">
                        {active.products.map((product) => {
                            const added = flash === `p:${product.productId}`;
                            const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;

                            return (
                                <li key={product.productId}>
                                    <article className="group h-full overflow-hidden rounded-2xl border border-[#c5a880]/30 bg-white shadow-sm transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(0,0,0,0.12)] transform-gpu will-change-transform">
                                        <Link
                                            href={`/products/${product.productId}`}
                                            aria-label={`عرض ${product.name}`}
                                            className="relative block aspect-4/3 overflow-hidden bg-[#F3EBDD]"
                                        >
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 479px) 90vw, (max-width: 1279px) 40vw, 22vw"
                                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu"
                                            />
                                            {product.badge && (
                                                <span className="absolute right-3 top-3 rounded-full border border-[#c5a880]/70 bg-[#FEF8EB]/95 px-3 py-1.5 text-xs font-semibold text-[#0b3c2e] shadow-sm">
                                                    {product.badge}
                                                </span>
                                            )}
                                        </Link>

                                        <div className="p-4">
                                            <Link href={`/products/${product.productId}`}>
                                                <h3 className="mb-1.5 line-clamp-1 text-base font-bold text-[#0b3c2e] transition-colors duration-200 group-hover:text-[#A88746]">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                            <p className="mb-4 line-clamp-2 min-h-10 text-xs leading-6 text-[#70685C]">
                                                {product.note || "اختيار حلوى أنيق بطعم غني وقوام شهي."}
                                            </p>

                                            <div className="flex items-center justify-between gap-2 border-t border-[#F0E9DC] pt-3">
                                                <p className="flex items-baseline gap-2 whitespace-nowrap font-bold text-[#0b3c2e]">
                                                    <span>
                                                        {formatPrice(product.price)} <span className="text-xs font-medium">ر.س</span>
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="text-xs font-medium text-[#968B7A] line-through">
                                                            {formatPrice(product.compareAtPrice as number)}
                                                        </span>
                                                    )}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => addProduct(product)}
                                                    aria-label={`أضف ${product.name} إلى السلة`}
                                                    className={`inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors duration-200 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] ${added
                                                        ? "border-emerald-600 bg-emerald-600 text-white"
                                                        : "border-[#c5a880] text-[#0b3c2e] hover:border-[#0b3c2e] hover:bg-[#0b3c2e] hover:text-white"
                                                        }`}
                                                >
                                                    {added ? <Check size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
                                                    <span>{added ? "أُضيف" : "أضف"}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
}
