'use client';

import {
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';

import Link from 'next/link';
import Image from 'next/image';

import {
    ArrowLeft,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';

interface HeroSlide {
    id: string;
    tagline: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    imageSrc: string;
    imageAlt: string;
}

const HERO_SLIDES: HeroSlide[] = [
    {
        id: 'cakes',
        tagline: 'منذ 1919',
        title: 'أكتشف عالم الكيك',
        description:
            'تشكيلة فاخرة من الكيك بمختلف النكهات، تجمع بين المذاق الغني والتفاصيل الشهية، لتمنحك تجربة كيك استثنائية بكل تفاصيلها',
        buttonText: 'تسوق الآن',
        buttonLink: '/products?category=cakes',
        imageSrc: '/images/heroCake.jpg',
        imageAlt: 'تشكيلة الكيك الفاخرة من حلويات سعد الدين 1919',
    },
    {
        id: 'kunafa',
        tagline: 'منذ 1919',
        title: 'تشكيلة الكنافة',
        description:
            'تشكيلة فاخرة من الكنافة بمختلف النكهات، بقرمشة ذهبية وحشوات غنية لتمنحك تجربة استثنائية',
        buttonText: 'تسوق تشكيلة الكنافة',
        buttonLink: '/products?category=kunafa',
        imageSrc: '/images/heroKunafa.jpg',
        imageAlt: 'تشكيلة الكنافة الفاخرة من حلويات سعد الدين 1919',
    },
    {
        id: 'icecream',
        tagline: 'منذ 1919',
        title: 'تشكيلة الآيس كريم',
        description:
            'تشكيلة مميزة بنكهات متنوعة تجمع بين المذاق الغني واللمسة المنعشة ونكهات الفواكه الطبيعية',
        buttonText: 'تسوق تشكيلة الآيس كريم',
        buttonLink: '/products?category=ice-cream',
        imageSrc: '/images/heroIceCream.jpg',
        imageAlt: 'تشكيلة الآيس كريم المنعشة من حلويات سعد الدين 1919',
    },
];

const AUTOPLAY_DELAY = 5000;
const TRANSITION_DURATION = 700;

export default function HeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);

    const touchStartX = useRef<number | null>(null);

    const currentSlide = HERO_SLIDES[currentIndex];

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex(
            (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
        );
    }, []);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    useEffect(() => {
        const motionQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );

        const updateMotionPreference = () => {
            setReducedMotion(motionQuery.matches);
        };

        const updatePageVisibility = () => {
            setIsPageVisible(!document.hidden);
        };

        updateMotionPreference();
        updatePageVisibility();

        motionQuery.addEventListener('change', updateMotionPreference);
        document.addEventListener('visibilitychange', updatePageVisibility);

        return () => {
            motionQuery.removeEventListener('change', updateMotionPreference);
            document.removeEventListener(
                'visibilitychange',
                updatePageVisibility,
            );
        };
    }, []);

    useEffect(() => {
        const nextIndex = (currentIndex + 1) % HERO_SLIDES.length;
        const nextImage = new window.Image();

        nextImage.src = HERO_SLIDES[nextIndex].imageSrc;
    }, [currentIndex]);

    useEffect(() => {
        if (isPaused || reducedMotion || !isPageVisible) {
            return;
        }

        const interval = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        }, AUTOPLAY_DELAY);

        return () => window.clearInterval(interval);
    }, [isPaused, reducedMotion, isPageVisible]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.altKey || event.ctrlKey || event.metaKey) {
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                prevSlide();
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                nextSlide();
            }
        },
        [nextSlide, prevSlide],
    );

    const handleTouchStart = (
        event: React.TouchEvent<HTMLElement>,
    ) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
    };

    const handleTouchEnd = (
        event: React.TouchEvent<HTMLElement>,
    ) => {
        if (touchStartX.current === null) {
            return;
        }

        const endX = event.changedTouches[0]?.clientX;

        if (endX === undefined) {
            touchStartX.current = null;
            return;
        }

        const difference = endX - touchStartX.current;
        const swipeThreshold = 50;

        if (Math.abs(difference) >= swipeThreshold) {
            if (difference > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }

        touchStartX.current = null;
    };

    return (
        <section
            aria-label="القسم الرئيسي - حلويات سعد الدين 1919"
            aria-roledescription="عارض شرائح"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
                if (
                    !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                    )
                ) {
                    setIsPaused(false);
                }
            }}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            dir="ltr"
            className=" group/hero relative w-full overflow-hidden bg-[#0b3c2e] font-['Cairo']"
        >
            <div className="relative flex min-h-120 w-full items-center overflow-hidden bg-[#0b3c2e] sm:min-h-135 lg:min-h-155">

                <div
                    className="absolute inset-0 overflow-hidden bg-[#0b3c2e]"
                    aria-hidden="true"
                >
                    {HERO_SLIDES.map((item, index) => {
                        const isActive = currentIndex === index;

                        return (
                            <div
                                key={item.id}
                                className={`absolute inset-0 ${isActive
                                    ? 'z-1 opacity-100'
                                    : 'z-0 opacity-0 pointer-events-none'
                                    }`}
                                style={{
                                    transition: reducedMotion
                                        ? 'none'
                                        : `opacity ${TRANSITION_DURATION}ms ease-in-out`,
                                    willChange: 'opacity',
                                    transform: 'translateZ(0)',
                                }}
                            >
                                <Image
                                    src={item.imageSrc}
                                    alt=""
                                    fill
                                    priority={index === 0}
                                    loading={index === 0 ? undefined : 'eager'}
                                    fetchPriority={index === 0 ? 'high' : 'auto'}
                                    sizes="100vw"
                                    className={`object-cover object-center ${isActive && !reducedMotion
                                        ? 'transition-transform duration-2000 ease-out group-hover/hero:scale-110'
                                        : ''
                                        }`}
                                />
                            </div>
                        );
                    })}

                    <div className="pointer-events-none absolute inset-0 z-2 bg-[#062920]/25" />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 h-px bg-linear-to-l from-transparent via-[#C5A880]/50 to-transparent" />
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-7xl justify-start px-6 py-16 sm:px-10 lg:px-12">
                    <div
                        key={currentSlide.id}
                        className="flex w-full flex-col items-center space-y-5 rounded-3xl border border-[#C5A880]/50 bg-[#1c130d]/55 p-6 text-center shadow-[0_0_35px_rgba(197,168,128,0.2)] transition-shadow duration-500 sm:space-y-6 sm:p-8 lg:w-130 lg:items-center lg:text-center"
                    >
                        <div className="inline-flex items-center gap-3 text-sm font-bold tracking-wide text-white sm:text-base">
                            <span
                                aria-hidden="true"
                                className="h-px w-6 bg-[#C5A880]"
                            />

                            <span>{currentSlide.tagline}</span>

                            <span
                                aria-hidden="true"
                                className="h-px w-6 bg-[#C5A880]"
                            />
                        </div>

                        <h1
                            aria-live="polite"
                            aria-atomic="true"
                            className="max-w-xl text-3xl font-black leading-normal text-white sm:text-4xl lg:text-5xl"
                        >
                            {currentSlide.title}
                        </h1>

                        <p className="max-w-md text-sm font-bold leading-8 text-white/90 sm:text-base">
                            {currentSlide.description}
                        </p>

                        <div className="pt-2">
                            <Link
                                href={currentSlide.buttonLink}
                                className="group/button inline-flex items-center justify-center gap-3 rounded-full border border-[#C5A880]/60 bg-[#082B21] px-8 py-3.5 text-sm font-bold text-white shadow-[0_5px_20px_rgba(197,168,128,0.2)] transition-all duration-300 hover:border-[#C5A880] hover:bg-[#0B3C2E] hover:shadow-[0_5px_25px_rgba(197,168,128,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b3c2e] sm:text-base"
                            >
                                <span>{currentSlide.buttonText}</span>

                                <ArrowLeft
                                    aria-hidden="true"
                                    className="h-4 w-4 text-[#C5A880] transition-transform duration-300 group-hover/button:-translate-x-1 motion-reduce:transform-none"
                                />
                            </Link>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="الشريحة السابقة"
                    className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#C5A880]/50 bg-[#FEF8EB]/90 text-[#0B3C2E] shadow-[0_3px_15px_rgba(197,168,128,0.18)] backdrop-blur-sm transition-colors duration-300 hover:border-[#C5A880] hover:bg-[#0B3C2E] hover:text-[#C5A880] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] motion-reduce:transition-none sm:right-8 sm:h-12 sm:w-12"
                >
                    <ChevronRight
                        aria-hidden="true"
                        className="h-6 w-6"
                    />
                </button>

                <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="الشريحة التالية"
                    className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#C5A880]/50 bg-[#FEF8EB]/90 text-[#0B3C2E] shadow-[0_3px_15px_rgba(197,168,128,0.18)] backdrop-blur-sm transition-colors duration-300 hover:border-[#C5A880] hover:bg-[#0B3C2E] hover:text-[#C5A880] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] motion-reduce:transition-none sm:left-8 sm:h-12 sm:w-12"
                >
                    <ChevronLeft
                        aria-hidden="true"
                        className="h-6 w-6"
                    />
                </button>

                <div
                    className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-2"
                    role="group"
                    aria-label="اختيار الشريحة"
                >
                    {HERO_SLIDES.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => goToSlide(index)}
                            aria-label={`انتقال إلى الشريحة رقم ${index + 1}: ${item.title}`}
                            aria-current={currentIndex === index ? 'true' : undefined}
                            className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] motion-reduce:transition-none ${currentIndex === index
                                ? 'w-8 bg-[#C5A880] shadow-[0_0_10px_rgba(197,168,128,0.55)]'
                                : 'w-3 bg-white/60 hover:bg-[#C5A880]'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}