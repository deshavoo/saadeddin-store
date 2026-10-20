import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
type PickerItem = {
    id: string;
    label: string;
    href: string;
    image: {
        src: string | StaticImageData;
        alt: string;
    };
};

type OccasionPickerSectionProps = {
    className?: string;
    items?: PickerItem[];
    /** رابط زرار "تصفح كل المناسبات" */
    allHref?: string;
};

const DEFAULT_ITEMS: PickerItem[] = [
    {
        id: "wedding",
        label: "زفاف",
        href: "/occasions/wedding",
        image: {
            src: "/images/occasion-picker/wedding.jpg",
            alt: "كعكة زفاف بيضاء تقليدية من حلويات سعد الدين",
        },
    },
    {
        id: "newborn",
        label: "مواليد",
        href: "/occasions/newborn",
        image: {
            src: "/images/occasion-picker/newborn.jpg",
            alt: "سيدتان تحملان مولودًا وصندوق هدايا للاحتفال بالمواليد",
        },
    },
    {
        id: "graduation",
        label: "التخرج",
        href: "/occasions/graduation",
        image: {
            src: "/images/occasion-picker/graduation.jpg",
            alt: "خريجة بقبعة ورداء التخرج مع كعكة مخصصة",
        },
    },
    {
        id: "birthdays",
        label: "أعياد الميلاد",
        href: "/occasions/birthdays",
        image: {
            src: "/images/occasion-picker/birthdays.jpg",
            alt: "كعكة عيد ميلاد أول مع دمية دب صغيرة",
        },
    },
];

const HEADING_ID = "occasion-picker-heading";
const CARD_SIZES = "(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 46vw";

export default function OccasionPickerSection({
    className = "",
    items = DEFAULT_ITEMS,
    allHref = "/occasions",
}: OccasionPickerSectionProps) {
    return (
        <section
            id="choose-occasion"
            dir="rtl"
            lang="ar"
            aria-labelledby={HEADING_ID}
            className={`relative scroll-mt-20 overflow-x-clip bg-[#005430] bg-[radial-gradient(60rem_30rem_at_50%_0%,rgba(197,168,128,0.12),transparent_65%)] py-20 text-[#fef8eb] sm:py-28 lg:py-32 ${className}`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
                <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
                    <h2
                        id={HEADING_ID}
                        className="text-[2rem] font-light leading-normal sm:text-5xl sm:leading-[1.4]"
                    >
                        ما هي مناسبتك؟
                    </h2>
                    <div
                        aria-hidden="true"
                        className="mt-7 h-px w-24 bg-[linear-gradient(to_right,transparent,#c5a880,transparent)] sm:mt-9 sm:w-32"
                    />
                </header>

                <ul
                    role="list"
                    className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:gap-5 lg:grid-cols-4 lg:gap-6"
                >
                    {items.map(({ id, label, href, image }) => (
                        <li key={id}>
                            <Link
                                href={href}
                                className="group relative block overflow-hidden rounded-2xl border border-[#c5a880]/30 bg-[#fef8eb]/10 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)] transition-colors duration-500 hover:border-[#c5a880] focus-visible:border-[#c5a880] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-[#005430] motion-reduce:transition-none"
                            >
                                <div className="relative aspect-4/5 w-full">
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        sizes={CARD_SIZES}
                                        quality={85}
                                        className="object-cover object-center transition-transform duration-1200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
                                    />

                                    {/* تدرج أخضر أسفل الصورة لقراءة التصنيف */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(to_top,rgba(0,84,48,0.95),rgba(0,84,48,0.55)_45%,transparent)]"
                                    />

                                    {/* إطار داخلي رفيع */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-2 rounded-xl border border-[#c5a880]/35 transition-colors duration-500 group-hover:border-[#c5a880]/80 motion-reduce:transition-none sm:inset-3"
                                    />

                                    <span className="absolute inset-x-0 bottom-0 px-3 pb-5 text-center text-lg font-semibold leading-snug text-[#fef8eb] sm:pb-7 sm:text-2xl">
                                        {label}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-12 flex justify-center sm:mt-16">
                    <Link
                        href={allHref}
                        className="inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-full bg-[#c5a880] px-10 py-4 text-base font-bold text-[#005430] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] transition-colors duration-300 hover:bg-[#fef8eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fef8eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#005430] motion-reduce:transition-none sm:w-auto sm:text-lg"
                    >
                        تصفح كل المناسبات
                    </Link>
                </div>
            </div>
        </section>
    );
}