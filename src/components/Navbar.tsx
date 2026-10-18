"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Globe, Search, Menu, X, ShoppingBag, User, LogOut, Heart, ArrowLeft } from "lucide-react";
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
                {/* روابط التنقل */}
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
                                    className="group relative py-1 text-sm font-bold text-[#0b3c2e] transition-colors duration-200 hover:text-[#c5a880]"
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

                {/* الشعار */}
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

                {/* البحث وأدوات المستخدم */}
                <div dir="ltr" className="flex items-center gap-1.5 sm:gap-3">
                    {/* البحث */}
                    <form
                        onSubmit={handleSearchSubmit}
                        role="search"
                        className={`flex h-10 items-center rounded-full border bg-white/80 px-2.5 transition-all duration-300 ease-out focus-within:border-[#c5a880] focus-within:bg-white focus-within:shadow-[0_4px_18px_rgba(11,60,46,0.08)] ${isSearchOpen
                            ? "w-40 border-[#c5a880]/50 sm:w-64"
                            : "w-10 border-transparent bg-transparent sm:w-48 sm:border-[#c5a880]/30 sm:bg-white/80"
                            }`}
                    >
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen((prev) => !prev)}
                            aria-label={isSearchOpen ? "إغلاق البحث" : "فتح البحث"}
                            aria-expanded={isSearchOpen}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0b3c2e] transition-colors hover:bg-[#c5a880]/15 hover:text-[#8f7041] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                        >
                            {isSearchOpen ? (
                                <X size={18} strokeWidth={2} />
                            ) : (
                                <Search size={18} strokeWidth={2} />
                            )}
                        </button>

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن منتج..."
                            aria-label="البحث عن المنتجات"
                            tabIndex={isSearchOpen ? 0 : undefined}
                            className={`ml-1 min-w-0 flex-1 bg-transparent text-xs text-[#0b3c2e] outline-none placeholder:text-gray-400 sm:text-sm ${isSearchOpen ? "block" : "hidden sm:block"
                                }`}
                        />
                    </form>

                    {/* تغيير اللغة: مخفي على الموبايل */}
                    <button
                        type="button"
                        aria-label="تغيير اللغة إلى الإنجليزية"
                        className="hidden items-center gap-1.5 rounded-full border border-[#c5a880]/30 px-3 py-1.5 text-xs font-bold text-[#0b3c2e] transition-all duration-200 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e] sm:flex"
                    >
                        <Globe size={16} strokeWidth={2} />
                        <span>EN</span>
                    </button>

                    {/* المفضلة: مخفية على الموبايل */}
                    <Link
                        href="/profile"
                        aria-label="قائمة المفضلة"
                        title="المفضلة"
                        className="relative hidden items-center justify-center rounded-full p-2 text-[#0b3c2e] transition-colors hover:bg-[#c5a880]/20 hover:text-[#c5a880] sm:flex"
                    >
                        <Heart size={20} strokeWidth={2} />
                    </Link>

                    {/* السلة: مخفية على الموبايل */}
                    <Link
                        href="/cart"
                        aria-label={`سلة التسوق تحتوي على ${itemCount} عناصر`}
                        className="relative hidden items-center justify-center rounded-full p-2 text-[#0b3c2e] transition-colors hover:bg-[#c5a880]/20 hover:text-[#c5a880] sm:flex"
                    >
                        <ShoppingBag size={20} strokeWidth={2} />

                        {itemCount > 0 && (
                            <span
                                className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c5a880] text-[10px] font-bold text-[#0b3c2e] shadow-sm"
                                aria-hidden="true"
                            >
                                {itemCount > 99 ? "99+" : itemCount}
                            </span>
                        )}
                    </Link>

                    {/* الحساب وتسجيل الدخول: مخفيان على الموبايل */}
                    {status === "authenticated" && session?.user ? (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link
                                href="/profile"
                                className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/40 bg-[#062920] px-3 py-1.5 text-xs font-bold text-[#c5a880] shadow-sm transition-all duration-300 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e]"
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
                                aria-label="تسجيل الخروج"
                                className="flex items-center justify-center p-2 text-[#0b3c2e] transition-colors hover:text-red-600"
                            >
                                <LogOut size={18} strokeWidth={2} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth"
                            aria-label="تسجيل الدخول / حسابي"
                            className="hidden items-center gap-2 rounded-full border border-[#c5a880]/40 bg-[#062920] px-3 py-1.5 text-xs font-bold text-[#c5a880] shadow-sm transition-all duration-300 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e] sm:inline-flex"
                        >
                            <User size={18} strokeWidth={2} className="shrink-0" />
                            <span>تسجيل الدخول</span>
                        </Link>
                    )}
                </div>
            </nav>

            {/* قائمة الموبايل */}
            <div
                id="mobile-menu"
                dir="rtl"
                aria-hidden={!isMobileMenuOpen}
                inert={!isMobileMenuOpen}
                className={`absolute inset-x-0 top-full z-50 overflow-hidden border-t border-[#c5a880]/20 bg-[#FEF8EB] shadow-[0_16px_35px_rgba(11,60,46,0.10)] transition-all duration-300 ease-out md:hidden ${isMobileMenuOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0 pointer-events-none"
                    }`}
            >
                <div className="max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
                    {/* البحث داخل القائمة */}
                    <form
                        onSubmit={(event) => {
                            handleSearchSubmit(event);
                            setIsMobileMenuOpen(false);
                        }}
                        role="search"
                        className="mb-5 flex min-h-12 items-center gap-3 rounded-2xl border border-[#c5a880]/30 bg-white px-4 shadow-sm transition-all duration-200 focus-within:border-[#c5a880] focus-within:shadow-[0_4px_18px_rgba(11,60,46,0.07)]"
                    >
                        <Search
                            size={19}
                            className="shrink-0 text-[#a88a5e]"
                            aria-hidden="true"
                        />

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="ابحث عن منتج..."
                            aria-label="البحث عن المنتجات"
                            className="w-full bg-transparent py-3 text-sm text-[#0b3c2e] outline-none placeholder:text-gray-400"
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                aria-label="مسح البحث"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-[#c5a880]/15 hover:text-[#0b3c2e]"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>

                    {/* روابط الموقع */}
                    <ul className="flex flex-col">
                        {NAV_LINKS.map((link, index) => (
                            <li
                                key={link.href}
                                className={`border-b border-[#c5a880]/15 ${index === 0 ? "border-t border-[#c5a880]/15" : ""
                                    }`}
                            >
                                <Link
                                    href={link.href}
                                    onClick={(event) => {
                                        scrollToSection(event, link.href);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="group flex min-h-13 items-center justify-between gap-4 py-3 text-[15px] font-bold text-[#0b3c2e] transition-colors hover:text-[#8f7041] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c5a880]"
                                >
                                    <span>{link.label}</span>

                                    <ArrowLeft
                                        size={17}
                                        strokeWidth={1.7}
                                        aria-hidden="true"
                                        className="shrink-0 text-[#a88a5e] transition-transform duration-200 group-hover:-translate-x-1"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* أدوات المستخدم */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        {/* المفضلة */}
                        <Link
                            href="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-[#c5a880]/25 bg-white/70 p-3 text-sm font-semibold text-[#0b3c2e] transition-all duration-200 hover:border-[#c5a880]/60 hover:bg-white hover:shadow-sm"
                        >
                            <Heart
                                size={21}
                                strokeWidth={1.8}
                                className="text-[#a88a5e] transition-transform duration-200 group-hover:scale-110"
                            />
                            <span>المفضلة</span>
                        </Link>

                        {/* السلة */}
                        <Link
                            href="/cart"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-[#c5a880]/25 bg-white/70 p-3 text-sm font-semibold text-[#0b3c2e] transition-all duration-200 hover:border-[#c5a880]/60 hover:bg-white hover:shadow-sm"
                        >
                            <span className="relative">
                                <ShoppingBag
                                    size={21}
                                    strokeWidth={1.8}
                                    className="text-[#a88a5e] transition-transform duration-200 group-hover:scale-110"
                                />

                                {itemCount > 0 && (
                                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c5a880] px-1 text-[9px] font-bold text-[#0b3c2e]">
                                        {itemCount > 99 ? "99+" : itemCount}
                                    </span>
                                )}
                            </span>

                            <span>سلة التسوق</span>
                        </Link>

                        {/* اللغة */}
                        <button
                            type="button"
                            className="group flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-[#c5a880]/25 bg-white/70 p-3 text-sm font-semibold text-[#0b3c2e] transition-all duration-200 hover:border-[#c5a880]/60 hover:bg-white hover:shadow-sm"
                        >
                            <Globe
                                size={21}
                                strokeWidth={1.8}
                                className="text-[#a88a5e] transition-transform duration-200 group-hover:scale-110"
                            />
                            <span>English</span>
                        </button>

                        {/* الحساب */}
                        <Link
                            href={status === "authenticated" ? "/profile" : "/auth"}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-[#c5a880]/25 bg-white/70 p-3 text-sm font-semibold text-[#0b3c2e] transition-all duration-200 hover:border-[#c5a880]/60 hover:bg-white hover:shadow-sm"
                        >
                            <User
                                size={21}
                                strokeWidth={1.8}
                                className="text-[#a88a5e] transition-transform duration-200 group-hover:scale-110"
                            />
                            <span>
                                {status === "authenticated" ? "حسابي" : "تسجيل الدخول"}
                            </span>
                        </Link>
                    </div>

                    {/* تسجيل الخروج */}
                    {status === "authenticated" && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                signOut({ callbackUrl: "/" });
                            }}
                            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200/80 px-4 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                            <LogOut size={18} strokeWidth={1.8} />
                            <span>تسجيل الخروج</span>
                        </button>
                    )}

                    {/* Footer */}
                    <div className="mt-5 border-t border-[#c5a880]/15 pt-4 text-center">
                        <p className="text-[10px] font-medium tracking-[0.22em] text-[#0b3c2e]/45">
                            SAAD EDDIN · SINCE 1919
                        </p>
                    </div>
                </div>
            </div>
        </header>


    );
}