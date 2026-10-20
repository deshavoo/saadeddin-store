"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";


type CakeImage = {
    src: string | StaticImageData;
    alt: string;
};

type CustomCakeSectionProps = {
    className?: string;
    image?: CakeImage;
    href?: string;
};

type Option = { id: string; label: string; swatch?: string };
type ChoiceKey = "size" | "flavor" | "decor";

const DEFAULT_IMAGE: CakeImage = {
    src: "/images/custom-cake/custom-cake.jpg",
    alt: "كيكة وردية فاخرة متعددة الطبقات مزينة بورود طبيعية ولمسات من ورق الذهب بجانب مزهرية زجاجية",
};

const HEADING_ID = "custom-cake-heading";
const MESSAGE_MAX = 60;

const STEPS = [
    { key: "size", title: "اختر الحجم" },
    { key: "flavor", title: "اختر النكهة" },
    { key: "decor", title: "اختر التزيين" },
    { key: "message", title: "أضف رسالتك الخاصة" },
] as const;

const OPTIONS: Record<ChoiceKey, Option[]> = {
    size: [
        { id: "small", label: "صغير" },
        { id: "medium", label: "متوسط" },
        { id: "large", label: "كبير" },
        { id: "tiered", label: "متعدد الطبقات" },
    ],
    flavor: [
        { id: "vanilla", label: "فانيليا", swatch: "#f1e2bd" },
        { id: "chocolate", label: "شوكولاتة", swatch: "#4b2e20" },
        { id: "caramel", label: "كراميل", swatch: "#c78b3e" },
        { id: "red-velvet", label: "ريد فلفيت", swatch: "#9b2c33" },
    ],
    decor: [
        { id: "flowers", label: "ورود طبيعية" },
        { id: "gold-leaf", label: "ورق الذهب" },
        { id: "flowers-gold", label: "ورود وورق الذهب" },
        { id: "classic", label: "كلاسيكي" },
    ],
};

const FEATURES: { label: string; icon: ReactNode }[] = [
    {
        label: "صُنع بحب وعناية",
        icon: <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />,
    },
    {
        label: "توصيل مبرد لضمان الجودة",
        icon: <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />,
    },
    {
        label: "مكونات فاخرة",
        icon: <path d="M6 4h12l3.5 5L12 20.5 2.5 9zM2.5 9h19" />,
    },
];

const labelOf = (key: ChoiceKey, id: string | null) =>
    id ? OPTIONS[key].find((o) => o.id === id)?.label ?? null : null;

export default function CustomCakeSection({
    className = "",
    image = DEFAULT_IMAGE,
    href = "/custom-orders",
}: CustomCakeSectionProps) {
    const uid = useId();
    const [active, setActive] = useState(0);
    const [choice, setChoice] = useState<Record<ChoiceKey, string | null>>({
        size: null,
        flavor: null,
        decor: null,
    });
    const [message, setMessage] = useState("");
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const select = (key: ChoiceKey, value: string, stepIndex: number) => {
        setChoice((prev) => ({ ...prev, [key]: value }));
        // ننتقل للخطوة التالية بعد لحظة قصيرة عشان الاختيار يبان
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setActive(Math.min(stepIndex + 1, STEPS.length - 1)), 280);
    };

    const summary = (index: number): string => {
        const key = STEPS[index].key;
        if (key === "message") return message.trim() ? message.trim() : "اختياري";
        return labelOf(key, choice[key]) ?? "لم يتم الاختيار";
    };

    const params = new URLSearchParams();
    (Object.keys(choice) as ChoiceKey[]).forEach((k) => {
        const v = choice[k];
        if (v) params.set(k, v);
    });
    if (message.trim()) params.set("message", message.trim());
    const startHref = params.toString() ? `${href}?${params.toString()}` : href;

    return (
        <section
            id="custom-cake"
            dir="rtl"
            lang="ar"
            aria-labelledby={HEADING_ID}
            className={`relative scroll-mt-20 overflow-x-clip bg-white py-20 text-[#005430] sm:py-28 lg:py-32 ${className}`}
        >
            <div className="mx-auto grid max-w-7xl gap-x-16 gap-y-10 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-20 lg:px-10 xl:gap-x-28">
                {/* العنوان */}
                <header className="lg:col-start-1 lg:row-start-1">
                    <h2
                        id={HEADING_ID}
                        className="text-[2rem] font-semibold leading-normal sm:text-5xl sm:leading-[1.4]"
                    >
                        صمم كيكة تناسب مناسبتك
                    </h2>
                    <div
                        aria-hidden="true"
                        className="mt-6 h-px w-24 bg-[linear-gradient(to_left,#c5a880,transparent)] sm:mt-8 sm:w-32"
                    />
                    <p className="mt-6 text-lg leading-9 text-[#8f7041] sm:mt-8 sm:text-xl">
                        اصنع لحظة لا تُنسى – خطوة بخطوة
                    </p>
                </header>

                {/* الصورة */}
                <figure className="relative mx-auto w-full max-w-md sm:max-w-lg lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none lg:self-start lg:sticky lg:top-28">
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute top-3 -inset-e-3 h-full w-full rounded-2xl border border-[#c5a880]/50 sm:top-4 sm:-inset-e-4"
                    />
                    <div className="relative aspect-5/4 w-full overflow-hidden rounded-2xl bg-[#005430]/10 shadow-[0_30px_60px_-24px_rgba(0,84,48,0.5)] lg:aspect-4/5">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 512px, 100vw"
                            quality={90}
                            className="object-cover object-center"
                        />
                    </div>
                </figure>

                {/* الواجهة التفاعلية */}
                <div className="lg:col-start-1 lg:row-start-2">
                    {/* كروت الخطوات */}
                    <ol className="grid grid-cols-2 gap-3 sm:gap-4">
                        {STEPS.map((step, index) => {
                            const isActive = active === index;
                            return (
                                <li key={step.key}>
                                    <button
                                        type="button"
                                        onClick={() => setActive(index)}
                                        aria-current={isActive ? "step" : undefined}
                                        aria-controls={`${uid}-panel-${index}`}
                                        className={`flex min-h-28 w-full flex-col items-start gap-1 rounded-2xl border p-4 text-start transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none sm:p-5 ${isActive
                                                ? "border-[#005430] bg-[#005430] text-[#fef8eb] shadow-[0_18px_36px_-18px_rgba(0,84,48,0.7)]"
                                                : "border-[#c5a880]/45 bg-white text-[#005430] hover:border-[#c5a880]"
                                            }`}
                                    >
                                        <span
                                            className={`text-3xl font-light leading-none ${isActive ? "text-[#c5a880]" : "text-[#a88746]"
                                                }`}
                                        >
                                            {index + 1}
                                        </span>
                                        <span className="mt-2 text-[15px] font-semibold leading-snug sm:text-base">
                                            {step.title}
                                        </span>
                                        <span
                                            className={`line-clamp-1 w-full text-xs ${isActive ? "text-[#fef8eb]/75" : "text-[#005430]/60"
                                                }`}
                                        >
                                            {summary(index)}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>

                    {/* لوحة الخيارات */}
                    <div className="mt-4 rounded-2xl border border-[#c5a880]/30 bg-[#fef8eb] p-4 sm:mt-5 sm:p-6">
                        {STEPS.map((step, index) => {
                            const panelId = `${uid}-panel-${index}`;
                            const titleId = `${panelId}-title`;
                            const hidden = active !== index;

                            if (step.key === "message") {
                                return (
                                    <div key={step.key} id={panelId} hidden={hidden}>
                                        <label
                                            htmlFor={`${uid}-message`}
                                            className="mb-3 block text-base font-semibold"
                                        >
                                            {step.title}
                                        </label>
                                        <textarea
                                            id={`${uid}-message`}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                                            maxLength={MESSAGE_MAX}
                                            rows={3}
                                            placeholder="اكتب رسالتك التي تريدها على الكيكة"
                                            className="w-full resize-none rounded-xl border border-[#c5a880]/50 bg-white p-4 text-base leading-8 text-[#005430] placeholder:text-[#005430]/45 focus:border-[#005430] focus:outline-none focus:ring-2 focus:ring-[#005430]/20"
                                        />
                                        <p className="mt-2 text-end text-xs text-[#005430]/60" dir="ltr">
                                            {message.length}/{MESSAGE_MAX}
                                        </p>
                                    </div>
                                );
                            }

                            const key = step.key;
                            return (
                                <div key={step.key} id={panelId} hidden={hidden}>
                                    <p id={titleId} className="mb-3 text-base font-semibold">
                                        {step.title}
                                    </p>
                                    <div
                                        role="radiogroup"
                                        aria-labelledby={titleId}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        {OPTIONS[key].map((option) => (
                                            <label key={option.id} className="relative block cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`${uid}-${key}`}
                                                    value={option.id}
                                                    checked={choice[key] === option.id}
                                                    onChange={() => select(key, option.id, index)}
                                                    className="peer sr-only"
                                                />
                                                <span className="flex min-h-14 items-center justify-center gap-2.5 rounded-xl border border-[#c5a880]/45 bg-white px-3 py-3 text-center text-[15px] font-semibold leading-snug transition-colors duration-200 hover:border-[#c5a880] peer-checked:border-[#005430] peer-checked:bg-[#005430] peer-checked:text-[#fef8eb] peer-focus-visible:ring-2 peer-focus-visible:ring-[#c5a880] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#fef8eb] motion-reduce:transition-none sm:text-base">
                                                    {option.swatch && (
                                                        <span
                                                            aria-hidden="true"
                                                            style={{ backgroundColor: option.swatch }}
                                                            className="h-4 w-4 shrink-0 rounded-full border border-[#c5a880]/60"
                                                        />
                                                    )}
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* مميزات الخدمة */}
                    <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-3">
                        {FEATURES.map(({ label, icon }) => (
                            <li key={label} className="flex items-center gap-3">
                                <span
                                    aria-hidden="true"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c5a880]/50 bg-[#fef8eb]"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="22"
                                        height="22"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-[#005430]"
                                    >
                                        {icon}
                                    </svg>
                                </span>
                                <span className="text-sm font-semibold leading-snug">{label}</span>
                            </li>
                        ))}
                    </ul>

                    {/* زرار البدء */}
                    <Link
                        href={startHref}
                        className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#005430] px-10 py-4 text-base font-bold text-[#fef8eb] shadow-[0_18px_40px_-16px_rgba(0,84,48,0.55)] transition-colors duration-300 hover:bg-[#c5a880] hover:text-[#005430] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none sm:mt-10 sm:text-lg"
                    >
                        ابدأ تصميمك الآن
                    </Link>
                </div>
            </div>
        </section>
    );
}