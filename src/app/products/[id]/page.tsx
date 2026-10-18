import Link from "next/link";
import { ShoppingBag, Zap, Star, ShieldCheck, Truck, Store } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import ProductGallery, { type GalleryImage } from "@/components/ProductGallery";

const FALLBACK_IMAGE = "/images/products/chocolate-cake.jpg";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(price);

const formatRating = (value: number) =>
    new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

const formatCount = (value: number) => new Intl.NumberFormat("ar-SA").format(value);

interface PageProps {
    params: Promise<{ id: string }>;
}

/** نجوم بتعبئة جزئية (مثلاً 4.6 من 5)، تُملأ من اليمين في الـ RTL */
function StarRating({ value, size = 15 }: { value: number; size?: number }) {
    const percent = Math.max(0, Math.min(100, (value / 5) * 100));
    const row = (colorClass: string) => (
        <div className="flex w-max">
            {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={size} fill="currentColor" className={`shrink-0 ${colorClass}`} />
            ))}
        </div>
    );

    return (
        <div
            className="relative inline-flex"
            role="img"
            aria-label={`التقييم ${formatRating(value)} من 5`}
        >
            {row("text-[#e4dccb]")}
            <div
                className="absolute inset-y-0 right-0 overflow-hidden"
                style={{ width: `${percent}%` }}
            >
                {row("text-amber-400")}
            </div>
        </div>
    );
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    const email = session?.user?.email;

    // جلب المنتج الحقيقي مع صوره وتصنيفه وحالة المفضلة للمستخدم الحالي
    const product = await db.product.findFirst({
        where: { id, isActive: true },
        include: {
            images: { orderBy: { sortOrder: "asc" } },
            productCategory: { select: { name: true, slug: true } },
            wishlists: email
                ? { where: { user: { email } }, select: { id: true }, take: 1 }
                : false,
        },
    });

    if (!product) {
        notFound();
    }

    const isLiked = Boolean(product.wishlists && product.wishlists.length > 0);

    // الصورة الرئيسية أولاً ثم صور المعرض، بدون تكرار
    const galleryImages: GalleryImage[] = [];
    const seen = new Set<string>();
    for (const image of [
        { url: product.image || FALLBACK_IMAGE, alt: product.name },
        ...product.images.map((img) => ({ url: img.url, alt: img.alt || product.name })),
    ]) {
        if (image.url && !seen.has(image.url)) {
            seen.add(image.url);
            galleryImages.push(image);
        }
    }

    const categoryName = product.productCategory?.name ?? product.category ?? "حلويات فاخرة";
    const hasReviews = product.reviewCount > 0;
    const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
        : 0;

    return (
        <main dir="rtl" className="min-h-screen bg-[#FEF8EB] font-['Cairo'] text-[#0b3c2e] pb-20">
            {/* شريط التنقل العلوي البسيط داخل الصفحة */}
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <nav className="text-xs text-[#70685C] flex items-center gap-2">
                    <Link href="/" className="hover:text-[#0b3c2e]">الرئيسية</Link>
                    <span>/</span>
                    <Link href="/#products" className="hover:text-[#0b3c2e]">المنتجات</Link>
                    <span>/</span>
                    <span className="text-[#0b3c2e] font-semibold">{product.name}</span>
                </nav>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* القسم الأيمن: معرض الصور */}
                    <div className="lg:col-span-6">
                        <ProductGallery images={galleryImages} badge={product.badge} isLiked={isLiked} />
                    </div>

                    {/* القسم الأوسط: تفاصيل المنتج الأساسية */}
                    <div className="lg:col-span-6 space-y-6">
                        <div>
                            <span className="text-xs font-semibold tracking-wider text-[#A88746] uppercase">{categoryName}</span>
                            <h1 className="text-3xl font-black text-[#0b3c2e] sm:text-4xl mt-1">{product.name}</h1>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                                {hasReviews ? (
                                    <>
                                        <StarRating value={product.ratingAvg} />
                                        <span className="font-bold text-[#0b3c2e]">{formatRating(product.ratingAvg)}</span>
                                        <span className="text-[#70685C]">({formatCount(product.reviewCount)} مراجعة)</span>
                                    </>
                                ) : (
                                    <span className="text-[#70685C]">لا توجد مراجعات بعد</span>
                                )}
                                <span className="text-[#0b3c2e] font-bold">|</span>
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">متوفر</span>
                            </div>
                        </div>

                        {/* كارد السعر */}
                        <div className="rounded-2xl border border-[#c5a880]/40 bg-[#FEF8EB] p-5 shadow-xs">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-[#0b3c2e]">{formatPrice(product.price)}</span>
                                    <span className="text-sm font-bold text-[#A88746]">ر.س</span>
                                </div>

                                {hasDiscount && (
                                    <>
                                        <span className="text-lg font-semibold text-[#70685C] line-through decoration-[#A88746]/60">
                                            {formatPrice(product.compareAtPrice as number)}
                                        </span>
                                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                                            وفّر {formatCount(discountPercent)}%
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-[#70685C] mt-1">شامل ضريبة القيمة المضافة 15%</p>
                        </div>

                        <p className="text-sm leading-8 text-[#70685C]">{product.note || "اختيار حلوى أنيق بطعم غني وقوام شهي، مناسب للمشاركة والتقديم في كل مناسبة."}</p>

                        {/* خدمات التوصيل السريع وضمان الجودة */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#c5a880]/20">
                            <div className="flex items-center gap-3 rounded-xl border border-[#c5a880]/20 bg-white p-3.5 shadow-2xs">
                                <Truck size={20} className="text-[#A88746]" />
                                <div>
                                    <p className="text-xs font-bold text-[#0b3c2e]">توصيل مجاني</p>
                                    <p className="text-[11px] text-[#70685C]">للطلبات فوق 299 ر.س</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-[#c5a880]/20 bg-white p-3.5 shadow-2xs">
                                <Store size={20} className="text-[#A88746]" />
                                <div>
                                    <p className="text-xs font-bold text-[#0b3c2e]">استلام من الفرع</p>
                                    <p className="text-[11px] text-[#70685C]">جاهز خلال 15 دقيقة</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-[#c5a880]/20 bg-white p-3.5 shadow-2xs">
                                <ShieldCheck size={20} className="text-[#A88746]" />
                                <div>
                                    <p className="text-xs font-bold text-[#0b3c2e]">دفع آمن 100%</p>
                                    <p className="text-[11px] text-[#70685C]">خيارات دفع متعددة</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* كارد الشراء (الكمية وأزرار السلة والدفع السريع) */}
                    <div className="lg:col-span-12 xl:col-span-12 grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
                        <div className="lg:col-span-4 rounded-3xl border border-[#c5a880]/30 bg-white p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">

                            {/* عداد الكمية */}
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                                <span className="text-sm font-bold text-[#0b3c2e]">الكمية</span>
                                <div className="flex items-center border border-[#c5a880]/40 rounded-xl overflow-hidden bg-[#FEF8EB]">
                                    <span className="px-4 py-2.5 font-bold text-[#0b3c2e]">1</span>
                                </div>
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 max-w-xl">
                                <button
                                    type="button"
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0b3c2e] px-8 py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#062920]"
                                >
                                    <ShoppingBag size={18} />
                                    <span>أضف إلى السلة</span>
                                </button>

                                <button
                                    type="button"
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#e8d5b0]/40 border border-[#c5a880] px-8 py-4 text-sm font-bold text-[#0b3c2e] shadow-xs transition hover:bg-[#c5a880] hover:text-white"
                                >
                                    <Zap size={18} className="text-[#A88746]" />
                                    <span>اشتري الآن</span>
                                </button>
                            </div>

                            {/* خيارات الدفع المصغرة */}
                            <div className="hidden xl:flex items-center gap-2 border-r border-[#c5a880]/20 pr-6 text-xs text-[#70685C]">
                                <span>قسطها على 4 دفعات بدون فوائد</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* قسم تفاصيل وصف المنتج بالأسفل */}
                <div className="mt-16 border-t border-[#c5a880]/30 pt-10">
                    <div className="flex border-b border-[#c5a880]/30 gap-8">
                        <button className="pb-4 border-b-2 border-[#0b3c2e] text-base font-bold text-[#0b3c2e]">وصف المنتج</button>
                    </div>

                    <div className="py-8 space-y-4 text-sm leading-8 text-[#70685C] max-w-4xl">
                        <p className="font-bold text-[#0b3c2e] text-base">{product.name}</p>
                        <p className="whitespace-pre-line">
                            {product.description ||
                                product.note ||
                                product.name + " - جودة استثنائية ومذاق يحمل حكاية صُنعت لتمنحك لحظات استثنائية."}
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}
