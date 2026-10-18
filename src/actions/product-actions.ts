"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";
import {
    parseProductForm,
    type FieldErrors,
    type ProductFormState,
    type ProductInput,
} from "@/lib/product-validation";

const UNAUTHORIZED: ProductFormState = {
    status: "error",
    message: "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
};

const fail = (
    message: string,
    values: Record<string, string>,
    fieldErrors?: FieldErrors
): ProductFormState => ({ status: "error", message, values, fieldErrors });

function revalidateStorefront() {
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/products/[id]", "page");
}

const isPrismaError = (e: unknown, code: string) =>
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === code;

type Built =
    | { error: ProductFormState }
    | { data: ProductInput & { category: string | null }; values: Record<string, string> };

/** تحقق من المدخلات + تحقق من التصنيف والرابط المختصر في قاعدة البيانات */
async function validateAndBuild(formData: FormData, currentId?: string): Promise<Built> {
    const parsed = parseProductForm(formData);
    if (!parsed.ok) {
        return { error: fail("يرجى مراجعة الحقول المظللة.", parsed.values, parsed.fieldErrors) };
    }

    const { data, slugAuto, values } = parsed;

    // التصنيف: نتأكد أنه موجود، ونخزن اسمه في الحقل القديم category للتوافق مع الكود الحالي
    let categoryName: string | null = null;
    if (data.categoryId) {
        const category = await db.category.findUnique({
            where: { id: data.categoryId },
            select: { name: true },
        });
        if (!category) {
            return { error: fail("يرجى مراجعة الحقول المظللة.", values, { categoryId: "التصنيف المحدد غير موجود." }) };
        }
        categoryName = category.name;
    }

    // الرابط المختصر: فريد
    let slug = data.slug;
    if (slug) {
        const clash = await db.product.findFirst({
            where: { slug, ...(currentId ? { NOT: { id: currentId } } : {}) },
            select: { id: true },
        });
        if (clash) {
            if (slugAuto) {
                slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
            } else {
                return { error: fail("يرجى مراجعة الحقول المظللة.", values, { slug: "هذا الرابط المختصر مستخدم لمنتج آخر." }) };
            }
        }
    }

    return { data: { ...data, slug, category: categoryName }, values };
}

function dbError(e: unknown, values: Record<string, string>): ProductFormState {
    if (isPrismaError(e, "P2002")) {
        return fail("يرجى مراجعة الحقول المظللة.", values, { slug: "هذا الرابط المختصر مستخدم لمنتج آخر." });
    }
    console.error("[product-actions]", e);
    return fail("حدث خطأ غير متوقع أثناء الحفظ، حاول مرة أخرى.", values);
}

// دالة مساعدة لاستخراج ومعالجة الصور الإضافية من الحقل النصي
function extractAdditionalImages(formData: FormData) {
    const raw = formData.get("additionalImages") as string;
    if (!raw) return [];
    return raw
        .split(/[\n,]/)
        .map((img) => img.trim())
        .filter((img) => img.startsWith("/") || img.startsWith("https://"));
}

/* ───────────── إضافة منتج ───────────── */

export async function addProductAction(
    _prev: ProductFormState,
    formData: FormData
): Promise<ProductFormState> {
    const admin = await getAdminUser();
    if (!admin) return UNAUTHORIZED;

    const built = await validateAndBuild(formData);
    if ("error" in built) return built.error;

    const additionalImages = extractAdditionalImages(formData);

    try {
        await db.product.create({
            data: {
                ...built.data,
                // ربط الصور الإضافية عبر جدول ProductImage
                images: {
                    create: additionalImages.map((url, index) => ({
                        url,
                        sortOrder: index + 1,
                    })),
                },
            },
        });
    } catch (e) {
        return dbError(e, built.values);
    }

    revalidateStorefront();
    redirect("/admin/products?msg=created");
}

/* ───────────── تعديل منتج ───────────── */

export async function updateProductAction(
    _prev: ProductFormState,
    formData: FormData
): Promise<ProductFormState> {
    const admin = await getAdminUser();
    if (!admin) return UNAUTHORIZED;

    const idValue = formData.get("id");
    const id = typeof idValue === "string" ? idValue : "";
    if (!id) return { status: "error", message: "معرّف المنتج مفقود." };

    const built = await validateAndBuild(formData, id);
    if ("error" in built) return built.error;

    const additionalImages = extractAdditionalImages(formData);

    try {
        await db.$transaction(async (tx) => {
            // تحديث بيانات المنتج الأساسية
            await tx.product.update({
                where: { id },
                data: built.data,
            });

            // تحديث الصور الإضافية (حذف القديمة وإضافة الجديدة إذا تم إرسالها)
            if (additionalImages.length > 0) {
                await tx.productImage.deleteMany({ where: { productId: id } });
                await tx.productImage.createMany({
                    data: additionalImages.map((url, index) => ({
                        productId: id,
                        url,
                        sortOrder: index + 1,
                    })),
                });
            }
        });
    } catch (e) {
        if (isPrismaError(e, "P2025")) {
            return fail("هذا المنتج لم يعد موجودًا.", built.values);
        }
        return dbError(e, built.values);
    }

    revalidateStorefront();
    redirect("/admin/products?msg=updated");
}

/* ───────────── حذف منتج ───────────── */

export async function deleteProductAction(formData: FormData): Promise<void> {
    const admin = await getAdminUser();
    if (!admin) redirect("/");

    const idValue = formData.get("id");
    const id = typeof idValue === "string" ? idValue : "";
    if (!id) redirect("/admin/products?msg=error");

    let failed = false;
    try {
        // السلة والمفضلة والصور والمراجعات تُحذف تلقائيًا (Cascade)،
        // وعناصر الطلبات القديمة تبقى محفوظة (productId يصبح null)
        await db.product.delete({ where: { id } });
    } catch (e) {
        if (!isPrismaError(e, "P2025")) {
            console.error("[deleteProductAction]", e);
            failed = true;
        }
    }

    if (failed) redirect("/admin/products?msg=error");

    revalidateStorefront();
    redirect("/admin/products?msg=deleted");
}