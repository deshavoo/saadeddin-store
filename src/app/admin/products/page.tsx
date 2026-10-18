import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(price);

const MESSAGES: Record<string, { text: string; tone: "ok" | "bad" }> = {
    created: { text: "تمت إضافة المنتج بنجاح.", tone: "ok" },
    updated: { text: "تم حفظ التعديلات.", tone: "ok" },
    deleted: { text: "تم حذف المنتج.", tone: "ok" },
    error: { text: "تعذّر إتمام العملية، حاول مرة أخرى.", tone: "bad" },
};

interface PageProps {
    searchParams: Promise<{ msg?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
    await requireAdmin();
    const { msg } = await searchParams;
    const flash = msg ? MESSAGES[msg] : undefined;

    const products = await db.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { productCategory: { select: { name: true } } },
    });

    const activeCount = products.filter((p) => p.isActive).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black sm:text-3xl">المنتجات</h1>
                    <p className="mt-1 text-sm text-[#70685C]">
                        {new Intl.NumberFormat("ar-SA").format(products.length)} منتج،{" "}
                        {new Intl.NumberFormat("ar-SA").format(activeCount)} فعّال
                    </p>
                </div>

                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center justify-center rounded-xl bg-[#0b3c2e] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#062920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2"
                >
                    + إضافة منتج جديد
                </Link>
            </div>

            {flash && (
                <p
                    role="status"
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${flash.tone === "ok"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                >
                    {flash.text}
                </p>
            )}

            {products.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#c5a880]/50 bg-white p-12 text-center">
                    <p className="mb-4 text-[#70685C]">لا توجد منتجات بعد.</p>
                    <Link href="/admin/products/new" className="font-bold text-[#A88746] underline-offset-4 hover:underline">
                        أضف أول منتج
                    </Link>
                </div>
            ) : (
                <ul className="space-y-3">
                    {products.map((p) => {
                        const categoryName = p.productCategory?.name ?? p.category;
                        const stockBadge =
                            p.stock <= 0
                                ? { text: "نفد", cls: "bg-rose-50 text-rose-700" }
                                : p.stock <= 5
                                    ? { text: `منخفض (${p.stock})`, cls: "bg-amber-50 text-amber-800" }
                                    : { text: `${p.stock} قطعة`, cls: "bg-[#FEF8EB] text-[#0b3c2e]" };

                        return (
                            <li
                                key={p.id}
                                className="flex flex-col gap-4 rounded-2xl border border-[#c5a880]/30 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-4">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#c5a880]/30 bg-[#FEF8EB]">
                                        <Image src={p.image} alt={p.name} fill sizes="64px" className="object-cover" />
                                    </div>

                                    <div className="min-w-0">
                                        <Link
                                            href={`/products/${p.id}`}
                                            target="_blank"
                                            className="block truncate font-bold text-[#0b3c2e] hover:text-[#A88746]"
                                        >
                                            {p.name}
                                        </Link>
                                        <p className="mt-0.5 truncate text-xs text-[#70685C]">
                                            {categoryName || "بدون تصنيف"}
                                            {p.slug ? <span dir="ltr"> · /{p.slug}</span> : null}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold sm:w-72 sm:justify-end">
                                    <span className="text-sm font-black text-[#0b3c2e]">
                                        {formatPrice(p.price)} ر.س
                                    </span>
                                    {p.compareAtPrice != null && p.compareAtPrice > p.price && (
                                        <span className="text-[#968B7A] line-through">{formatPrice(p.compareAtPrice)}</span>
                                    )}
                                    <span className={`rounded-full px-2.5 py-0.5 ${stockBadge.cls}`}>{stockBadge.text}</span>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 ${p.isActive ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}
                                    >
                                        {p.isActive ? "فعّال" : "مخفي"}
                                    </span>
                                    {p.isFeatured && (
                                        <span className="rounded-full bg-[#c5a880]/25 px-2.5 py-0.5 text-[#0b3c2e]">مميز</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 sm:justify-end">
                                    <Link
                                        href={`/admin/products/${p.id}/edit`}
                                        className="inline-flex items-center justify-center rounded-lg border border-[#c5a880]/60 bg-white px-4 py-2 text-xs font-bold text-[#0b3c2e] transition hover:bg-[#c5a880]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                                    >
                                        تعديل
                                    </Link>
                                    <DeleteProductButton id={p.id} name={p.name} />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
