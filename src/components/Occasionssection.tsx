"use client";

import {
    useId,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ComponentType,
    type FocusEvent,
    type PointerEvent,
    type ReactNode,
    type SVGProps,
} from "react";
import Image, { type StaticImageData } from "next/image";
import {
    AnimatePresence,
    MotionConfig,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type Variants,
} from "framer-motion";
export type CountryCode = "EG" | "SA";
export type CountryFilter = "all" | CountryCode;
export type HoverEffectName = "crescent" | "celebration" | "emblem" | "sparkle";
export type MotifName =
    | "star"
    | "sun"
    | "lantern"
    | "palm"
    | "crescent"
    | "blossom"
    | "arch"
    | "pyramid";

export interface OccasionImage {
    src: string | StaticImageData;
    alt: string;
}

export interface Occasion {
    id: string;
    title: string;
    description: string;
    countries: readonly CountryCode[];
    start: string;
    end?: string;
    isApproximate?: boolean;
    effect: HoverEffectName;
    motif: MotifName;
    image: OccasionImage;
    href: string;
    ctaLabel: string;
}
export interface OccasionsSectionProps {
    occasions?: readonly Occasion[];
    className?: string;
}
const IMAGE_BASE_PATH = "/images/occasions";
const IMAGE_EXTENSION = "jpg";
const imageFor = (id: string) => `${IMAGE_BASE_PATH}/${id}.${IMAGE_EXTENSION}`;
const srcKey = (src: OccasionImage["src"]) => (typeof src === "string" ? src : src.src);
const OCCASIONS: readonly Occasion[] = [
    {
        id: "coptic-christmas",
        title: "عيد الميلاد المجيد",
        description:
            "ليلة الميلاد تستحق مائدة حلوى تجمع العائلة؛ علب شوكولاتة ومعجنات مغلّفة بأناقة الاحتفال.",
        countries: ["EG"],
        start: "2027-01-07",
        effect: "sparkle",
        motif: "star",
        image: {
            src: imageFor("coptic-christmas"),
            alt: "علبة حلوى فاخرة بزينة ميلادية ذهبية",
        },
        href: "/occasions/coptic-christmas",
        ctaLabel: "اكتشف هدايا الميلاد",
    },
    {
        id: "january-25",
        title: "عيد الثورة وعيد الشرطة",
        description:
            "إجازة رسمية تجمع الأحبّة؛ علب ضيافة صغيرة من حلوياتنا المختارة للّمّات القصيرة.",
        countries: ["EG"],
        start: "2027-01-25",
        effect: "sparkle",
        motif: "sun",
        image: {
            src: imageFor("january-25"),
            alt: "تشكيلة حلوى شرقية مقدّمة للضيافة",
        },
        href: "/occasions/january-25",
        ctaLabel: "تصفّح علب الضيافة",
    },
    {
        id: "ramadan",
        title: "شهر رمضان المبارك",
        description:
            "من الإفطار إلى السحور، تشكيلات القطايف والكنافة والتمور المحشوة لموائد الشهر ولياليه.",
        countries: ["EG", "SA"],
        start: "2027-02-08",
        end: "2027-03-09",
        isApproximate: true,
        effect: "crescent",
        motif: "lantern",
        image: {
            src: imageFor("ramadan"),
            alt: "تمور محشوة وحلويات رمضانية على مائدة الإفطار",
        },
        href: "/occasions/ramadan",
        ctaLabel: "تسوّق مجموعة رمضان",
    },
    {
        id: "saudi-founding-day",
        title: "يوم التأسيس السعودي",
        description:
            "احتفاءً بتأسيس الدولة السعودية عام ١٧٢٧م، تشكيلة مستوحاة من الضيافة النجدية بالتمر والقهوة والهيل.",
        countries: ["SA"],
        start: "2027-02-22",
        effect: "emblem",
        motif: "palm",
        image: {
            src: imageFor("saudi-founding-day"),
            alt: "تمور وقهوة عربية في تقديمة تراثية",
        },
        href: "/occasions/saudi-founding-day",
        ctaLabel: "اكتشف مجموعة التأسيس",
    },
    {
        id: "eid-al-fitr",
        title: "عيد الفطر المبارك",
        description:
            "صباح العيد يبدأ بالكعك والمعمول والشوكولاتة الفاخرة في علب تُهدى لمن تحب.",
        countries: ["EG", "SA"],
        start: "2027-03-10",
        end: "2027-03-12",
        isApproximate: true,
        effect: "celebration",
        motif: "crescent",
        image: {
            src: imageFor("eid-al-fitr"),
            alt: "كعك ومعمول العيد في علبة هدايا فاخرة",
        },
        href: "/occasions/eid-al-fitr",
        ctaLabel: "تسوّق هدايا العيد",
    },
    {
        id: "sham-el-nessim",
        title: "شم النسيم",
        description:
            "نزهة الربيع بسلّة أنيقة من الحلوى والمعجنات الخفيفة تليق بيوم الطبيعة.",
        countries: ["EG"],
        start: "2027-05-03",
        effect: "sparkle",
        motif: "blossom",
        image: {
            src: imageFor("sham-el-nessim"),
            alt: "سلة نزهة ربيعية بالمعجنات والحلوى",
        },
        href: "/occasions/sham-el-nessim",
        ctaLabel: "اكتشف سلال الربيع",
    },
    {
        id: "eid-al-adha",
        title: "عيد الأضحى المبارك",
        description:
            "أيام صلة الرحم؛ علب هدايا مغلّفة بعناية تُحمل إلى بيوت الأهل والأحباب.",
        countries: ["EG", "SA"],
        start: "2027-05-16",
        end: "2027-05-19",
        isApproximate: true,
        effect: "celebration",
        motif: "arch",
        image: {
            src: imageFor("eid-al-adha"),
            alt: "علبة هدايا أضحى بحلويات شرقية فاخرة",
        },
        href: "/occasions/eid-al-adha",
        ctaLabel: "تسوّق هدايا الأضحى",
    },
    {
        id: "egypt-national-day",
        title: "العيد القومي لمصر",
        description:
            "ذكرى ثورة ٢٣ يوليو ١٩٥٢، وتشكيلة تحتفي بحلويات الشرق العريقة.",
        countries: ["EG"],
        start: "2027-07-23",
        effect: "sparkle",
        motif: "pyramid",
        image: {
            src: imageFor("egypt-national-day"),
            alt: "حلويات شرقية مرتبة في صينية نحاسية",
        },
        href: "/occasions/egypt-national-day",
        ctaLabel: "تصفّح التشكيلة الوطنية",
    },
    {
        id: "saudi-national-day",
        title: "اليوم الوطني السعودي",
        description:
            "الثالث والعشرون من سبتمبر، يوم الفخر الأخضر؛ هدايا وطنية للعائلات والشركات.",
        countries: ["SA"],
        start: "2027-09-23",
        effect: "emblem",
        motif: "star",
        image: {
            src: imageFor("saudi-national-day"),
            alt: "علبة هدايا باللون الأخضر والذهبي لليوم الوطني",
        },
        href: "/occasions/saudi-national-day",
        ctaLabel: "اكتشف مجموعة الوطن",
    },
];



interface CardStyle {
    surface: string;
    border: string;
    title: string;
    body: string;
    meta: string;
    icon: string;
    divider: string;
    badge: string;
    cta: string;
    frame: string;
    panel: string;
    fallbackMotif: string;
}

const CARD_STYLE: CardStyle = {
    surface: "bg-[linear-gradient(135deg,#E9D9B6_0%,#D6BF92_52%,#BC9C6B_100%)]",
    border: "border-[#a8895c]/55",
    title: "text-[#0b3c2e]",
    body: "text-[#0b3c2e]/90",
    meta: "text-[#0b3c2e]",
    icon: "text-[#0b3c2e]/70",
    divider: "border-[#0b3c2e]/20",
    badge: "border-[#0b3c2e]/20 bg-white/45 text-[#0b3c2e]/90",
    cta: "border-[#0b3c2e]/55 text-[#0b3c2e] group-hover:bg-[#0b3c2e] group-hover:text-[#FEF8EB] group-focus-within:bg-[#0b3c2e] group-focus-within:text-[#FEF8EB]",
    frame: "border-[#FEF8EB]/70",
    panel: "bg-[#C9AB7B]",
    fallbackMotif: "text-[#0b3c2e]/70",
};

const toUtcDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const dayMonthFormat = new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
});

const fullDateFormat = new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});


const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MAX_TILT_DEG = 5;
const TILT_SPRING = { stiffness: 220, damping: 24, mass: 0.5 };

const gridVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: EASE_OUT_EXPO },
    },
};

function useCardTilt(disabled: boolean) {
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const x = useSpring(pointerX, TILT_SPRING);
    const y = useSpring(pointerY, TILT_SPRING);

    const rotateX = useTransform(y, [-0.5, 0.5], [MAX_TILT_DEG, -MAX_TILT_DEG]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-MAX_TILT_DEG, MAX_TILT_DEG]);
    const glareX = useTransform(x, (v) => `${v * 100}%`);
    const glareY = useTransform(y, (v) => `${v * 100}%`);

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        if (disabled || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    };

    const reset = () => {
        pointerX.set(0);
        pointerY.set(0);
    };

    return { rotateX, rotateY, glareX, glareY, onPointerMove, reset };
}



const SUN_RAYS = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI) / 6;
    const point = (r: number) =>
        `${(60 + r * Math.cos(angle)).toFixed(2)} ${(60 + r * Math.sin(angle)).toFixed(2)}`;
    return `M${point(26)}L${point(40)}`;
});

const MOTIF_SHAPES: Record<MotifName, ReactNode> = {
    star: (
        <>
            <rect x="32" y="32" width="56" height="56" />
            <rect x="32" y="32" width="56" height="56" transform="rotate(45 60 60)" />
            <circle cx="60" cy="60" r="14" />
            <circle cx="60" cy="60" r="3.5" />
        </>
    ),
    sun: (
        <>
            <circle cx="60" cy="60" r="16" />
            <circle cx="60" cy="60" r="21" opacity="0.5" />
            {SUN_RAYS.map((d) => (
                <path key={d} d={d} />
            ))}
        </>
    ),
    lantern: (
        <>
            <path d="M60 8v14" />
            <path d="M44 34h32l-5-12H49z" />
            <path d="M44 34c-9 14-9 38 0 52h32c9-14 9-38 0-52" />
            <path d="M60 34v52" />
            <path d="M52 34c-5 14-5 38 0 52M68 34c5 14 5 38 0 52" />
            <path d="M48 86h24l-4 12H52z" />
            <path d="M60 98v10" />
        </>
    ),
    palm: (
        <>
            <path d="M60 104V54" />
            <path d="M44 104h32" />
            <path d="M56 70h8M56 82h8M56 94h8" />
            <path d="M60 54V26" />
            <path d="M60 54C46 42 32 44 22 56" />
            <path d="M60 54C74 42 88 44 98 56" />
            <path d="M60 54C50 34 40 28 30 30" />
            <path d="M60 54C70 34 80 28 90 30" />
        </>
    ),
    crescent: (
        <>
            <path d="M70 22a40 40 0 1 0 0 76a44 44 0 0 1 0-76z" />
            <path d="M92 52l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        </>
    ),
    blossom: (
        <>
            {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse
                    key={deg}
                    cx="60"
                    cy="38"
                    rx="9"
                    ry="20"
                    transform={`rotate(${deg} 60 60)`}
                />
            ))}
            <circle cx="60" cy="60" r="6" />
        </>
    ),
    arch: (
        <>
            <path d="M28 104V58a32 32 0 0 1 64 0v46" />
            <path d="M40 104V60a20 20 0 0 1 40 0v44" />
            <path d="M20 104h80" />
            <circle cx="60" cy="60" r="3.5" />
        </>
    ),
    pyramid: (
        <>
            <path d="M12 96L60 24l48 72z" />
            <path d="M60 24v72" />
            <path d="M84 96l14-24 14 24" />
            <path d="M8 96h104" />
        </>
    ),
};

function Motif({
    name,
    ...props
}: { name: MotifName } & SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            {MOTIF_SHAPES[name]}
        </svg>
    );
}



function Sparkle(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0z" />
        </svg>
    );
}

function CrescentShape(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="20 16 70 88"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path d="M70 22a40 40 0 1 0 0 76a44 44 0 0 1 0-76z" />
        </svg>
    );
}

function Balloon({ fill, ...props }: { fill: string } & SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 40 60" aria-hidden="true" focusable="false" {...props}>
            <path d="M20 54c-1 2-3 3-3 6" fill="none" stroke={fill} strokeWidth="1" opacity="0.7" />
            <path d="M20 50l-3 4h6z" fill={fill} />
            <ellipse cx="20" cy="22" rx="16" ry="21" fill={fill} />
            <ellipse cx="13" cy="14" rx="3.5" ry="6" fill="#ffffff" opacity="0.35" />
        </svg>
    );
}

function SaudiEmblem(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            {/* السيفان */}
            <path d="M24 62L98 106" />
            <path d="M29 73L36.2 61" />
            <circle cx="24" cy="62" r="2.5" fill="currentColor" />
            <path d="M96 62L22 106" />
            <path d="M91 73L83.8 61" />
            <circle cx="96" cy="62" r="2.5" fill="currentColor" />
            {/* النخلة */}
            <path d="M60 84V46" />
            <path d="M56 58h8M56 68h8M56 78h8" strokeWidth={1.6} />
            <path d="M60 46V22" />
            <path d="M60 46C48 36 36 38 28 48" />
            <path d="M60 46C72 36 84 38 92 48" />
            <path d="M60 46C52 30 44 24 36 26" />
            <path d="M60 46C68 30 76 24 84 26" />
        </svg>
    );
}


function EffectLayer({
    children,
    className = "inset-0 overflow-hidden",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className={`pointer-events-none absolute z-10 ${className}`}
        >
            {children}
        </motion.div>
    );
}

interface TwinkleProps {
    className: string;
    delay: number;
    duration: number;
}

const EFFECT_TONES = ["text-[#FEF8EB]", "text-[#0b3c2e]"] as const;
const toneAt = (index: number) => EFFECT_TONES[index % EFFECT_TONES.length];

function Twinkle({ className, delay, duration }: TwinkleProps) {
    return (
        <motion.span
            className={`absolute ${className}`}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.15, 0.7], y: [0, -8, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
        >
            <Sparkle className="h-full w-full" />
        </motion.span>
    );
}

const STAR_FIELD: readonly TwinkleProps[] = [
    { className: "left-[10%] top-[10%] h-3 w-3", delay: 0, duration: 3.4 },
    { className: "left-[28%] top-[4%] h-2 w-2", delay: 0.6, duration: 2.8 },
    { className: "right-[38%] top-[18%] h-2.5 w-2.5", delay: 1.1, duration: 3.8 },
    { className: "right-[6%] top-[34%] h-3.5 w-3.5", delay: 0.3, duration: 4.2 },
    { className: "left-[6%] top-[38%] h-2 w-2", delay: 1.5, duration: 3.1 },
    { className: "left-[44%] top-[28%] h-2 w-2", delay: 0.9, duration: 3.6 },
    { className: "right-[20%] top-[54%] h-2.5 w-2.5", delay: 1.8, duration: 3.3 },
];

function CrescentEffect() {
    return (
        <EffectLayer>
            <motion.span
                className="absolute right-[9%] top-[5%] h-16 w-14"
                initial={{ opacity: 0, scale: 0.6, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -10, 0] }}
                transition={{
                    default: { duration: 0.8, ease: EASE_OUT_EXPO },
                    y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
                }}
            >
                <CrescentShape className="h-full w-full text-[#FEF8EB] drop-shadow-[0_0_10px_rgba(11,60,46,0.35)]" />
            </motion.span>
            {STAR_FIELD.map((star, index) => (
                <Twinkle
                    key={star.className}
                    {...star}
                    className={`${star.className} ${toneAt(index)}`}
                />
            ))}
        </EffectLayer>
    );
}

interface BalloonConfig {
    position: string;
    fill: string;
    size: string;
    delay: number;
    duration: number;
}

const BALLOONS: readonly BalloonConfig[] = [
    { position: "left-[6%]", fill: "#0b3c2e", size: "h-14 w-10", delay: 0, duration: 6.5 },
    { position: "left-[30%]", fill: "#FEF8EB", size: "h-12 w-9", delay: 1.4, duration: 7.2 },
    { position: "right-[28%]", fill: "#14513f", size: "h-16 w-11", delay: 0.7, duration: 6.8 },
    { position: "right-[7%]", fill: "#8f7141", size: "h-12 w-9", delay: 2.1, duration: 7.6 },
];

interface RibbonConfig {
    position: string;
    color: string;
    delay: number;
    duration: number;
}

const RIBBONS: readonly RibbonConfig[] = [
    { position: "left-[8%]", color: "bg-[#0b3c2e]", delay: 0, duration: 4.6 },
    { position: "left-[18%]", color: "bg-[#FEF8EB]", delay: 1.2, duration: 5.2 },
    { position: "left-[29%]", color: "bg-[#8f7141]", delay: 0.5, duration: 4.9 },
    { position: "left-[41%]", color: "bg-[#14513f]", delay: 2, duration: 5.4 },
    { position: "left-[52%]", color: "bg-[#0b3c2e]", delay: 0.9, duration: 4.4 },
    { position: "left-[63%]", color: "bg-[#FEF8EB]", delay: 1.7, duration: 5.1 },
    { position: "left-[73%]", color: "bg-[#8f7141]", delay: 0.2, duration: 4.8 },
    { position: "left-[83%]", color: "bg-[#14513f]", delay: 1.4, duration: 5.3 },
    { position: "left-[92%]", color: "bg-[#0b3c2e]", delay: 2.4, duration: 4.7 },
];

function CelebrationEffect() {
    return (
        <EffectLayer>
            {RIBBONS.map(({ position, color, delay, duration }) => (
                <motion.span
                    key={position}
                    className={`absolute top-0 h-4 w-1.5 rounded-[1px] ${position} ${color}`}
                    initial={{ y: -24, opacity: 0.9 }}
                    animate={{ y: 680, rotate: 540 }}
                    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
                />
            ))}
            {BALLOONS.map(({ position, fill, size, delay, duration }) => (
                <motion.span
                    key={position}
                    className={`absolute bottom-0 ${position}`}
                    initial={{ y: 70, opacity: 0 }}
                    animate={{ y: -640, opacity: [0, 1, 1, 0] }}
                    transition={{
                        duration,
                        delay,
                        repeat: Infinity,
                        ease: "easeOut",
                        times: [0, 0.1, 0.85, 1],
                    }}
                >
                    <motion.span
                        className="block"
                        animate={{ x: [-6, 6, -6] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Balloon fill={fill} className={size} />
                    </motion.span>
                </motion.span>
            ))}
        </EffectLayer>
    );
}

const EMBLEM_SPARKLES: readonly TwinkleProps[] = [
    { className: "left-[14%] top-[22%] h-3 w-3", delay: 0, duration: 3.2 },
    { className: "right-[14%] top-[18%] h-2.5 w-2.5", delay: 0.8, duration: 3.6 },
    { className: "left-[20%] bottom-[24%] h-2 w-2", delay: 1.4, duration: 3 },
    { className: "right-[18%] bottom-[28%] h-3 w-3", delay: 0.4, duration: 3.8 },
];

function EmblemEffect() {
    return (
        <EffectLayer className="inset-x-4 top-4 aspect-4/5 overflow-hidden rounded-b-2xl rounded-t-[999px] bg-[radial-gradient(circle_at_center,rgba(6,41,32,0.72),rgba(6,41,32,0.12)_72%)]">
            <div className="grid h-full w-full place-items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                    transition={{
                        default: { type: "spring", stiffness: 140, damping: 16 },
                        y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
                    }}
                >
                    <SaudiEmblem className="h-32 w-32 text-[#e2c994] drop-shadow-[0_0_14px_rgba(226,201,148,0.55)]" />
                </motion.div>
            </div>
            {EMBLEM_SPARKLES.map((sparkle) => (
                <Twinkle
                    key={sparkle.className}
                    {...sparkle}
                    className={`${sparkle.className} text-[#e2c994]`}
                />
            ))}
        </EffectLayer>
    );
}

const SPARKLE_FIELD: readonly TwinkleProps[] = [
    { className: "left-[12%] top-[12%] h-3 w-3", delay: 0, duration: 3.2 },
    { className: "right-[14%] top-[8%] h-2.5 w-2.5", delay: 0.7, duration: 3.6 },
    { className: "left-[36%] top-[30%] h-2 w-2", delay: 1.3, duration: 3 },
    { className: "right-[10%] top-[40%] h-3.5 w-3.5", delay: 0.4, duration: 4 },
    { className: "left-[8%] top-[52%] h-2 w-2", delay: 1.8, duration: 3.4 },
    { className: "right-[30%] top-[60%] h-2.5 w-2.5", delay: 1, duration: 3.8 },
    { className: "left-[24%] bottom-[18%] h-3 w-3", delay: 0.2, duration: 3.5 },
    { className: "right-[12%] bottom-[12%] h-2 w-2", delay: 1.5, duration: 3.1 },
];

function SparkleEffect() {
    return (
        <EffectLayer>
            {SPARKLE_FIELD.map((sparkle, index) => (
                <Twinkle
                    key={sparkle.className}
                    {...sparkle}
                    className={`${sparkle.className} ${toneAt(index)}`}
                />
            ))}
        </EffectLayer>
    );
}

const EFFECTS: Record<HoverEffectName, ComponentType> = {
    crescent: CrescentEffect,
    celebration: CelebrationEffect,
    emblem: EmblemEffect,
    sparkle: SparkleEffect,
};



function EgyptFlag(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 16" aria-hidden="true" focusable="false" {...props}>
            <rect width="24" height="5.34" fill="#CE1126" />
            <rect y="5.33" width="24" height="5.34" fill="#FFFFFF" />
            <rect y="10.66" width="24" height="5.34" fill="#111111" />
            <circle cx="12" cy="8" r="1.6" fill="#C09300" />
        </svg>
    );
}

function SaudiFlag(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 16" aria-hidden="true" focusable="false" {...props}>
            <rect width="24" height="16" fill="#006C35" />
            <rect x="6" y="5" width="12" height="1.6" rx="0.8" fill="#FFFFFF" />
            <rect x="7" y="8" width="10" height="0.9" rx="0.45" fill="#FFFFFF" opacity="0.85" />
            <rect x="6" y="11" width="12" height="1" rx="0.5" fill="#FFFFFF" />
        </svg>
    );
}

const COUNTRIES: Record<
    CountryCode,
    { label: string; Flag: ComponentType<SVGProps<SVGSVGElement>> }
> = {
    EG: { label: "مصر", Flag: EgyptFlag },
    SA: { label: "السعودية", Flag: SaudiFlag },
};

const FILTERS: readonly { value: CountryFilter; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "SA", label: COUNTRIES.SA.label },
    { value: "EG", label: COUNTRIES.EG.label },
];



function CountryBadge({ code, className }: { code: CountryCode; className: string }) {
    const { label, Flag } = COUNTRIES[code];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${className}`}
        >
            <Flag className="h-3 w-4.5 rounded-xs shadow-[0_0_0_1px_rgba(0,0,0,0.12)]" />
            {label}
        </span>
    );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <rect x="3" y="4.5" width="14" height="12" rx="2" />
            <path d="M3 8.5h14M7 2.5v3M13 2.5v3" />
        </svg>
    );
}

function DateRange({ start, end }: Pick<Occasion, "start" | "end">) {
    if (!end) {
        return <time dateTime={start}>{fullDateFormat.format(toUtcDate(start))}</time>;
    }
    return (
        <>
            <time dateTime={start}>{dayMonthFormat.format(toUtcDate(start))}</time>
            <span aria-hidden="true"> – </span>
            <span className="sr-only"> إلى </span>
            <time dateTime={end}>{fullDateFormat.format(toUtcDate(end))}</time>
        </>
    );
}


const IMAGE_SIZES = "(min-width: 1024px) 28vw, (min-width: 640px) 44vw, 90vw";

function OccasionCard({ occasion }: { occasion: Occasion }) {
    const titleId = useId();
    const reduceMotion = useReducedMotion() ?? false;
    const [isActive, setIsActive] = useState(false);
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const tilt = useCardTilt(reduceMotion);

    const {
        title,
        description,
        countries,
        start,
        end,
        isApproximate,
        effect,
        motif,
        image,
        href,
        ctaLabel,
    } = occasion;
    const style = CARD_STYLE;
    const HoverEffect = EFFECTS[effect];
    const imageKey = srcKey(image.src);
    const imageFailed = failedSrc === imageKey;

    const handleImageError = () => {
        if (process.env.NODE_ENV !== "production") {
            console.warn(`[OccasionsSection] تعذّر تحميل الصورة: ${imageKey}`);
        }
        setFailedSrc(imageKey);
    };

    const handleBlur = (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsActive(false);
    };

    const handlePointerLeave = () => {
        setIsActive(false);
        tilt.reset();
    };

    return (
        <motion.li
            variants={cardVariants}
            className="flex w-[84%] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none lg:nth-[3n+2]:mt-14"
        >
            <div
                className="h-full w-full"
                onPointerEnter={() => setIsActive(true)}
                onPointerMove={tilt.onPointerMove}
                onPointerLeave={handlePointerLeave}
            >
                <motion.article
                    aria-labelledby={titleId}
                    onFocus={() => setIsActive(true)}
                    onBlur={handleBlur}
                    whileHover={reduceMotion ? undefined : { y: -8 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    style={{
                        rotateX: tilt.rotateX,
                        rotateY: tilt.rotateY,
                        transformPerspective: 1000,
                    }}
                    className="group relative isolate h-full rounded-3xl"
                >

                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-0 shadow-[0_2px_4px_rgba(6,41,32,0.08),0_16px_28px_-8px_rgba(6,41,32,0.18),0_40px_72px_-20px_rgba(6,41,32,0.34)] transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
                    />

                    <div
                        className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-4 ${style.surface} ${style.border}`}
                    >
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-e-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,248,235,0.35),transparent_65%)]"
                        />

                        <div
                            className={`relative aspect-4/5 min-h-72 w-full shrink-0 overflow-hidden rounded-b-2xl rounded-t-[999px] ${style.panel}`}
                        >
                            {imageFailed ? (
                                <div className="absolute inset-0 grid place-items-center">
                                    <Motif name={motif} className={`h-28 w-28 ${style.fallbackMotif}`} />
                                </div>
                            ) : (
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    sizes={IMAGE_SIZES}
                                    onError={handleImageError}
                                    className="object-cover transition-transform duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-focus-within:scale-110 motion-reduce:transition-none"
                                />
                            )}
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(6,41,32,0.45),transparent_55%)]"
                            />
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none absolute inset-3 rounded-b-xl rounded-t-[999px] border transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[0.95] group-focus-within:scale-[0.95] motion-reduce:transition-none ${style.frame}`}
                            />
                        </div>

                        <div className="relative flex flex-1 flex-col items-center px-3 pb-2 pt-6 text-center">
                            <ul aria-label="الدول" className="flex flex-wrap justify-center gap-2">
                                {countries.map((code) => (
                                    <li key={code}>
                                        <CountryBadge code={code} className={style.badge} />
                                    </li>
                                ))}
                            </ul>

                            <h3
                                id={titleId}
                                className={`mt-4 text-xl font-semibold leading-snug ${style.title}`}
                            >
                                {title}
                            </h3>
                            <p className={`mt-3 max-w-[32ch] text-sm leading-7 ${style.body}`}>
                                {description}
                            </p>

                            <div className="mt-auto flex w-full flex-col items-center pt-6">
                                <p
                                    className={`flex w-full items-center justify-center gap-2 border-t pt-4 text-sm tabular-nums ${style.divider} ${style.meta}`}
                                >
                                    <CalendarIcon className={`h-4 w-4 ${style.icon}`} />
                                    <span>
                                        <DateRange start={start} end={end} />
                                    </span>
                                    {isApproximate && <span className="text-xs opacity-70">(تقريبي)</span>}
                                </p>

                                <a
                                    href={href}
                                    className={`mt-5 inline-flex items-center justify-center rounded-full border px-6 py-2.5 text-sm font-medium outline-none transition-colors duration-500 after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-[#c5a880] focus-visible:after:ring-offset-2 ${style.cta}`}
                                >
                                    {ctaLabel}
                                    <span className="sr-only"> — {title}</span>
                                </a>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isActive && !reduceMotion && <HoverEffect key={effect} />}
                        </AnimatePresence>


                        <motion.span
                            aria-hidden="true"
                            style={{ x: tilt.glareX, y: tilt.glareY }}
                            className="pointer-events-none absolute inset-0 z-5 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:hidden"
                        />
                    </div>

                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-px rounded-3xl border border-[#8f7141] opacity-0 transition-opacity duration-500 group-hover:opacity-70 group-focus-within:opacity-70"
                    />
                </motion.article>
            </div>
        </motion.li>
    );
}

/* -------------------------------------------------------------------------- */
/*  البيانات المنظّمة لمحركات البحث                                            */
/* -------------------------------------------------------------------------- */

function buildStructuredData(occasions: readonly Occasion[]): string {
    const data = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: occasions.map((o, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Event",
                name: o.title,
                description: o.description,
                startDate: o.start,
                ...(o.end && { endDate: o.end }),
                url: o.href,
            },
        })),
    };
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

/* -------------------------------------------------------------------------- */
/*  القسم                                                                     */
/* -------------------------------------------------------------------------- */

export default function SaadeddinOccasionsSection({
    occasions = OCCASIONS,
    className = "",
}: OccasionsSectionProps) {
    const headingId = useId();
    const [filter, setFilter] = useState<CountryFilter>("all");
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);

    const visible = useMemo(
        () =>
            filter === "all"
                ? occasions
                : occasions.filter((o) => o.countries.includes(filter)),
        [filter, occasions],
    );

    const structuredData = useMemo(() => buildStructuredData(occasions), [occasions]);

    useEffect(() => {
        const list = listRef.current;
        if (!list || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveIndex(Array.prototype.indexOf.call(list.children, entry.target));
                    }
                }
            },
            { root: list, threshold: 0.6 },
        );
        Array.from(list.children).forEach((child) => observer.observe(child));
        return () => observer.disconnect();
    }, [visible]);

    const selectFilter = (value: CountryFilter) => {
        setFilter(value);
        setActiveIndex(0);
    };

    const scrollToSlide = (index: number) => {
        listRef.current?.children[index]?.scrollIntoView({
            behavior: "smooth",
            inline: "start",
            block: "nearest",
        });
    };

    return (
        <MotionConfig reducedMotion="user">
            <section
                dir="rtl"
                lang="ar"
                id="occasions"
                aria-labelledby={headingId}
                className={`scroll-mt-20 bg-[#fef8eb] py-24 text-[#0b3c2e] sm:py-32 ${className}`}
            >
                <div className="mx-auto max-w-7xl px-6 lg:px-10">
                    <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
                        <h2
                            id={headingId}
                            className="text-3xl font-light leading-[1.4] sm:text-5xl sm:leading-[1.35]"
                        >
                            مناسباتٌ تليق بها حلوى سعد الدين
                        </h2>
                        <div aria-hidden="true" className="mt-8 flex items-center gap-3 text-[#c5a880]">
                            <span className="h-px w-16 bg-[linear-gradient(to_left,#c5a880,transparent)]" />
                            <span className="h-1.5 w-1.5 rotate-45 border border-current" />
                            <span className="h-px w-16 bg-[linear-gradient(to_right,#c5a880,transparent)]" />
                        </div>
                        <p className="mt-8 max-w-[52ch] text-base leading-8 text-[#0b3c2e]/70">
                            من رمضان إلى الأعياد والأيام الوطنية، نُعدّ لكل مناسبة تشكيلةً تُقدَّم
                            بعناية وتُذكر طويلاً.
                        </p>
                    </header>

                    <div
                        role="group"
                        aria-label="تصفية المناسبات حسب الدولة"
                        className="mt-12 flex justify-center gap-2"
                    >
                        {FILTERS.map(({ value, label }) => {
                            const isActive = filter === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => selectFilter(value)}
                                    className={`rounded-full border px-5 py-2 text-sm transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5a880] ${isActive
                                        ? "border-[#0b3c2e] bg-[#0b3c2e] text-[#FEF8EB]"
                                        : "border-[#c5a880]/50 bg-white text-[#0b3c2e]/75 hover:border-[#0b3c2e] hover:text-[#0b3c2e]"
                                        }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <p className="sr-only" aria-live="polite">
                        {visible.length} مناسبة معروضة
                    </p>

                    <motion.ul
                        key={filter}
                        ref={listRef}
                        aria-label="المناسبات"
                        variants={gridVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-80px" }}
                        className="-mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-8 pt-3 scrollbar-none [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-16 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-0 lg:grid-cols-3 lg:gap-10"
                    >
                        {visible.map((occasion) => (
                            <OccasionCard key={occasion.id} occasion={occasion} />
                        ))}
                    </motion.ul>

                    <div
                        role="group"
                        aria-label="التنقل بين المناسبات"
                        className="flex flex-wrap justify-center sm:hidden"
                    >
                        {visible.map((occasion, index) => (
                            <button
                                key={occasion.id}
                                type="button"
                                onClick={() => scrollToSlide(index)}
                                aria-label={`${occasion.title} (${index + 1} من ${visible.length})`}
                                aria-current={index === activeIndex ? "true" : undefined}
                                className="grid h-6 w-6 place-items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5a880]"
                            >
                                <span
                                    aria-hidden="true"
                                    className={`block h-2 rounded-full transition-[width,background-color] duration-300 ${index === activeIndex ? "w-6 bg-[#0b3c2e]" : "w-2 bg-[#c5a880]/70"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <p className="mt-16 text-center text-xs leading-6 text-[#0b3c2e]/55">
                        تواريخ الأعياد والشهور الهجرية تقريبية، وقد تختلف بيوم بحسب الرؤية الشرعية.
                    </p>
                </div>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: structuredData }}
                />
            </section>
        </MotionConfig>
    );
}