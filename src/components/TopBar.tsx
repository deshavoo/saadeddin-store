"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    FaWhatsapp,
    FaInstagram,
    FaFacebook,
    FaPhone,
    FaShoppingBag,
    FaArrowLeft,
    FaUserShield,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const CONTACT = {
    phone: "+966920017070",
};

const SOCIAL_LINKS = [
    {
        name: "WhatsApp",
        href: `https://wa.me/${CONTACT.phone.replace(/\D/g, "")}`,
        icon: FaWhatsapp,
        label: "تواصل معنا عبر واتساب",
    },
    {
        name: "Instagram",
        href: "https://www.instagram.com/saadeddinpastry",
        icon: FaInstagram,
        label: "تابعنا على إنستجرام",
    },
    {
        name: "Facebook",
        href: "https://www.facebook.com/saadeddinpastry",
        icon: FaFacebook,
        label: "تابعنا على فايسبوك",
    },
    {
        name: "X",
        href: "https://x.com/saadeddinpastry",
        icon: FaXTwitter,
        label: "تابعنا على تويتر",
    },
];

export default function TopBar() {
    const [visible, setVisible] = useState(true);
    const router = useRouter();
    const { data: session } = useSession();

    // التحقق مما إذا كان المستخدم أدمن (حسب هيكل الـ Session لديك، عادة session.user.role === 'admin')
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    useEffect(() => {
        let previousScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 20) {
                setVisible(true);
            } else if (currentScrollY > previousScrollY + 3) {
                setVisible(false);
            } else if (currentScrollY < previousScrollY - 3) {
                setVisible(true);
            }

            previousScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToProducts = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const element = document.getElementById("products");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        } else {
            router.push("/#products");
        }
    };

    return (
        <div
            dir="rtl"
            aria-label="شريط التواصل والعروض"
            className={`relative z-40 overflow-hidden bg-[#0b3c2e] text-[#c5a880] transition-[max-height,opacity] duration-300 ease-in-out ${visible
                ? "max-h-20 opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
                }`}
        >
            <div
                aria-hidden="true"
                className="h-px bg-linear-to-l from-transparent via-[#c5a880]/60 to-transparent"
            />

            <div className="mx-auto grid min-h-11 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
                {/* Right Side: Saudi Identity, Admin Dashboard Button & Contact */}
                <div className="flex min-w-0 items-center justify-start gap-2 sm:gap-4 lg:gap-6">
                    <div className="flex shrink-0 items-center gap-2 px-2.5 py-1 rounded-md bg-[#062920]/60 border border-[#c5a880]/20 text-[11px] font-semibold sm:text-xs text-[#c5a880] tracking-wide">
                        {/* للأدمن على الموبايل: العلم بس عشان زرار لوحة التحكم ياخد مكانه */}
                        <span className={`whitespace-nowrap ${isAdmin ? "hidden sm:inline" : ""}`}>
                            صُنِع في السعودية
                        </span>

                        <div className="relative w-5 h-3.5 sm:w-6 sm:h-4 rounded-xs overflow-hidden shadow-xs flex items-center justify-center shrink-0">
                            <Image
                                src="/flag-for-flag-saudi-arabia-svgrepo-com.svg"
                                alt="علم المملكة العربية السعودية"
                                fill
                                sizes="24px"
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* زر لوحة التحكم يظهر فقط لو كان المستخدم مسجلاً بصلاحية أدمن (ديسكتوب وموبايل) */}
                    {isAdmin && (
                        <Link
                            href="admin/products"
                            aria-label="لوحة تحكم المشرفين"
                            title="لوحة التحكم"
                            className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#c5a880] px-2 text-[11px] font-bold text-[#0b3c2e] shadow-sm transition-all duration-200 hover:bg-white sm:h-auto sm:px-3 sm:py-1 sm:text-xs sm:hover:scale-105"
                        >
                            <FaUserShield aria-hidden="true" size={14} />
                            <span className="hidden whitespace-nowrap sm:inline">لوحة التحكم</span>
                        </Link>
                    )}

                    <a
                        href={`tel:${CONTACT.phone}`}
                        aria-label="اتصل بنا"
                        className="hidden md:flex items-center gap-1.5 whitespace-nowrap text-xs transition-colors duration-200 hover:text-white"
                    >
                        <FaPhone aria-hidden="true" size={11} />
                        <span dir="ltr">{CONTACT.phone}</span>
                    </a>
                </div>

                {/* Center: Promotional CTA */}
                <div className="flex items-center justify-center">
                    <Link
                        href="#products"
                        onClick={scrollToProducts}
                        aria-label="اكتشف منتجات حلويات سعد الدين"
                        className="group inline-flex items-center justify-center gap-1.5 rounded-full border border-[#c5a880]/50 bg-[#c5a880]/10 px-2.5 py-1.5 text-[10px] font-semibold text-[#f3dfb8] transition-all duration-300 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#062920] sm:gap-2 sm:px-4 sm:text-xs"
                    >
                        <FaShoppingBag
                            aria-hidden="true"
                            size={11}
                            className="shrink-0"
                        />

                        <span className="whitespace-nowrap">تسوق الآن</span>

                        <FaArrowLeft
                            aria-hidden="true"
                            size={10}
                            className="hidden transition-transform duration-300 group-hover:-translate-x-1 sm:block"
                        />
                    </Link>
                </div>

                {/* Left Side: Social Media */}
                <nav
                    aria-label="حساباتنا على وسائل التواصل الاجتماعي"
                    className="flex items-center justify-end gap-1.5 sm:gap-2.5 lg:gap-3"
                >
                    {SOCIAL_LINKS.map((social) => {
                        const Icon = social.icon;

                        return (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                title={social.name}
                                className="flex h-7 w-6 shrink-0 items-center justify-center rounded-full text-[#c5a880] transition-all duration-200 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] sm:h-8 sm:w-7"
                            >
                                <Icon
                                    aria-hidden="true"
                                    size={15}
                                    className="transition-transform duration-200 hover:scale-110 sm:text-base"
                                />
                            </a>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Gold Divider */}
            <div
                aria-hidden="true"
                className="h-px bg-[#c5a880]/20"
            />
        </div>
    );
}