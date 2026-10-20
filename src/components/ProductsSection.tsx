"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { Product as PrismaProduct, Category as PrismaCategory } from "@prisma/client";
import { toggleWishlistAction } from "@/actions/wishlist-actions";
import { QuickAddButton } from "@/components/Cart";

/* ───────────── الأنواع (مشتقة مباشرة من Prisma) ───────────── */

export type CategoryOption = Pick<PrismaCategory, "id" | "name" | "slug">;

export type Product = Pick<
    PrismaProduct,
    "id" | "name" | "note" | "price" | "image" | "badge"
> &
    Partial<
        Pick<
            PrismaProduct,
            "category" | "categoryId" | "isFeatured" | "compareAtPrice" | "ratingAvg" | "reviewCount"
        >
    > & {
        // يُجلب عبر include: { productCategory: { select: { id, name, slug } } }
        productCategory?: CategoryOption | null;
    };

interface ProductsSectionProps {
    products: Product[];
    /** تصنيفات الجدول Category (الأفضل). إن لم تُمرَّر تُستنتج من المنتجات نفسها. */
    categories?: CategoryOption[];
    initialWishlist?: string[];
    viewAllHref?: string;
}

const ALL = "all";
const FALLBACK_IMAGE = "/images/products/chocolate-cake.jpg";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("ar-SA", {
        maximumFractionDigits: 0,
    }).format(price);

const formatRating = (value: number) =>
    new Intl.NumberFormat("ar-SA", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value);

// اسم تصنيف المنتج: من جدول Category أولاً ثم الحقل القديم category
const categoryNameOf = (product: Product) =>
    product.productCategory?.name ?? product.category ?? null;

export default function ProductsSection({
    products = [],
    categories,
    initialWishlist = [],
    viewAllHref = "/products",
}: ProductsSectionProps) {
    const [activeCategory, setActiveCategory] = useState<string>(ALL);
    const [wishlist, setWishlist] = useState<string[]>(initialWishlist);
    const [toast, setToast] = useState<string | null>(null);

    const sliderRef = useRef<HTMLDivElement>(null);
    // يمنع إرسال طلبين متزامنين لنفس المنتج دون تعطيل أي زر (لا اهتزاز ولا وميض)
    const inFlight = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(timer);
    }, [toast]);

    /* ───────────── التصنيفات ───────────── */

    const matchesTab = (product: Product, tab: CategoryOption) =>
        product.categoryId === tab.id || categoryNameOf(product) === tab.name;

    const tabs = useMemo<CategoryOption[]>(() => {
        let source: CategoryOption[];

        if (categories && categories.length > 0) {
            source = categories;
        } else {
            const map = new Map<string, CategoryOption>();
            for (const product of products) {
                if (product.productCategory) {
                    map.set(product.productCategory.id, product.productCategory);
                } else if (product.category) {
                    const key = `legacy:${product.category}`;
                    if (!map.has(key)) {
                        map.set(key, { id: key, name: product.category, slug: key });
                    }
                }
            }
            source = Array.from(map.values());
        }

        // نخفي التصنيفات الفارغة
        return source.filter((tab) => products.some((p) => matchesTab(p, tab)));
    }, [categories, products]);

    const activeTab = tabs.find((tab) => tab.id === activeCategory);

    const filteredProducts = useMemo(() => {
        if (!activeTab) return products;
        return products.filter((product) => matchesTab(product, activeTab));
    }, [activeTab, products]);

    /* ───────────── المفضلة (تحديث متفائل) ───────────── */

    const toggleWishlist = async (productId: string, e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (inFlight.current.has(productId)) return;
        inFlight.current.add(productId);

        const wasLiked = wishlist.includes(productId);

        setWishlist((prev) =>
            wasLiked ? prev.filter((id) => id !== productId) : [...prev, productId]
        );

        const rollback = () =>
            setWishlist((prev) =>
                wasLiked
                    ? prev.includes(productId)
                        ? prev
                        : [...prev, productId]
                    : prev.filter((id) => id !== productId)
            );

        try {
            const res = await toggleWishlistAction(productId);
            if (res?.error) {
                rollback();
                setToast(res.error);
            }
        } catch {
            rollback();
            setToast("تعذّر تحديث المفضلة، حاول مرة أخرى.");
        } finally {
            inFlight.current.delete(productId);
        }
    };

    const scrollSlider = (direction: "next" | "prev") => {
        const slider = sliderRef.current;
        if (!slider) return;
        const amount = Math.max(slider.clientWidth * 0.8, 280);
        slider.scrollBy({
            left: direction === "next" ? amount : -amount,
            behavior: "smooth",
        });
    };

    return (
        <section
            id="products"
            dir="rtl"
            aria-labelledby="products-heading"
            className="overflow-hidden bg-[#005430] py-16 sm:py-20 lg:py-24 text-[#FEF8EB]"
        >
            <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10">
                {/* Section Heading */}
                <div className="mb-10 text-center sm:mb-12">
                    <span className="mb-4 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-[#c5a880] sm:text-sm">
                        <span className="h-px w-8 bg-[#c5a880]" />
                        SAAD EDDIN 1919
                        <span className="h-px w-8 bg-[#c5a880]" />
                    </span>

                    <h2
                        id="products-heading"
                        className="mb-4 text-3xl font-bold leading-tight text-[#FEF8EB] sm:text-4xl lg:text-5xl"
                    >
                        اكتشف تشكيلتنا الفاخرة
                    </h2>

                    <p className="mx-auto max-w-2xl text-sm leading-8 text-[#FEF8EB]/80 sm:text-base">
                        من الحلويات الفاخرة إلى القهوة المميزة، اكتشف اختيارات
                        صُنعت لتمنحك لحظات استثنائية في كل مرة.
                    </p>

                    <div className="mx-auto mt-6 h-0.5 w-16 rounded-full bg-[#c5a880]" />
                </div>

                {/* Categories */}
                <div
                    className="mb-8 flex gap-2 overflow-x-auto pb-3 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible"
                    role="group"
                    aria-label="تصنيفات المنتجات"
                >
                    {[{ id: ALL, name: "الكل", slug: ALL }, ...tabs].map((tab) => {
                        const isActive = (activeTab?.id ?? ALL) === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveCategory(tab.id)}
                                aria-pressed={isActive}
                                className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200 transform-gpu ${isActive
                                    ? "border-[#c5a880] bg-[#c5a880] text-[#005430] font-bold shadow-[0_4px_14px_rgba(197,168,128,0.3)]"
                                    : "border-[#c5a880]/30 bg-transparent text-[#FEF8EB]/80 hover:border-[#c5a880] hover:bg-white/10 hover:text-[#FEF8EB]"
                                    }`}
                            >
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* Slider Controls */}
                <div className="mb-5 flex items-center justify-between">
                    <p className="text-sm text-[#c5a880]">
                        {formatPrice(filteredProducts.length)} منتجات
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => scrollSlider("prev")}
                            aria-label="عرض المنتجات السابقة"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c5a880]/40 text-[#FEF8EB] transition-colors duration-200 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#005430] transform-gpu"
                        >
                            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                                <path d="m14 5-7 7 7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollSlider("next")}
                            aria-label="عرض المنتجات التالية"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c5a880]/40 text-[#FEF8EB] transition-colors duration-200 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#005430] transform-gpu"
                        >
                            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                                <path d="m10 5 7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Products Slider */}
                <div
                    ref={sliderRef}
                    className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-6 scrollbar-none [&::-webkit-scrollbar]:hidden sm:gap-6"
                >
                    {filteredProducts.map((product) => {
                        const isLiked = wishlist.includes(product.id);
                        const hasDiscount =
                            product.compareAtPrice != null && product.compareAtPrice > product.price;
                        const hasReviews = (product.reviewCount ?? 0) > 0;

                        return (
                            <article
                                key={product.id}
                                className="group w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#c5a880]/30 bg-white text-[#005430] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(0,0,0,0.2)] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)] transform-gpu will-change-transform"
                            >
                                <Link
                                    href={`/products/${product.id}`}
                                    className="relative block aspect-4/3 overflow-hidden bg-[#F3EBDD]"
                                    aria-label={`عرض ${product.name}`}
                                >
                                    <Image
                                        src={product.image || FALLBACK_IMAGE}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 639px) 78vw, (max-width: 1023px) 48vw, (max-width: 1279px) 31vw, 24vw"
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu"
                                    />

                                    {product.badge && (
                                        <span className="absolute right-3 top-3 rounded-full border border-[#c5a880]/70 bg-[#FEF8EB]/95 px-3 py-1.5 text-xs font-semibold text-[#005430] shadow-sm">
                                            {product.badge}
                                        </span>
                                    )}

                                    {/* زر القلب (المفضلة) */}
                                    <button
                                        type="button"
                                        onClick={(e) => toggleWishlist(product.id, e)}
                                        aria-label={isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                                        aria-pressed={isLiked}
                                        className={`absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#c5a880]/40 bg-[#FEF8EB]/90 shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 transform-gpu ${isLiked ? "text-rose-600 bg-rose-50" : "text-[#005430] hover:text-rose-600"
                                            }`}
                                    >
                                        <Heart
                                            size={18}
                                            fill={isLiked ? "currentColor" : "none"}
                                            className="transition-colors duration-200"
                                        />
                                    </button>
                                </Link>

                                <div className="p-4 sm:p-5">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium text-[#A88746]">
                                            {categoryNameOf(product) || "حلويات فاخرة"}
                                        </span>

                                        {hasReviews && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#70685C]">
                                                <Star size={12} fill="currentColor" className="text-amber-400" aria-hidden="true" />
                                                {formatRating(product.ratingAvg ?? 0)}
                                                <span className="font-normal text-[#968B7A]">
                                                    ({formatPrice(product.reviewCount ?? 0)})
                                                </span>
                                            </span>
                                        )}
                                    </div>

                                    <Link href={`/products/${product.id}`}>
                                        <h3 className="mb-2 line-clamp-1 text-base font-bold text-[#005430] transition-colors duration-200 group-hover:text-[#A88746] sm:text-lg">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <p className="mb-5 line-clamp-2 min-h-10 text-xs leading-6 text-[#70685C] sm:text-sm">
                                        {product.note || "اختيار حلوى أنيق بطعم غني وقوام شهي."}
                                    </p>

                                    <div className="flex items-center justify-between gap-2 border-t border-[#F0E9DC] pt-4">
                                        <div>
                                            <span className="block text-[11px] text-[#968B7A]">السعر</span>
                                            <p className="mt-1 flex items-baseline gap-2 whitespace-nowrap text-base font-bold text-[#005430] sm:text-lg">
                                                <span>
                                                    {formatPrice(product.price)}{" "}
                                                    <span className="text-xs font-medium">ر.س</span>
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-xs font-medium text-[#968B7A] line-through">
                                                        {formatPrice(product.compareAtPrice as number)}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* زر إضافة المنتج إلى السلة مباشرة باستخدام QuickAddButton الجاهز */}
                                        <QuickAddButton
                                            product={{
                                                productId: product.id,
                                                name: product.name,
                                                image: product.image || FALLBACK_IMAGE,
                                                price: product.price,
                                                compareAtPrice: product.compareAtPrice ?? null,
                                            }}
                                        />
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#c5a880]/40 py-16 text-center text-[#FEF8EB]">
                        <p className="text-lg font-semibold">
                            لا توجد منتجات مسجلة في قاعدة البيانات حاليًا
                        </p>
                    </div>
                )}

                {/* View All */}
                <div className="mt-8 text-center">
                    <Link
                        href={viewAllHref}
                        className="inline-flex items-center justify-center rounded-full border border-[#c5a880] px-8 py-3 text-sm font-bold text-[#c5a880] transition-colors duration-200 hover:bg-[#c5a880] hover:text-[#005430] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-[#005430] transform-gpu"
                    >
                        عرض جميع المنتجات
                    </Link>
                </div>
            </div>

            {/* Toast */}
            <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center">
                {toast && (
                    <p
                        role="status"
                        className="rounded-xl border border-[#c5a880]/60 bg-[#FEF8EB] px-5 py-3 text-sm font-semibold text-[#005430] shadow-xl"
                    >
                        {toast}
                    </p>
                )}
            </div>
        </section>
    );
}