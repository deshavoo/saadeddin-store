import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // طبقة حماية أولى؛ كل صفحة والـ Server Actions تتحقق بنفسها أيضًا
    // لأن الـ layout لا يُعاد تنفيذه عند التنقل بين الصفحات الفرعية.
    await requireAdmin();

    return (
        <div dir="rtl" className="min-h-screen bg-[#FEF8EB] font-['Cairo'] text-[#0b3c2e]">
            <header className="border-b border-[#c5a880]/30 bg-[#0b3c2e] text-[#FEF8EB]">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold tracking-[0.2em] text-[#c5a880]">SAADEDDIN 1919</span>
                        <span className="h-4 w-px bg-[#c5a880]/50" aria-hidden="true" />
                        <span className="text-sm font-bold">لوحة التحكم</span>
                    </div>

                    <nav aria-label="لوحة التحكم" className="flex items-center gap-5 text-sm font-semibold">
                        <Link href="/admin/products" className="text-[#FEF8EB]/85 transition hover:text-[#c5a880]">
                            المنتجات
                        </Link>
                        <Link href="/admin/products/new" className="text-[#FEF8EB]/85 transition hover:text-[#c5a880]">
                            إضافة منتج
                        </Link>
                        <Link href="/" className="text-[#c5a880] transition hover:text-white">
                            العودة للمتجر
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
        </div>
    );
}
