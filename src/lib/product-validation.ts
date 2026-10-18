// ملف نقي (بدون قاعدة بيانات) ليُستخدم في الـ Server Actions وفي مكوّن النموذج معًا.

export type ProductField =
    | "name"
    | "slug"
    | "price"
    | "compareAtPrice"
    | "categoryId"
    | "badge"
    | "stock"
    | "image"
    | "additionalImages"
    | "note"
    | "description";

export type FieldErrors = Partial<Record<ProductField, string>>;

export interface ProductFormState {
    status: "idle" | "error";
    message?: string;
    fieldErrors?: FieldErrors;
    /** القيم المُدخلة، لإعادة تعبئة النموذج عند الخطأ */
    values?: Record<string, string>;
}

export interface ProductInput {
    name: string;
    slug: string | null;
    price: number;
    compareAtPrice: number | null;
    categoryId: string | null;
    badge: string | null;
    stock: number;
    image: string;
    note: string | null;
    description: string | null;
    isActive: boolean;
    isFeatured: boolean;
}

export type ParseResult =
    | { ok: true; data: ProductInput; slugAuto: boolean; values: Record<string, string> }
    | { ok: false; fieldErrors: FieldErrors; values: Record<string, string> };

const text = (fd: FormData, key: string) => {
    const v = fd.get(key);
    return typeof v === "string" ? v.trim() : "";
};

// يحوّل الأرقام العربية/الفارسية إلى لاتينية والفاصلة العشرية "٫" إلى "."
const normalizeDigits = (s: string) =>
    s
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
        .replace(/٫/g, ".");

export const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

const SLUG_REGEX = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

// روابط https فقط، أو مسار محلي يبدأ بـ "/" (يمنع javascript: و data:)
const isValidImage = (value: string) => {
    if (value.startsWith("/") && !value.startsWith("//")) return !/\s/.test(value);
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
};

export function parseProductForm(fd: FormData): ParseResult {
    const values: Record<string, string> = {
        name: text(fd, "name"),
        slug: text(fd, "slug"),
        price: text(fd, "price"),
        compareAtPrice: text(fd, "compareAtPrice"),
        categoryId: text(fd, "categoryId"),
        badge: text(fd, "badge"),
        stock: text(fd, "stock"),
        image: text(fd, "image"),
        additionalImages: text(fd, "additionalImages"),
        note: text(fd, "note"),
        description: text(fd, "description"),
        isActive: fd.get("isActive") === "on" ? "on" : "",
        isFeatured: fd.get("isFeatured") === "on" ? "on" : "",
    };

    const errors: FieldErrors = {};

    // الاسم
    if (values.name.length < 2) errors.name = "اسم المنتج مطلوب (حرفان على الأقل).";
    else if (values.name.length > 120) errors.name = "الاسم طويل جدًا (الحد الأقصى 120 حرفًا).";

    // الرابط المختصر
    let slug: string | null = null;
    let slugAuto = false;
    if (values.slug) {
        slug = values.slug.toLowerCase();
        if (slug.length > 80) errors.slug = "الرابط المختصر طويل جدًا (الحد الأقصى 80 حرفًا).";
        else if (!SLUG_REGEX.test(slug)) errors.slug = "استخدم حروفًا وأرقامًا وشرطات (-) فقط، بدون مسافات.";
    } else {
        slug = slugify(values.name) || null;
        slugAuto = true;
    }

    // السعر
    let price = NaN;
    if (!values.price) errors.price = "السعر مطلوب.";
    else {
        price = Math.round(Number(normalizeDigits(values.price)) * 100) / 100;
        if (!Number.isFinite(price) || price <= 0) errors.price = "أدخل سعرًا صحيحًا أكبر من صفر.";
        else if (price > 1_000_000) errors.price = "السعر أكبر من الحد المسموح.";
    }

    // سعر الشطب
    let compareAtPrice: number | null = null;
    if (values.compareAtPrice) {
        const n = Math.round(Number(normalizeDigits(values.compareAtPrice)) * 100) / 100;
        if (!Number.isFinite(n) || n <= 0) errors.compareAtPrice = "أدخل سعرًا صحيحًا.";
        else if (Number.isFinite(price) && n <= price) errors.compareAtPrice = "يجب أن يكون سعر الشطب أكبر من السعر الأساسي.";
        else compareAtPrice = n;
    }

    // المخزون
    let stock = 0;
    if (values.stock) {
        stock = Number(normalizeDigits(values.stock));
        if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
            errors.stock = "أدخل عددًا صحيحًا من 0 فما فوق.";
        }
    }

    // الصورة الرئيسية
    if (!values.image) errors.image = "رابط الصورة الرئيسية مطلوب.";
    else if (values.image.length > 500) errors.image = "الرابط طويل جدًا.";
    else if (!isValidImage(values.image)) errors.image = "استخدم رابط https:// أو مسارًا محليًا يبدأ بـ / مثل /images/products/cake.jpg";

    // الصور الإضافية (اختياري)
    if (values.additionalImages) {
        const lines = values.additionalImages.split(/[\n,]/).map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
            if (line.length > 500 || !isValidImage(line)) {
                errors.additionalImages = "بعض الروابط أو المسارات الإضافية غير صحيحة. استخدم روابط https:// أو مسارات تبدأ بـ /";
                break;
            }
        }
    }

    // النصوص الاختيارية
    if (values.badge.length > 30) errors.badge = "الشارة طويلة (الحد الأقصى 30 حرفًا).";
    if (values.note.length > 200) errors.note = "الوصف القصير طويل (الحد الأقصى 200 حرف).";
    if (values.description.length > 5000) errors.description = "الوصف الكامل طويل (الحد الأقصى 5000 حرف).";
    if (values.categoryId.length > 60) errors.categoryId = "تصنيف غير صالح.";

    if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors, values };

    return {
        ok: true,
        slugAuto,
        values,
        data: {
            name: values.name,
            slug,
            price,
            compareAtPrice,
            categoryId: values.categoryId || null,
            badge: values.badge || null,
            stock,
            image: values.image,
            note: values.note || null,
            description: values.description || null,
            isActive: values.isActive === "on",
            isFeatured: values.isFeatured === "on",
        },
    };
}