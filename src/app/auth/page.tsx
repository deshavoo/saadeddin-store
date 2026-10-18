'use client';
import { registerUser } from "@/actions/auth-actions";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useId, type FormEvent, } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash, FaArrowLeft, FaShieldAlt, FaGift, FaStar, } from 'react-icons/fa';

type AuthMode = 'login' | 'signup';

interface AuthFormData { name: string; phone: string; email: string; password: string; }
export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const shouldReduceMotion = useReducedMotion();
    const formId = useId();

    const [formData, setFormData] = useState<AuthFormData>({
        name: '',
        phone: '',
        email: '',
        password: '',
    });

    const isLogin = mode === 'login';

    const switchMode = (nextMode: AuthMode) => {
        if (mode === nextMode) return;

        setMode(nextMode);
        setError('');
        setSuccess('');
        setShowPassword(false);
    };

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) setError('');
        if (success) setSuccess('');
    };

    const router = useRouter();

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (!formData.email.trim() || !formData.password) {
            setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
            return;
        }

        if (!isLogin && !formData.name.trim()) {
            setError('يرجى إدخال الاسم الكامل.');
            return;
        }

        if (formData.password.length < 8) {
            setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (!isLogin) {
                const result = await registerUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });

                if (result.error) {
                    setError(result.error);
                } else if (result.success) {
                    setSuccess(result.success);
                    setTimeout(() => {
                        setMode('login');
                        setSuccess('');
                    }, 2000);
                }
            } else {
                const res = await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (res?.error) {
                    setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
                } else {
                    setSuccess("تم تسجيل الدخول بنجاح! جاري تحويلك...");
                    router.push("/");
                    router.refresh();
                }
            }
        } catch (err) {
            console.error(err);
            setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const animationTransition = shouldReduceMotion
        ? { duration: 0 }
        : {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1] as const,
        };

    return (
        <main
            dir="rtl"
            className="relative min-h-screen overflow-hidden bg-[#FEF8EB] font-['Cairo'] text-[#0b3c2e] selection:bg-[#c5a880]/30"
        >
            {/* Background Decoration */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-[#c5a880]/15"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#c5a880]/20"
            />

            {/* Header */}
            <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                <Link
                    href="/"
                    aria-label="العودة إلى الصفحة الرئيسية"
                    className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                >
                    <Image
                        src="/logo.svg"
                        alt="حلويات سعد الدين 1919"
                        width={150}
                        height={55}
                        priority
                        className="h-auto w-28 object-contain sm:w-36"
                    />
                </Link>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b3c2e]/75 transition-colors hover:text-[#c5a880] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                >
                    <FaArrowLeft
                        aria-hidden="true"
                        className="text-xs"
                    />
                    <span>العودة للرئيسية</span>
                </Link>
            </header>

            {/* Main Authentication Layout */}
            <section
                aria-label="تسجيل الدخول وإنشاء الحساب"
                className="relative mx-auto flex w-full max-w-7xl items-center justify-center px-4 pb-10 pt-4 sm:px-8 sm:pb-14 lg:min-h-[calc(100vh-100px)] lg:px-12 lg:pt-0"
            >
                <div className="relative grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[28px] border border-[#c5a880]/25 bg-white shadow-[0_25px_90px_rgba(11,60,46,0.12)] lg:min-h-162.5 lg:grid-cols-2">

                    {/* Forms Panel */}
                    <motion.div
                        layout="position"
                        transition={animationTransition}
                        className={`relative z-10 flex min-w-0 items-center justify-center px-5 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 ${isLogin ? 'order-2 lg:order-1' : 'order-2 lg:order-2'}`}
                    >
                        <div className="w-full max-w-md">

                            {/* Form Heading */}
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={`${mode}-heading`}
                                    initial={{
                                        opacity: 0,
                                        x: shouldReduceMotion ? 0 : 18,
                                    }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{
                                        opacity: 0,
                                        x: shouldReduceMotion ? 0 : -18,
                                    }}
                                    transition={animationTransition}
                                    className="mb-8"
                                >
                                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c5a880]/35 bg-[#FEF8EB] text-xl text-[#0b3c2e]">
                                        {isLogin ? (
                                            <FaShieldAlt aria-hidden="true" />
                                        ) : (
                                            <FaGift aria-hidden="true" />
                                        )}
                                    </div>

                                    <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#b29460]">
                                        SAADEDDIN 1919
                                    </p>

                                    <h1 className="text-3xl font-black leading-tight text-[#0b3c2e] sm:text-4xl">
                                        {isLogin
                                            ? 'أهلاً بعودتك'
                                            : 'انضم إلى عائلتنا'}
                                    </h1>

                                    <p className="mt-3 text-sm leading-7 text-[#64736a] sm:text-base">
                                        {isLogin
                                            ? 'سجّل دخولك واستمتع بتجربة تسوق مميزة.'
                                            : 'أنشئ حسابك واكتشف عالم سعد الدين من جديد.'}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Login / Signup Switch */}
                            <div
                                className="mb-7 grid grid-cols-2 rounded-xl border border-[#c5a880]/25 bg-[#FEF8EB] p-1"
                                role="group"
                                aria-label="اختيار نوع الحساب"
                            >
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    aria-pressed={isLogin}
                                    className={`rounded-lg px-3 py-3 text-sm font-bold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] ${isLogin
                                        ? 'bg-[#0b3c2e] text-white shadow-md'
                                        : 'text-[#64736a] hover:text-[#0b3c2e]'
                                        }`}
                                >
                                    تسجيل الدخول
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchMode('signup')}
                                    aria-pressed={!isLogin}
                                    className={`rounded-lg px-3 py-3 text-sm font-bold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] ${!isLogin
                                        ? 'bg-[#0b3c2e] text-white shadow-md'
                                        : 'text-[#64736a] hover:text-[#0b3c2e]'
                                        }`}
                                >
                                    حساب جديد
                                </button>
                            </div>

                            {/* Authentication Form */}
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.form
                                    key={mode}
                                    id={formId}
                                    onSubmit={handleSubmit}
                                    noValidate
                                    initial={{
                                        opacity: 0,
                                        x: shouldReduceMotion ? 0 : 24,
                                    }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{
                                        opacity: 0,
                                        x: shouldReduceMotion ? 0 : -24,
                                    }}
                                    transition={animationTransition}
                                    className="space-y-4"
                                    aria-label={
                                        isLogin
                                            ? 'نموذج تسجيل الدخول'
                                            : 'نموذج إنشاء حساب جديد'
                                    }
                                >
                                    {/* Full Name */}
                                    {!isLogin && (
                                        <div>
                                            <label
                                                htmlFor={`${formId}-name`}
                                                className="mb-2 block text-sm font-bold text-[#263d32]"
                                            >
                                                الاسم الكامل
                                            </label>

                                            <div className="relative">
                                                <FaUser
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#b29460]"
                                                />

                                                <input
                                                    id={`${formId}-name`}
                                                    name="name"
                                                    type="text"
                                                    autoComplete="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="أدخل اسمك الكامل"
                                                    required={!isLogin}
                                                    className="w-full rounded-xl border border-[#d9d6ca] bg-white py-3.5 pr-11 pl-4 text-sm text-[#0b3c2e] outline-none transition-colors placeholder:text-[#a3aaa3] focus:border-[#c5a880] focus:ring-2 focus:ring-[#c5a880]/15"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Phone */}
                                    {!isLogin && (
                                        <div>
                                            <label
                                                htmlFor={`${formId}-phone`}
                                                className="mb-2 block text-sm font-bold text-[#263d32]"
                                            >
                                                رقم الجوال
                                            </label>

                                            <div className="relative">
                                                <FaPhone
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#b29460]"
                                                />

                                                <input
                                                    id={`${formId}-phone`}
                                                    name="phone"
                                                    type="tel"
                                                    autoComplete="tel"
                                                    inputMode="tel"
                                                    dir="ltr"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+966 5X XXX XXXX"
                                                    required={!isLogin}
                                                    className="w-full rounded-xl border border-[#d9d6ca] bg-white py-3.5 pr-11 pl-4 text-left text-sm text-[#0b3c2e] outline-none transition-colors placeholder:text-[#a3aaa3] focus:border-[#c5a880] focus:ring-2 focus:ring-[#c5a880]/15"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor={`${formId}-email`}
                                            className="mb-2 block text-sm font-bold text-[#263d32]"
                                        >
                                            البريد الإلكتروني
                                        </label>

                                        <div className="relative">
                                            <FaEnvelope
                                                aria-hidden="true"
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#b29460]"
                                            />

                                            <input
                                                id={`${formId}-email`}
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                inputMode="email"
                                                dir="ltr"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="name@example.com"
                                                required
                                                className="w-full rounded-xl border border-[#d9d6ca] bg-white py-3.5 pr-11 pl-4 text-left text-sm text-[#0b3c2e] outline-none transition-colors placeholder:text-[#a3aaa3] focus:border-[#c5a880] focus:ring-2 focus:ring-[#c5a880]/15"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label
                                                htmlFor={`${formId}-password`}
                                                className="text-sm font-bold text-[#263d32]"
                                            >
                                                كلمة المرور
                                            </label>

                                            {isLogin && (
                                                <Link
                                                    href="/auth/forgot-password"
                                                    className="text-xs font-semibold text-[#927343] transition-colors hover:text-[#0b3c2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                                                >
                                                    نسيت كلمة المرور؟
                                                </Link>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <FaLock
                                                aria-hidden="true"
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#b29460]"
                                            />

                                            <input
                                                id={`${formId}-password`}
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete={
                                                    isLogin
                                                        ? 'current-password'
                                                        : 'new-password'
                                                }
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                minLength={8}
                                                required
                                                className="w-full rounded-xl border border-[#d9d6ca] bg-white py-3.5 pr-11 pl-12 text-sm text-[#0b3c2e] outline-none transition-colors placeholder:text-[#a3aaa3] focus:border-[#c5a880] focus:ring-2 focus:ring-[#c5a880]/15"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((previous) => !previous)
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? 'إخفاء كلمة المرور'
                                                        : 'إظهار كلمة المرور'
                                                }
                                                aria-pressed={showPassword}
                                                className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#7b897e] transition-colors hover:text-[#0b3c2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                                            >
                                                {showPassword ? (
                                                    <FaEyeSlash aria-hidden="true" />
                                                ) : (
                                                    <FaEye aria-hidden="true" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    <div aria-live="polite" aria-atomic="true">
                                        {error && (
                                            <p
                                                role="alert"
                                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-700"
                                            >
                                                {error}
                                            </p>
                                        )}

                                        {success && (
                                            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm leading-6 text-green-800">
                                                {success}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#0b3c2e] px-5 py-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(11,60,46,0.16)] transition-colors duration-300 hover:bg-[#062920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                                    >
                                        <span>
                                            {isSubmitting
                                                ? 'جارٍ المعالجة...'
                                                : isLogin
                                                    ? 'تسجيل الدخول'
                                                    : 'إنشاء حساب جديد'}
                                        </span>

                                        {!isSubmitting && (
                                            <FaArrowLeft
                                                aria-hidden="true"
                                                className="text-xs text-[#c5a880] transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transform-none"
                                            />
                                        )}
                                    </button>

                                    {/* Trust Message */}
                                    <div className="flex items-center justify-center gap-2 pt-2 text-xs leading-6 text-[#758176]">
                                        <FaShieldAlt
                                            aria-hidden="true"
                                            className="shrink-0 text-[#b29460]"
                                        />

                                        <span>
                                            بياناتك محمية وتُستخدم لإدارة حسابك بأمان.
                                        </span>
                                    </div>
                                </motion.form>
                            </AnimatePresence>

                            {/* Bottom Switch */}
                            <div className="mt-7 border-t border-[#e9e3d6] pt-5 text-center text-sm text-[#64736a]">
                                {isLogin
                                    ? 'ليس لديك حساب حتى الآن؟'
                                    : 'لديك حساب بالفعل؟'}

                                <button
                                    type="button"
                                    onClick={() =>
                                        switchMode(isLogin ? 'signup' : 'login')
                                    }
                                    className="mr-2 font-bold text-[#927343] underline-offset-4 transition-colors hover:text-[#0b3c2e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
                                >
                                    {isLogin ? 'أنشئ حسابك' : 'سجّل دخولك'}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Promotional Brand Panel (Visible on Mobile & Desktop) */}
                    <motion.aside
                        layout="position"
                        className={`relative flex min-h-87.5 overflow-hidden bg-[#0b3c2e] text-white items-center justify-center ${isLogin ? 'order-1 lg:order-2' : 'order-1 lg:order-1'}`}
                        aria-label="مرحباً بك في عالم سعد الدين"
                    >
                        {/* Decorative Background */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_25%,rgba(197,168,128,0.16),transparent_48%),linear-gradient(145deg,#0b3c2e_0%,#062920_100%)]"
                        />

                        <div
                            aria-hidden="true"
                            className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#c5a880]/20"
                        />

                        <div
                            aria-hidden="true"
                            className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-[#c5a880]/15"
                        />

                        <div
                            aria-hidden="true"
                            className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-[#c5a880]/15"
                        />

                        <div
                            aria-hidden="true"
                            className="absolute right-12 top-12 h-16 w-16 border-r border-t border-[#c5a880]/60"
                        />

                        <div className="relative z-10 mx-auto max-w-lg px-8 py-12 text-center sm:px-12 sm:py-16">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={`promo-${mode}`}
                                    initial={{
                                        opacity: 0,
                                        y: shouldReduceMotion ? 0 : 18,
                                    }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{
                                        opacity: 0,
                                        y: shouldReduceMotion ? 0 : -18,
                                    }}
                                    transition={animationTransition}
                                >
                                    <div className="mx-auto mb-8 flex h-20 w-40 items-center justify-center rounded-2xl border border-[#c5a880]/25 bg-white/4 px-4 sm:mb-10 sm:h-24 sm:w-48 sm:px-5">
                                        <Image
                                            src="/logo.svg"
                                            alt=""
                                            width={180}
                                            height={80}
                                            className="max-h-16 w-full object-contain brightness-0 invert sm:max-h-20"
                                        />
                                    </div>

                                    <div className="mb-6 flex items-center justify-center gap-3 text-sm font-semibold tracking-[0.2em] text-[#c5a880]">
                                        <span className="h-px w-8 bg-[#c5a880]/70" />
                                        <span>SINCE 1919</span>
                                        <span className="h-px w-8 bg-[#c5a880]/70" />
                                    </div>

                                    <h2 className="text-2xl font-black leading-relaxed text-white sm:text-3xl xl:text-4xl">
                                        {isLogin ? (
                                            <>
                                                أهلاً بك مجدداً
                                                <br />
                                                <span className="text-[#c5a880]">
                                                    في عالم الذكريات الحلوة
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                حكايتك الحلوة
                                                <br />
                                                <span className="text-[#c5a880]">
                                                    تبدأ من هنا
                                                </span>
                                            </>
                                        )}
                                    </h2>

                                    <p className="mx-auto mt-4 max-w-sm text-xs leading-7 text-white/75 sm:mt-6 sm:text-sm sm:leading-8">
                                        {isLogin
                                            ? 'يسعدنا أن نكون جزءاً من لحظاتك المميزة. اكتشف تشكيلاتنا الفاخرة واستمتع بتجربة تسوق تليق بك.'
                                            : 'انضم إلى عائلة سعد الدين، واكتشف عالماً من الحلويات الفاخرة والتفاصيل التي تصنع أجمل الذكريات.'}
                                    </p>

                                    <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-semibold text-[#e8d6b6] sm:mt-9">
                                        <span className="inline-flex items-center gap-2">
                                            <FaStar
                                                aria-hidden="true"
                                                className="text-[#c5a880]"
                                            />
                                            جودة استثنائية
                                        </span>

                                        <span className="inline-flex items-center gap-2">
                                            <FaGift
                                                aria-hidden="true"
                                                className="text-[#c5a880]"
                                            />
                                            لحظات تستحق الاحتفال
                                        </span>
                                    </div>

                                    <div className="mx-auto mt-8 h-px w-24 bg-linear-to-l from-transparent via-[#c5a880]/70 to-transparent sm:mt-10" />

                                    <p className="mt-4 text-xs tracking-wide text-white/50 sm:mt-5">
                                        حلويات سعد الدين 1919 · مذاق يحمل حكاية
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.aside>
                </div>

                <div className="sr-only">
                    حلويات سعد الدين 1919، منذ عام 1919.
                </div>
            </section>
        </main>
    );
}