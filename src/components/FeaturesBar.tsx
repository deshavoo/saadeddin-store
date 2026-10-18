import {
    Truck,
    Settings,
    UtensilsCrossed,
    Medal,
} from "lucide-react";

const features = [
    {
        id: "reliable-supply",
        icon: Truck,
        title: "توريد موثوق",
        description: "والالتزام بالمواعيد",
    },
    {
        id: "custom-solutions",
        icon: Settings,
        title: "حلول مخصصة",
        description: "حسب احتياجات عملكم",
    },
    {
        id: "premium-products",
        icon: UtensilsCrossed,
        title: "منتجات فاخرة",
        description: "بأعلى معايير الجودة",
    },
    {
        id: "heritage",
        icon: Medal,
        title: "خبرة تمتد لأكثر من 100 عام",
        description: "جودة حقيقية مبنية على ثقة الأجيال",
    },
];

export default function FeaturesBar() {
    return (
        <section
            dir="rtl"
            aria-label="مميزات وخدمات حلويات سعد الدين 1919"
            className="relative overflow-hidden border-y border-[#c5a880]/20 bg-[#FEF8EB] py-6 sm:py-8 lg:py-12"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-y-0">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <li
                                key={feature.id}
                                className={`relative flex items-center justify-start sm:justify-center gap-3 sm:gap-4 px-2 sm:px-4 lg:px-6 ${index !== features.length - 1
                                    ? "lg:border-l lg:border-[#c5a880]/30"
                                    : ""
                                    }`}
                            >
                                <div
                                    className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-full border border-[#c5a880]/40 bg-white/70 text-[#0b3c2e] shadow-sm transition-colors duration-300 hover:border-[#c5a880] hover:bg-[#0b3c2e] hover:text-[#c5a880]"
                                >
                                    <Icon
                                        size={20}
                                        className="sm:w-5.5 sm:h-5.5 lg:w-6.25 lg:h-6.25"
                                        strokeWidth={1.6}
                                        aria-hidden="true"
                                        focusable="false"
                                    />
                                </div>

                                <div className="min-w-0 text-right">
                                    <h3 className="text-xs sm:text-sm lg:text-base font-bold leading-snug sm:leading-7 text-[#0b3c2e]">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-0.5 text-[10px] sm:text-xs lg:text-sm leading-normal sm:leading-6 text-[#5F6258]">
                                        {feature.description}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}