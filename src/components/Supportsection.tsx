"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
    LIMITS,
    REQUEST_TYPES,
    validateComplaint,
    type FieldErrors,
    type FieldName,
} from "@/lib/complaintSchema";

type SupportSectionProps = {
    className?: string;
    endpoint?: string;
    phone?: string;
};

type Status = "idle" | "submitting" | "success" | "error";

const HEADING_ID = "support-heading";
const FIELD_ORDER: FieldName[] = ["name", "phone", "email", "orderNumber", "message"];

const INPUT =
    "h-12 w-full rounded-xl border border-[#c5a880]/55 bg-white px-4 text-base text-[#005430] placeholder:text-[#005430]/40 transition-colors focus:border-[#005430] focus:outline-none focus:ring-2 focus:ring-[#005430]/20 aria-[invalid=true]:border-[#9b2c33] aria-[invalid=true]:ring-[#9b2c33]/15";

type FieldProps = {
    id: string;
    label: string;
    optional?: boolean;
    error?: string;
    children: ReactNode;
};

function Field({ id, label, optional, error, children }: FieldProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 flex items-baseline gap-2 text-[15px] font-semibold">
                {label}
                {optional && <span className="text-xs font-normal text-[#005430]/55">اختياري</span>}
            </label>
            {children}
            {error && (
                <p id={`${id}-error`} className="mt-2 text-sm leading-6 text-[#9b2c33]">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function SupportSection({
    className = "",
    endpoint = "/api/support",
    phone = "+966920017070",
}: SupportSectionProps) {
    const uid = useId();
    const [status, setStatus] = useState<Status>("idle");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [serverError, setServerError] = useState("");
    const [reference, setReference] = useState("");
    const [messageLength, setMessageLength] = useState(0);
    const successRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (status === "success") successRef.current?.focus();
    }, [status]);

    const idOf = (name: FieldName) => `${uid}-${name}`;
    const aria = (name: FieldName) => ({
        id: idOf(name),
        name,
        "aria-invalid": errors[name] ? (true as const) : undefined,
        "aria-describedby": errors[name] ? `${idOf(name)}-error` : undefined,
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (status === "submitting") return;

        const raw = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, unknown>;
        const result = validateComplaint(raw);

        if (result.errors) {
            setErrors(result.errors);
            setServerError("");
            const first = FIELD_ORDER.find((f) => result.errors?.[f]);
            if (first) document.getElementById(idOf(first))?.focus();
            return;
        }

        setErrors({});
        setServerError("");
        setStatus("submitting");

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // نبعت الحقل المخفي (website) كمان عشان السيرفر يكشف البوتات
                body: JSON.stringify({ ...raw, ...result.data }),
            });
            const json = (await res.json().catch(() => ({}))) as {
                ok?: boolean;
                reference?: string;
                message?: string;
                errors?: FieldErrors;
            };

            if (res.ok && json.ok) {
                setReference(json.reference ?? "");
                setStatus("success");
                return;
            }

            if (json.errors) {
                setErrors(json.errors);
                setStatus("idle");
                return;
            }

            setServerError(json.message ?? "تعذر إرسال رسالتك الآن. حاول مرة أخرى.");
            setStatus("error");
        } catch {
            setServerError("تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
            setStatus("error");
        }
    };

    const reset = () => {
        setStatus("idle");
        setErrors({});
        setServerError("");
        setReference("");
        setMessageLength(0);
    };

    const telHref = `tel:${phone}`;
    const waHref = `https://wa.me/${phone.replace(/\D/g, "")}`;

    return (
        <section
            id="support"
            dir="rtl"
            lang="ar"
            aria-labelledby={HEADING_ID}
            className={`relative scroll-mt-20 overflow-x-clip bg-[#fef8eb] py-16 text-[#005430] sm:py-24 lg:py-28 ${className}`}
        >
            <div className="mx-auto grid max-w-7xl gap-x-16 gap-y-10 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 xl:gap-x-24">
                {/* العنوان */}
                <header className="lg:col-start-1 lg:row-start-1">
                    <h1
                        id={HEADING_ID}
                        className="text-[2rem] font-semibold leading-normal sm:text-5xl sm:leading-[1.4]"
                    >
                        الشكاوى وخدمة العملاء
                    </h1>
                    <div
                        aria-hidden="true"
                        className="mt-6 h-px w-24 bg-[linear-gradient(to_left,#c5a880,transparent)] sm:mt-8 sm:w-32"
                    />
                    <p className="mt-6 max-w-[46ch] text-base leading-8 text-[#005430]/80 sm:mt-8 sm:text-lg sm:leading-9">
                        رأيك يهمنا. أرسل لنا شكواك أو استفسارك أو اقتراحك، وسيتواصل معك فريق خدمة
                        العملاء في أقرب وقت.
                    </p>
                </header>

                {/* الفورم */}
                <div className="rounded-3xl border border-[#c5a880]/35 bg-white p-5 shadow-[0_30px_60px_-28px_rgba(0,84,48,0.45)] sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                    {status === "success" ? (
                        <div role="status" className="py-6 text-center sm:py-10">
                            <h2
                                ref={successRef}
                                tabIndex={-1}
                                className="text-2xl font-semibold leading-snug focus:outline-none sm:text-3xl"
                            >
                                تم استلام رسالتك
                            </h2>
                            <p className="mx-auto mt-4 max-w-[40ch] leading-8 text-[#005430]/80">
                                شكرًا لتواصلك معنا. سيتواصل معك فريق خدمة العملاء في أقرب وقت.
                            </p>
                            {reference && (
                                <p className="mt-6 text-sm text-[#005430]/70">
                                    رقم المرجع:{" "}
                                    <span dir="ltr" className="font-bold text-[#005430]">
                                        {reference}
                                    </span>
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={reset}
                                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-[#005430] px-8 text-base font-bold text-[#005430] transition-colors duration-300 hover:bg-[#005430] hover:text-[#fef8eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                            >
                                إرسال رسالة جديدة
                            </button>
                        </div>
                    ) : (
                        <form noValidate onSubmit={handleSubmit} aria-busy={status === "submitting"} className="space-y-6">
                            {/* نوع الطلب */}
                            <fieldset>
                                <legend className="mb-3 text-[15px] font-semibold">نوع الطلب</legend>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {REQUEST_TYPES.map((t, i) => (
                                        <label key={t.id} className="relative block cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                value={t.id}
                                                defaultChecked={i === 0}
                                                className="peer sr-only"
                                            />
                                            <span className="flex min-h-12 items-center justify-center rounded-xl border border-[#c5a880]/55 bg-white px-2 py-2 text-center text-[15px] font-semibold leading-snug transition-colors duration-200 hover:border-[#c5a880] peer-checked:border-[#005430] peer-checked:bg-[#005430] peer-checked:text-[#fef8eb] peer-focus-visible:ring-2 peer-focus-visible:ring-[#c5a880] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white motion-reduce:transition-none">
                                                {t.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field id={idOf("name")} label="الاسم الكامل" error={errors.name}>
                                    <input
                                        {...aria("name")}
                                        type="text"
                                        autoComplete="name"
                                        maxLength={LIMITS.nameMax}
                                        placeholder="اكتب اسمك"
                                        className={INPUT}
                                    />
                                </Field>

                                <Field id={idOf("phone")} label="رقم الجوال" error={errors.phone}>
                                    <input
                                        {...aria("phone")}
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        dir="ltr"
                                        placeholder="05XXXXXXXX"
                                        className={`${INPUT} text-right`}
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field id={idOf("email")} label="البريد الإلكتروني" optional error={errors.email}>
                                    <input
                                        {...aria("email")}
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        dir="ltr"
                                        maxLength={LIMITS.emailMax}
                                        placeholder="name@example.com"
                                        className={`${INPUT} text-right`}
                                    />
                                </Field>

                                <Field id={idOf("orderNumber")} label="رقم الطلب" optional error={errors.orderNumber}>
                                    <input
                                        {...aria("orderNumber")}
                                        type="text"
                                        dir="ltr"
                                        maxLength={LIMITS.orderNumberMax}
                                        placeholder="مثال: 12345"
                                        className={`${INPUT} text-right`}
                                    />
                                </Field>
                            </div>

                            <Field id={idOf("message")} label="تفاصيل رسالتك" error={errors.message}>
                                <textarea
                                    {...aria("message")}
                                    rows={6}
                                    maxLength={LIMITS.messageMax}
                                    onChange={(e) => setMessageLength(e.target.value.length)}
                                    placeholder="اكتب لنا ما حدث بالتفصيل"
                                    className="w-full resize-y rounded-xl border border-[#c5a880]/55 bg-white p-4 text-base leading-8 text-[#005430] placeholder:text-[#005430]/40 transition-colors focus:border-[#005430] focus:outline-none focus:ring-2 focus:ring-[#005430]/20 aria-invalid:border-[#9b2c33] aria-invalid:ring-[#9b2c33]/15"
                                />
                                <p dir="ltr" className="mt-2 text-end text-xs text-[#005430]/55">
                                    {messageLength}/{LIMITS.messageMax}
                                </p>
                            </Field>

                            {/* Honeypot: مخفي عن المستخدمين، البوتات بتملاه */}
                            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                                <label>
                                    الموقع الإلكتروني
                                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                                </label>
                            </div>

                            {serverError && (
                                <p
                                    role="alert"
                                    className="rounded-xl border border-[#9b2c33]/40 bg-[#9b2c33]/5 p-4 text-sm leading-7 text-[#9b2c33]"
                                >
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#005430] px-10 py-4 text-base font-bold text-[#fef8eb] shadow-[0_18px_40px_-16px_rgba(0,84,48,0.55)] transition-colors duration-300 hover:bg-[#c5a880] hover:text-[#005430] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none sm:text-lg"
                            >
                                {status === "submitting" ? "جارٍ الإرسال…" : "إرسال الرسالة"}
                            </button>
                        </form>
                    )}
                </div>

                {/* التواصل المباشر */}
                <div className="lg:col-start-1 lg:row-start-2">
                    <div className="border-t border-[#c5a880]/40 pt-8">
                        <h2 className="text-xl font-semibold leading-snug sm:text-2xl">تفضّل التواصل المباشر؟</h2>
                        <ul role="list" className="mt-5 space-y-4">
                            <li className="flex items-baseline justify-between gap-4">
                                <span className="text-[#005430]/70">اتصل بنا</span>
                                <a
                                    href={telHref}
                                    dir="ltr"
                                    className="font-bold underline decoration-[#c5a880] decoration-2 underline-offset-8 transition-colors hover:text-[#8f7041] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                                >
                                    {phone}
                                </a>
                            </li>
                            <li className="flex items-baseline justify-between gap-4">
                                <span className="text-[#005430]/70">واتساب</span>
                                <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold underline decoration-[#c5a880] decoration-2 underline-offset-8 transition-colors hover:text-[#8f7041] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                                >
                                    تواصل معنا عبر واتساب
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}