"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

export interface GalleryImage {
    url: string;
    alt: string;
}

interface ProductGalleryProps {
    images: GalleryImage[];
    badge?: string | null;
    isLiked?: boolean;
}

export default function ProductGallery({ images, badge, isLiked = false }: ProductGalleryProps) {
    const [active, setActive] = useState(0);
    const current = images[active] ?? images[0];

    return (
        <div className="space-y-4">
            {/* الصورة الرئيسية */}
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-[#c5a880]/30 bg-white shadow-lg">
                <Image
                    src={current.url}
                    alt={current.alt}
                    fill
                    priority={active === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                />

                {badge && (
                    <span className="absolute right-4 top-4 z-10 rounded-full border border-[#c5a880]/70 bg-[#FEF8EB]/95 px-3.5 py-1.5 text-xs font-semibold text-[#0b3c2e] shadow-sm">
                        {badge}
                    </span>
                )}

                <div
                    className={`absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#c5a880]/40 bg-white/90 shadow-md ${isLiked ? "bg-rose-50 text-rose-600" : "text-[#0b3c2e]"}`}
                >
                    <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                </div>
            </div>

            {/* المصغرات */}
            {images.length > 1 && (
                <div
                    role="group"
                    aria-label="صور المنتج"
                    className="grid grid-cols-4 gap-3 sm:grid-cols-5"
                >
                    {images.map((image, index) => {
                        const isActive = index === active;
                        return (
                            <button
                                key={image.url}
                                type="button"
                                onClick={() => setActive(index)}
                                aria-label={`عرض الصورة ${index + 1}`}
                                aria-pressed={isActive}
                                className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition duration-200 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] ${isActive
                                        ? "border-[#c5a880] ring-2 ring-[#c5a880]/30"
                                        : "border-[#c5a880]/20 opacity-75 hover:opacity-100"
                                    }`}
                            >
                                <Image
                                    src={image.url}
                                    alt=""
                                    fill
                                    sizes="(min-width: 640px) 10vw, 22vw"
                                    className="object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
