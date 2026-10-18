"use client";

import { CartView } from "@/components/Cart";

export default function CartPage() {
    return (
        <main className="flex-1 bg-[#FEF8EB] px-4 py-10 font-['Cairo'] sm:px-6 lg:px-8" dir="rtl">
            <div className="mx-auto max-w-6xl">
                <CartView />
            </div>
        </main>
    );
}