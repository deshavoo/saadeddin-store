"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/Cart"; // 👈 استيراد CartProvider من الملف الجديد

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </SessionProvider>
    );
}