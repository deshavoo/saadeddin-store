"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Globe, Search, Menu, X, ShoppingBag, User, LogOut, Heart } from "lucide-react";
import { useCart } from "@/components/Cart"; // <--- استيراد السلة

const NAV_LINKS = [
    { label: "المنتجات", href: "#products" },
    { label: "المناسبات", href: "/occasions" },
    { label: "حسب الطلب", href: "/custom-orders" },
    { label: "عن سعد الدين", href: "/about" },
] as const;

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const router = useRouter();
    const { data: session, status } = useSession();
    const { itemCount } = useCart(); // <--- استخدام العدد الحقيقي للمنتجات في السلة

    const handleSearchSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const trimmedQuery = searchQuery.trim();
            if (trimmedQuery) {
                router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
                setIsSearchOpen(false);
            }
        },
        [searchQuery, router]
    );

    // دالة التمرير السلس للسكشن
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const targetId = href.replace("#", "");
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            } else {
                router.push(`/${href}`);
            }
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#c5a880]/20 bg-[#FEF8EB]/95 backdrop-blur-md transition-all duration-300 shadow-sm font-['Cairo']">
            <nav
                dir="rtl"
                aria-label="التنقل الرئيسي"
                className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
            >
                <div className="flex items-center gap-6 lg:gap-8">
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        className="inline-flex items-center justify-center rounded-xl p-2 text-[#0b3c2e] hover:bg-[#c5a880]/10 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <ul className="hidden items-center gap-6 md:flex lg:gap-8">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={(e) => scrollToSection(e, link.href)}
                                    className="relative py-1 text-sm font-bold text-[#0b3c2e] transition-colors duration-200 hover:text-[#c5a880] group"
                                >
                                    {link.label}
                                    <span
                                        className="absolute inset-x-0 bottom-0 h-0.5 w-0 bg-[#c5a880] transition-all duration-300 group-hover:w-full"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link
                        href="/"
                        aria-label="الصفحة الرئيسية لسعد الدين 1919"
                        className="flex items-center justify-center transition-transform duration-300 hover:scale-105 focus:outline-none"
                    >
                        <Image
                            src="/logo.svg"
                            alt="شعار حلويات سعد الدين 1919"
                            width={140}
                            height={50}
                            priority
                            className="h-10 w-auto object-contain sm:h-12"
                        />
                    </Link>
                </div>

                {/* الجانب الأيسر: البحث، اللغة، المفضلة، السلة، والحساب */}
                <div dir="ltr" className="flex items-center gap-1.5 sm:gap-3">

                    {/* نموذج البحث */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className={`flex items-center rounded-full border border-[#c5a880]/30 bg-white/80 px-3 py-1.5 transition-all duration-300 focus-within:border-[#c5a880] focus-within:bg-white focus-within:shadow-md ${isSearchOpen
                            ? "w-48 sm:w-64"
                            : "w-10 sm:w-48 bg-transparent sm:bg-white/80 border-transparent sm:border-[#c5a880]/30"
                            }`}
                    >
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen((prev) => !prev)}
                            aria-label="تفعيل البحث"
                            className="shrink-0 text-[#0b3c2e] hover:text-[#c5a880] transition-colors focus:outline-none"
                        >
                            <Search size={18} strokeWidth={2} />
                        </button>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن منتج..."
                            aria-label="البحث عن المنتجات"
                            className={`ml-2 w-full bg-transparent text-xs sm:text-sm text-[#0b3c2e] outline-none placeholder:text-gray-400 dir-rtl ${isSearchOpen ? "block" : "hidden sm:block"
                                }`}
                        />
                    </form>

                    {/* تبديل اللغة */}
                    <button
                        type="button"
                        aria-label="تغيير اللغة إلى الإنجليزية"
                        className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#c5a880]/30 px-3 py-1.5 text-xs font-bold text-[#0b3c2e] hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e] transition-all duration-200"
                    >
                        <Globe size={16} strokeWidth={2} />
                        <span>EN</span>
                    </button>

                    {/* زر المفضلة */}
                    <Link
                        href="/profile"
                        aria-label="قائمة المفضلة"
                        className="relative flex items-center justify-center rounded-full p-2 text-[#0b3c2e] hover:bg-[#c5a880]/20 hover:text-[#c5a880] transition-colors"
                        title="المفضلة"
                    >
                        <Heart size={20} strokeWidth={2} />
                    </Link>

                    {/* سلة التسوق - ديناميكية */}
                    <Link
                        href="/cart"
                        aria-label={`سلة التسوق تحتوي على ${itemCount} عناصر`}
                        className="relative flex items-center justify-center rounded-full p-2 text-[#0b3c2e] hover:bg-[#c5a880]/20 hover:text-[#c5a880] transition-colors"
                    >
                        <ShoppingBag size={20} strokeWidth={2} />
                        {itemCount > 0 && (
                            <span
                                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c5a880] text-[10px] font-bold text-[#0b3c2e] shadow-sm animate-pulse"
                                aria-hidden="true"
                            >
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    {/* زر الحساب ومحالة تسجيل الدخول */}
                    {status === "authenticated" && session?.user ? (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/profile"
                                className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/40 bg-[#062920] px-3 py-1.5 text-xs font-bold text-[#c5a880] hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e] transition-all duration-300 shadow-sm"
                            >
                                <User size={18} strokeWidth={2} className="shrink-0" />
                                <span className="hidden sm:inline-block">
                                    {session.user.name?.split(" ")[0] || "حسابي"}
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                title="تسجيل الخروج"
                                className="flex items-center justify-center p-2 text-[#0b3c2e] hover:text-red-600 transition-colors"
                            >
                                <LogOut size={18} strokeWidth={2} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth"
                            aria-label="تسجيل الدخول / حسابي"
                            className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/40 bg-[#062920] px-3 py-1.5 text-xs font-bold text-[#c5a880] hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e] transition-all duration-300 shadow-sm"
                        >
                            <User size={18} strokeWidth={2} className="shrink-0" />
                            <span className="hidden sm:inline-block">تسجيل الدخول</span>
                        </Link>
                    )}

                </div>
            </nav>

            {/* قائمة الموبايل */}
            {isMobileMenuOpen && (
                <div
                    id="mobile-menu"
                    dir="rtl"
                    className="border-t border-[#c5a880]/20 bg-[#FEF8EB] px-6 py-6 md:hidden shadow-xl animate-in slide-in-from-top duration-300"
                >
                    <ul className="flex flex-col gap-4">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={(e) => scrollToSection(e, link.href)}
                                    className="block text-base font-bold text-[#0b3c2e] hover:text-[#c5a880] transition-colors py-1.5 border-b border-[#c5a880]/10"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 pt-4 border-t border-[#c5a880]/20 flex items-center justify-between">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm font-bold text-[#0b3c2e] hover:text-[#c5a880] transition-colors"
                        >
                            <Globe size={18} />
                            <span>English</span>
                        </button>

                        {status === "authenticated" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    signOut({ callbackUrl: "/" });
                                }}
                                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:underline"
                            >
                                <LogOut size={18} />
                                <span>تسجيل الخروج</span>
                            </button>
                        ) : (
                            <Link
                                href="/auth"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 text-sm font-bold text-[#c5a880] hover:underline"
                            >
                                <User size={18} />
                                <span>تسجيل الدخول</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}