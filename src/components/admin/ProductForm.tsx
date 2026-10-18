"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import type { FieldErrors, ProductFormState } from "@/lib/product-validation";

type FormAction = (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;

interface ProductFormProps {
    action: FormAction;
    mode: "create" | "edit";
    categories: { id: string; name: string }[];
    /** قيم أولية (للتعديل). كلها نصوص. */
    defaults?: Record<string, string>;
    productId?: string;
}

const inputCls =
    "w-full rounded-xl border border-[#c5a880]/40 bg-white px-4 py-3 text-sm text-[#0b3c2e] outline-none transition " +
    "placeholder:text-[#0b3c2e]/35 focus:border-[#0b3c2e] focus:ring-2 focus:ring-[#c5a880]/40 " +
    "aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-rose-200";

const BADGE_SUGGESTIONS = ["الأكثر مبيعاً", "جديد", "محدود", "هدية مميزة"];

function Field({
    id,
    label,
    required,
    hint,
    error,
    children,
}: {
    id: string;
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-[#0b3c2e]">
                {label}
                {required && <span className="ms-1 text-rose-600" aria-hidden="true">*</span>}
            </label>
            {children}
            {error ? (
                <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-rose-600">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-[#70685C]">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-3xl border border-[#c5a880]/30 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 flex items-center gap-3 text-base font-black text-[#0b3c2e]">
                <span className="h-5 w-1 rounded-full bg-[#c5a880]" aria-hidden="true" />
                {title}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        </section>
    );
}

export default function ProductForm({ action, mode, categories, defaults = {}, productId }: ProductFormProps) {
    const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, { status: "idle" });

    // عند الخطأ نعيد تعبئة ما كتبه المستخدم (React 19 يصفّر النموذج بعد كل إرسال)
    const v = (key: string) => state.values?.[key] ?? defaults[key] ?? "";
    const errors: FieldErrors = state.fieldErrors ?? {};
    const err = (k: keyof FieldErrors) => errors[k];
    const aria = (k: keyof FieldErrors) => ({
        "aria-invalid": err(k) ? true : undefined,
        "aria-describedby": err(k) ? `${k}-error` : undefined,
    });

    const checked = (key: "isActive" | "isFeatured", fallback: boolean) =>
        state.values ? state.values[key] === "on" : defaults[key] ? defaults[key] === "on" : fallback;

    const [imageUrl, setImageUrl] = useState(defaults.image ?? "");
    const canPreview = imageUrl.startsWith("/") || imageUrl.startsWith("https://");

    return (
        <form
            key={state.status === "error" ? JSON.stringify(state.values) : "form"}
            action={formAction}
            className="space-y-6"
            noValidate
        >
            {mode === "edit" && productId && <input type="hidden" name="id" value={productId} />}

            {state.message && (
                <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {state.message}
                </p>
            )}

            <Section title="المعلومات الأساسية">
                <Field id="name" label="اسم المنتج" required error={err("name")}>
                    <input id="name" name="name" defaultValue={v("name")} placeholder="مثال: بقلاوة بالفستق الحلبي" className={inputCls} {...aria("name")} />
                </Field>

                <Field
                    id="slug"
                    label="الرابط المختصر (Slug)"
                    hint="اتركه فارغًا ليُولَّد تلقائيًا من الاسم."
                    error={err("slug")}
                >
                    <input id="slug" name="slug" dir="ltr" defaultValue={v("slug")} placeholder="pistachio-baklava" className={inputCls + " text-left"} {...aria("slug")} />
                </Field>

                <Field id="categoryId" label="التصنيف" error={err("categoryId")} hint={categories.length === 0 ? "لا توجد تصنيفات بعد، أضفها في جدول Category." : undefined}>
                    <select id="categoryId" name="categoryId" defaultValue={v("categoryId")} className={inputCls} {...aria("categoryId")}>
                        <option value="">بدون تصنيف</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field id="badge" label="الشارة" hint="تظهر على بطاقة المنتج، مثل: الأكثر مبيعاً." error={err("badge")}>
                    <input id="badge" name="badge" list="badge-options" defaultValue={v("badge")} placeholder="اختياري" className={inputCls} {...aria("badge")} />
                    <datalist id="badge-options">
                        {BADGE_SUGGESTIONS.map((b) => (
                            <option key={b} value={b} />
                        ))}
                    </datalist>
                </Field>
            </Section>

            <Section title="التسعير والمخزون">
                <Field id="price" label="السعر الأساسي (ر.س)" required error={err("price")}>
                    <input id="price" name="price" type="number" inputMode="decimal" step="0.01" min="0" defaultValue={v("price")} placeholder="0.00" className={inputCls} {...aria("price")} />
                </Field>

                <Field id="compareAtPrice" label="سعر الشطب قبل الخصم (ر.س)" hint="اختياري، يجب أن يكون أكبر من السعر الأساسي." error={err("compareAtPrice")}>
                    <input id="compareAtPrice" name="compareAtPrice" type="number" inputMode="decimal" step="0.01" min="0" defaultValue={v("compareAtPrice")} placeholder="0.00" className={inputCls} {...aria("compareAtPrice")} />
                </Field>

                <Field id="stock" label="المخزون (عدد القطع)" error={err("stock")}>
                    <input id="stock" name="stock" type="number" inputMode="numeric" step="1" min="0" defaultValue={v("stock") || "0"} className={inputCls} {...aria("stock")} />
                </Field>
            </Section>

            <Section title="الصورة الرئيسية">
                <div className="sm:col-span-2">
                    <Field
                        id="image"
                        label="رابط الصورة"
                        required
                        hint="رابط https:// أو مسار محلي مثل /images/products/cake.jpg"
                        error={err("image")}
                    >
                        <input
                            id="image"
                            name="image"
                            dir="ltr"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className={inputCls + " text-left"}
                            {...aria("image")}
                        />
                    </Field>

                    {canPreview && (
                        <div className="mt-4 h-32 w-32 overflow-hidden rounded-2xl border border-[#c5a880]/40 bg-[#FEF8EB]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt="معاينة الصورة" className="h-full w-full object-cover" />
                        </div>
                    )}
                </div>
            </Section>
            <Section title="الصور المتعددة (المعرض)">
                <div className="sm:col-span-2">
                    <Field
                        id="additionalImages"
                        label="الصور الإضافية (روابط أو مسارات)"
                        hint="ضع كل رابط أو مسار محلي في سطر مستقل، أو افصل بينها بفواصل (اختياري)."
                        error={err("additionalImages")}
                    >
                        <textarea
                            id="additionalImages"
                            name="additionalImages"
                            dir="ltr"
                            rows={3}
                            defaultValue={v("additionalImages")}
                            placeholder={`/images/products/baklava-1.jpg\n/images/products/baklava-2.jpg`}
                            className={inputCls + " text-left resize-y"}
                        />
                    </Field>
                </div>
            </Section>

            <Section title="الوصف">
                <div className="sm:col-span-2">
                    <Field id="note" label="الوصف القصير" hint="يظهر على البطاقة وتحت السعر (حتى 200 حرف)." error={err("note")}>
                        <input id="note" name="note" defaultValue={v("note")} placeholder="علبة هدايا ١ كجم" className={inputCls} {...aria("note")} />
                    </Field>
                </div>

                <div className="sm:col-span-2">
                    <Field id="description" label="الوصف الكامل" error={err("description")}>
                        <textarea id="description" name="description" rows={6} defaultValue={v("description")} placeholder="المكونات، الحجم، طريقة التقديم والحفظ..." className={inputCls + " resize-y leading-7"} {...aria("description")} />
                    </Field>
                </div>
            </Section>

            <Section title="الحالة">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#c5a880]/30 bg-[#FEF8EB] p-4">
                    <input type="checkbox" name="isActive" defaultChecked={checked("isActive", true)} className="mt-1 h-5 w-5 accent-[#0b3c2e]" />
                    <span>
                        <span className="block text-sm font-bold text-[#0b3c2e]">منتج فعّال</span>
                        <span className="block text-xs text-[#70685C]">يظهر في المتجر ويمكن شراؤه.</span>
                    </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#c5a880]/30 bg-[#FEF8EB] p-4">
                    <input type="checkbox" name="isFeatured" defaultChecked={checked("isFeatured", false)} className="mt-1 h-5 w-5 accent-[#0b3c2e]" />
                    <span>
                        <span className="block text-sm font-bold text-[#0b3c2e]">منتج مميز</span>
                        <span className="block text-xs text-[#70685C]">يُعرض ضمن المنتجات المميزة.</span>
                    </span>
                </label>
            </Section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-start">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center justify-center rounded-xl border border-[#c5a880]/60 bg-white px-6 py-3.5 text-sm font-bold text-[#0b3c2e] transition hover:bg-[#c5a880]/15"
                >
                    إلغاء
                </Link>
                <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center justify-center rounded-xl bg-[#0b3c2e] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#062920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending ? "جارٍ الحفظ..." : mode === "create" ? "إضافة المنتج" : "حفظ التعديلات"}
                </button>
            </div>
        </form>
    );
}
