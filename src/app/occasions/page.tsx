import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gift } from "lucide-react";
import { getActiveOccasions } from "@/lib/occasions";
import { formatCount } from "@/lib/cart";

export const metadata = {
    title: "المناسبات والباقات الفاخرة | حلويات سعد الدين 1919",
    description: "تسوّق تشكيلة باقات المناسبات والحفلات المصممة خصيصاً لتناسب أقطاب لحظاتكم السعيدة.",
};

export default async function OccasionsPage() {
    const occasions = await getActiveOccasions();

    return (
        <main className="flex-1 bg-[#FEF8EB] py-12 font-['Cairo'] text-[#0b3c2e]" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb / Back */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#A88746] transition hover:text-[#0b3c2e]"
                    >
                        <ArrowRight size={16} />
                        <span>العودة للرئيسية</span>
                    </Link>
                    <h1 className="mt-2 text-3xl font-black text-[#0b3c2e] sm:text-4xl">مناسبات وباقات سعد الدين</h1>
                    <p className="mt-2 text-sm text-[#70685C]">
                        اختر المناسبة التي تحلو لك لتستعرض أرقى الباقات والحلويات المُعدّة خصيصاً لها.
                    </p>
                </div>

                {occasions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#c5a880]/40 bg-white py-16 text-center">
                        <Gift size={48} className="mx-auto mb-4 text-[#A88746]" />
                        <p className="text-lg font-bold text-[#0b3c2e]">لا توجد مناسبات نشطة حالياً</p>
                        <p className="mt-1 text-sm text-[#70685C]">ترقبوا أحدث تشكيلاتنا للمناسبات القادمة قريبًا.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {occasions.map((occasion) => (
                            <article
                                key={occasion.id}
                                className="group overflow-hidden rounded-3xl border border-[#c5a880]/30 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative aspect-16/10 overflow-hidden bg-[#F3EBDD]">
                                    <Image
                                        src={occasion.image}
                                        alt={occasion.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-[#0b3c2e]/80 via-transparent to-transparent" />
                                    <span className="absolute right-4 top-4 rounded-full bg-[#FEF8EB]/95 px-3 py-1 text-xs font-bold text-[#0b3c2e] shadow">
                                        {formatCount(occasion.products.length)} منتجات
                                    </span>
                                </div>

                                <div className="p-6">
                                    <h2 className="text-xl font-black text-[#0b3c2e]">{occasion.name}</h2>
                                    {occasion.tagline && (
                                        <p className="mt-1 text-xs font-bold text-[#A88746]">{occasion.tagline}</p>
                                    )}
                                    {occasion.description && (
                                        <p className="mt-3 line-clamp-2 text-xs leading-6 text-[#70685C]">{occasion.description}</p>
                                    )}

                                    <div className="mt-6 flex items-center justify-between border-t border-[#F0E9DC] pt-4">
                                        <span className="text-xs font-semibold text-[#70685C]">استعرض تشكيلة الباقة</span>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0b3c2e] transition group-hover:text-[#A88746]">
                                            اكتشف المنتجات
                                            <ArrowRight size={14} className="rotate-180" />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}