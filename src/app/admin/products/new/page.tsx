import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { addProductAction } from "@/actions/product-actions";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
    await requireAdmin();

    const categories = await db.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
    });

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <Link href="/admin/products" className="text-xs font-semibold text-[#70685C] hover:text-[#0b3c2e]">
                    ← العودة إلى المنتجات
                </Link>
                <h1 className="mt-2 text-2xl font-black sm:text-3xl">إضافة منتج جديد</h1>
            </div>

            <ProductForm mode="create" action={addProductAction} categories={categories} />
        </div>
    );
}