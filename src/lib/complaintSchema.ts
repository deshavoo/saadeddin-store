/**
 * قواعد التحقق المشتركة بين الفورم (المتصفح) والـ API (السيرفر).
 * نفس القواعد في الطرفين: المتصفح للتجربة السريعة، والسيرفر للأمان الفعلي.
 */

export const REQUEST_TYPES = [
    { id: "complaint", label: "شكوى" },
    { id: "inquiry", label: "استفسار" },
    { id: "suggestion", label: "اقتراح" },
    { id: "order-follow-up", label: "متابعة طلب" },
] as const;

export type RequestTypeId = (typeof REQUEST_TYPES)[number]["id"];

export type ComplaintInput = {
    type: RequestTypeId;
    name: string;
    phone: string;
    email: string;
    orderNumber: string;
    message: string;
};

export type FieldName = keyof ComplaintInput;
export type FieldErrors = Partial<Record<FieldName, string>>;

export const LIMITS = {
    nameMin: 2,
    nameMax: 80,
    messageMin: 10,
    messageMax: 1500,
    orderNumberMax: 40,
    emailMax: 120,
} as const;

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** يحوّل الأرقام العربية (٠-٩) لأرقام إنجليزية ويشيل المسافات والشرطات */
export function normalizePhone(value: string): string {
    return value
        .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
        .replace(/[\s\-()]/g, "");
}

const asString = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateComplaint(
    raw: Record<string, unknown>,
): { data: ComplaintInput; errors?: undefined } | { data?: undefined; errors: FieldErrors } {
    const errors: FieldErrors = {};

    const type = asString(raw.type);
    const name = asString(raw.name);
    const phone = normalizePhone(asString(raw.phone));
    const email = asString(raw.email);
    const orderNumber = asString(raw.orderNumber);
    const message = asString(raw.message);

    if (!REQUEST_TYPES.some((t) => t.id === type)) {
        errors.type = "اختر نوع الطلب";
    }

    if (name.length < LIMITS.nameMin) {
        errors.name = "اكتب اسمك الكامل";
    } else if (name.length > LIMITS.nameMax) {
        errors.name = "الاسم طويل جدًا";
    }

    if (!/^\+?\d{8,15}$/.test(phone)) {
        errors.phone = "اكتب رقم جوال صحيح، مثال: 0501234567";
    }

    if (email && (email.length > LIMITS.emailMax || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) {
        errors.email = "البريد الإلكتروني غير صحيح";
    }

    if (orderNumber.length > LIMITS.orderNumberMax) {
        errors.orderNumber = "رقم الطلب طويل جدًا";
    }

    if (message.length < LIMITS.messageMin) {
        errors.message = `اكتب تفاصيل أكثر (${LIMITS.messageMin} أحرف على الأقل)`;
    } else if (message.length > LIMITS.messageMax) {
        errors.message = "الرسالة طويلة جدًا";
    }

    if (Object.keys(errors).length > 0) return { errors };

    return {
        data: { type: type as RequestTypeId, name, phone, email, orderNumber, message },
    };
}
