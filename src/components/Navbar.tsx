"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Globe, Search, Menu, X, ShoppingBag, User, LogOut, Heart, ArrowLeft } from "lucide-react";
import { useCart } from "@/components/Cart";

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

    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const { data: session, status } = useSession();
    const { itemCount } = useCart();
    const safeItemCount = itemCount ?? 0;


    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    // إغلاق بزرار Esc
    useEffect(() => {
        if (!isMobileMenuOpen && !isSearchOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
                menuButtonRef.current?.focus();
            }
            if (isSearchOpen) {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobileMenuOpen, isSearchOpen]);

    // قفل القائمة لو الشاشة كبرت لمقاس md (مثلاً قلب التابلت أفقي)
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (e.matches) setIsMobileMenuOpen(false);
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // فوكس تلقائي على حقل البحث لما يتفتح
    useEffect(() => {
        if (isSearchOpen) searchInputRef.current?.focus();
    }, [isSearchOpen]);

    const handleSearchSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const trimmedQuery = searchQuery.trim();
            if (trimmedQuery) {
                router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
                setIsSearchOpen(false);
                setIsMobileMenuOpen(false);
            }
        },
        [searchQuery, router]
    );

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
            setIsSearchOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#c5a880]/20 bg-[#FEF8EB]/95 backdrop-blur-md transition-all duration-300 shadow-sm font-(family-name:--font-cairo)">
            <nav
                dir="rtl"
                aria-label="التنقل الرئيسي"
                className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-8"
            >
                {/* روابط التنقل */}
                <div className="flex items-center gap-4 lg:gap-8">
                    <button
                        ref={menuButtonRef}
                        type="button"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#0b3c2e] hover:bg-[#c5a880]/10 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <ul className="hidden items-center gap-4 md:flex lg:gap-8">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={(e) => scrollToSection(e, link.href)}
                                    className="group relative py-1 text-[13px] font-bold text-[#0b3c2e] transition-colors duration-200 hover:text-[#c5a880] lg:text-sm"
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
                <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                    <Link
                        href="/"
                        aria-label="الصفحة الرئيسية لسعد الدين 1919"
                        className="flex items-center justify-center transition-transform duration-300 hover:scale-105 focus:outline-none"
                    >
                        <Image
                            src="/logo.svg"
                            alt="شعار حلويات سعد الدين 1919"
                            width={180}
                            height={70}
                            priority
                            className="h-11 w-auto object-contain sm:h-12 md:h-14 lg:h-16"
                        />
                    </Link>
                </div>

                {/* البحث وأدوات المستخدم */}
                <div dir="ltr" className="flex items-center gap-1 sm:gap-1.5 lg:gap-3">

                    {/* البحث (مخفي تحت md، موجود جوه قائمة الموبايل) */}
                    <form
                        onSubmit={handleSearchSubmit}
                        role="search"
                        className={`hidden h-10 shrink-0 items-center rounded-full border bg-white/80 px-2.5 transition-none duration-300 ease-out focus-within:border-[#c5a880] focus-within:bg-white focus-within:shadow-[0_4px_18px_rgba(11,60,46,0.08)] md:flex ${isSearchOpen
                            ? "w-40 border-[#c5a880]/50 sm:w-52 lg:w-64"
                            : "w-10 border-transparent bg-transparent sm:w-40 sm:border-[#c5a880]/30 sm:bg-white/80 lg:w-52"
                            }`}
                    >
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen((prev) => !prev)}
                            aria-label={isSearchOpen ? "إغلاق البحث" : "فتح البحث"}
                            aria-expanded={isSearchOpen}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0b3c2e] transition-colors hover:bg-[#c5a880]/15 hover:text-[#8f7041] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                        >
                            {isSearchOpen ? <X size={18} strokeWidth={2} /> : <Search size={18} strokeWidth={2} />}
                        </button>

                        <input
                            ref={searchInputRef}
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث..."
                            aria-label="البحث عن المنتجات"
                            tabIndex={isSearchOpen ? 0 : undefined}
                            className={`ml-1 min-w-0 flex-1 bg-transparent text-xs text-[#0b3c2e] outline-none placeholder:text-gray-400 lg:text-sm ${isSearchOpen ? "block" : "hidden sm:block"
                                }`}
                        />
                    </form>

                    {/* تغيير اللغة */}
                    <button
                        type="button"
                        aria-label="تغيير اللغة إلى الإنجليزية"
                        className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[#c5a880]/30 px-2.5 py-1.5 text-xs font-bold text-[#0b3c2e] transition-all duration-200 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e] lg:flex"
                    >
                        <Globe size={16} strokeWidth={2} />
                        <span className="hidden xl:inline-block">EN</span>
                    </button>

                    {/* المفضلة */}
                    <Link
                        href="/profile"
                        aria-label="قائمة المفضلة"
                        className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0b3c2e] transition-colors hover:bg-[#c5a880]/20 hover:text-[#c5a880] md:flex"
                    >
                        <Heart size={20} strokeWidth={2} />
                    </Link>

                    {/* السلة */}
                    <Link
                        href="/cart"
                        aria-label={`سلة التسوق تحتوي على ${safeItemCount} عناصر`}
                        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0b3c2e] transition-colors hover:bg-[#c5a880]/20 hover:text-[#c5a880] md:h-10 md:w-10"
                    >
                        <ShoppingBag size={20} strokeWidth={2} />
                        {safeItemCount > 0 && (
                            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c5a880] px-1 text-[10px] font-bold text-[#0b3c2e] shadow-sm">
                                {safeItemCount > 99 ? "99+" : safeItemCount}
                            </span>
                        )}
                    </Link>

                    {/* قسم الحساب */}
                    {status === "loading" ? (
                        // 1. أثناء التحميل: هيكل مبدئي عشان مفيش Flicker
                        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[#c5a880]/20 md:h-10 md:w-10" />
                    ) : status === "authenticated" && session?.user ? (
                        // 2. مسجل دخول
                        <div className="flex shrink-0 items-center gap-1.5">
                            <Link
                                href="/profile"
                                aria-label="حسابي"
                                className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#c5a880]/40 bg-[#062920] px-2 py-1.5 text-xs font-bold text-[#c5a880] shadow-sm transition-all duration-300 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e] md:h-10 lg:px-3"
                            >
                                <User size={18} strokeWidth={2} className="shrink-0" />
                                {/* اسم المستخدم: بيظهر من sm وطالع، وعلى الموبايل الأيقونة بس */}
                                <span className="hidden max-w-30 truncate sm:inline-block lg:max-w-none">
                                    {session.user.name?.split(" ")[0] || "حسابي"}
                                </span>
                            </Link>

                            {/* زرار تسجيل الخروج: من md وطالع (على الموبايل موجود في القائمة) */}
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                title="تسجيل الخروج"
                                aria-label="تسجيل الخروج"
                                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 md:flex"
                            >
                                <LogOut size={20} strokeWidth={2.2} />
                            </button>
                        </div>
                    ) : (
                        // 3. غير مسجل دخول
                        <Link
                            href="/auth"
                            aria-label="تسجيل الدخول"
                            title="تسجيل الدخول"
                            className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#c5a880]/40 bg-[#062920] px-2 py-1.5 text-xs font-bold text-[#c5a880] shadow-sm transition-all duration-300 hover:border-[#c5a880] hover:bg-[#c5a880] hover:text-[#0b3c2e] md:h-10 lg:px-3"
                        >
                            <User size={18} strokeWidth={2} className="shrink-0" />
                            <span className="hidden sm:inline-block">تسجيل الدخول</span>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Overlay: بيظهر والقائمة مفتوحة، والضغط عليه يقفلها */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                    className="absolute inset-x-0 top-full z-40 h-dvh bg-[#062920]/40 backdrop-blur-[2px] md:hidden"
                />
            )}

            {/* قائمة الموبايل */}
            <div
                id="mobile-menu"
                dir="rtl"
                aria-hidden={!isMobileMenuOpen}
                inert={!isMobileMenuOpen}
                className={`absolute inset-x-0 top-full z-50 overflow-hidden border-t border-[#c5a880]/20 bg-[#FEF8EB] shadow-[0_16px_35px_rgba(11,60,46,0.10)] transition-all duration-300 ease-out md:hidden ${isMobileMenuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"
                    }`}
            >
                <div className="max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain px-5 py-5">
                    {/* البحث */}
                    <form
                        onSubmit={handleSearchSubmit}
                        role="search"
                        className="mb-5 flex min-h-12 items-center gap-3 rounded-2xl border border-[#c5a880]/30 bg-white px-4 shadow-sm focus-within:border-[#c5a880]"
                    >
                        <Search size={19} className="shrink-0 text-[#a88a5e]" aria-hidden="true" />
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
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-[#c5a880]/15 hover:text-[#0b3c2e]"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>

                    {/* روابط */}
                    <ul className="flex flex-col">
                        {NAV_LINKS.map((link, index) => (
                            <li
                                key={link.href}
                                className={`border-b border-[#c5a880]/15 ${index === 0 ? "border-t border-[#c5a880]/15" : ""}`}
                            >
                                <Link
                                    href={link.href}
                                    onClick={(event) => {
                                        scrollToSection(event, link.href);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="group flex min-h-13 items-center justify-between gap-4 py-3 text-[15px] font-bold text-[#0b3c2e] hover:text-[#8f7041]"
                                >
                                    <span>{link.label}</span>
                                    <ArrowLeft size={17} className="shrink-0 text-[#a88a5e] group-hover:-translate-x-1" />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* أدوات المستخدم */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link
                            href="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-[#c5a880]/25 bg-white/70 p-3 text-sm font-semibold text-[#0b3c2e] hover:border-[#c5a880]/60 hover:bg-white"
                        >
                            <Heart size={21} strokeWidth={1.8} className="text-[#a88a5e]" />
                            <span>المفضلة</span>
                        </Link>

                        <Link
                            href="/cart"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-[#c5a880]/25 bg-white/70 p-3 text-sm font-semibold text-[#0b3c2e] hover:border-[#c5a880]/60 hover:bg-white"
                        >
                            <span className="relative">
                                <ShoppingBag size={21} strokeWidth={1.8} className="text-[#a88a5e]" />
                                {safeItemCount > 0 && (
                                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c5a880] px-1 text-[9px] font-bold text-[#0b3c2e]">
                                        {safeItemCount > 99 ? "99+" : safeItemCount}
                                    </span>
                                )}
                            </span>
                            <span>سلة التسوق</span>
                        </Link>

                        <button
                            type="button"
                            className="group flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-[#c5a880]/25 bg-white/70 p-3 text-sm font-semibold text-[#0b3c2e] hover:border-[#c5a880]/60 hover:bg-white"
                        >
                            <Globe size={21} strokeWidth={1.8} className="text-[#a88a5e]" />
                            <span>English</span>
                        </button>

                        <Link
                            href={status === "authenticated" ? "/profile" : "/auth"}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group flex min-h-22 flex-col items-center justify-center gap-2 rounded-2xl border border-[#c5a880]/25 bg-white/70 p-3 text-sm font-semibold text-[#0b3c2e] hover:border-[#c5a880]/60 hover:bg-white"
                        >
                            <User size={21} strokeWidth={1.8} className="text-[#a88a5e]" />
                            <span>{status === "authenticated" ? "حسابي" : "تسجيل الدخول"}</span>
                        </Link>
                    </div>

                    {status === "authenticated" && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                signOut({ callbackUrl: "/" });
                            }}
                            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200/80 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50"
                        >
                            <LogOut size={18} strokeWidth={1.8} />
                            <span>تسجيل الخروج</span>
                        </button>
                    )}

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