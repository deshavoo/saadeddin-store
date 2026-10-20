import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
type GiftCard = {
    id: string;
    label: string;
    image: {
        src: string | StaticImageData;
        alt: string;
    };
};

type CorporateGiftsSectionProps = {
    className?: string;
    cards?: [GiftCard, GiftCard];
    href?: string;
};

const DEFAULT_CARDS: [GiftCard, GiftCard] = [
    {
        id: "employees",
        label: "هدايا الموظفين",
        image: {
            src: "/images/corporate-gifts/employees.jpg",
            alt: "علب هدايا فاخرة من حلويات سعد الدين مجهّزة لموظفي الشركات",
        },
    },
    {
        id: "clients",
        label: "هدايا العملاء والشركاء",
        image: {
            src: "/images/corporate-gifts/clients.jpg",
            alt: "تشكيلة حلويات شرقية في تغليف أنيق كهدية للعملاء وشركاء العمل",
        },
    },
];

const HEADING_ID = "corporate-gifts-heading";
const CARD_SIZES = "(min-width: 1024px) 22vw, (min-width: 640px) 36vw, 44vw";

export default function CorporateGiftsSection({
    className = "",
    cards = DEFAULT_CARDS,
    href = "/corporate-gifts",
}: CorporateGiftsSectionProps) {
    return (
        <section
            id="corporate-gifts"
            dir="rtl"
            lang="ar"
            aria-labelledby={HEADING_ID}
            className={`relative scroll-mt-20 overflow-x-clip bg-white py-20 text-[#005430] sm:py-28 lg:py-32 ${className}`}
        >
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-10 xl:gap-28">
                {/* النص */}
                <div className="lg:order-2">
                    <h2
                        id={HEADING_ID}
                        className="text-[2rem] font-semibold leading-normal sm:text-5xl sm:leading-[1.4]"
                    >
                        هدايا تليق بشركتك
                    </h2>

                    <div
                        aria-hidden="true"
                        className="mt-7 h-px w-24 bg-[linear-gradient(to_left,#c5a880,transparent)] sm:mt-9 sm:w-32"
                    />

                    <p className="mt-7 max-w-[52ch] text-base leading-8 text-[#005430]/75 sm:mt-9 sm:text-lg sm:leading-9">
                        نُعدّ لشركتك هدايا من حلويات سعد الدين الأصيلة، بتغليف أنيق يليق باسمك،
                        لتعبّر عن تقديرك لموظفيك وعملائك وشركائك في كل مناسبة.
                    </p>

                    <Link
                        href={href}
                        className="mt-9 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#005430] px-10 py-4 text-base font-bold text-[#fef8eb] shadow-[0_18px_40px_-16px_rgba(0,84,48,0.55)] transition-colors duration-300 hover:bg-[#c5a880] hover:text-[#005430] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none sm:mt-10 sm:w-auto sm:text-lg"
                    >
                        اكتشف المزيد
                    </Link>
                </div>

                {/* الكارتين: الثاني مزاح لأسفل لتكوين متدرج */}
                <div className="grid grid-cols-2 items-start gap-3 sm:gap-5 lg:order-1 lg:gap-6">
                    {cards.map(({ id, label, image }, index) => (
                        <figure
                            key={id}
                            className={`group relative overflow-hidden rounded-2xl border border-[#c5a880]/30 bg-[#005430]/10 shadow-[0_24px_48px_-24px_rgba(0,84,48,0.5)] ${index === 1 ? "mt-8 sm:mt-14" : ""
                                }`}
                        >
                            <div className="relative aspect-3/4 w-full">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    sizes={CARD_SIZES}
                                    quality={85}
                                    className="object-cover object-center transition-transform duration-1200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
                                />

                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(to_top,rgba(0,84,48,0.95),rgba(0,84,48,0.55)_45%,transparent)]"
                                />


                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-2 rounded-xl border border-[#c5a880]/35 transition-colors duration-500 group-hover:border-[#c5a880]/80 motion-reduce:transition-none sm:inset-3"
                                />

                                <figcaption className="absolute inset-x-0 bottom-0 px-3 pb-5 text-center text-base font-semibold leading-snug text-[#fef8eb] sm:pb-7 sm:text-xl">
                                    {label}
                                </figcaption>
                            </div>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}