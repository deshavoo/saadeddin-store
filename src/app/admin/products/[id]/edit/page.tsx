import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { updateProductAction } from "@/actions/product-actions";
import ProductForm from "@/components/admin/ProductForm";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
    await requireAdmin();
    const { id } = await params;

    const [product, categories] = await Promise.all([
        db.product.findUnique({ where: { id } }),
        db.category.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            select: { id: true, name: true },
        }),
    ]);

    if (!product) notFound();

    // منتجات قديمة لها اسم تصنيف نصي فقط: نربطها بالتصنيف المطابق في الجدول إن وُجد
    const categoryId =
        product.categoryId ?? categories.find((c) => c.name === product.category)?.id ?? "";

    const defaults: Record<string, string> = {
        name: product.name,
        slug: product.slug ?? "",
        price: String(product.price),
        compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
        categoryId,
        badge: product.badge ?? "",
        stock: String(product.stock),
        image: product.image,
        note: product.note ?? "",
        description: product.description ?? "",
        isActive: product.isActive ? "on" : "",
        isFeatured: product.isFeatured ? "on" : "",
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <Link href="/admin/products" className="text-xs font-semibold text-[#70685C] hover:text-[#0b3c2e]">
                    ← العودة إلى المنتجات
                </Link>
                <h1 className="mt-2 text-2xl font-black sm:text-3xl">تعديل: {product.name}</h1>
            </div>

            <ProductForm
                mode="edit"
                action={updateProductAction}
                categories={categories}
                defaults={defaults}
                productId={product.id}
            />
        </div>
    );
}