import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileClient from "./profile-client";

export const metadata: Metadata = {
    title: "حسابي الشخصي | حلويات سعد الدين 1919",
    description: "إدارة تفاصيل الحساب، الطلبات السابقة، العناوين، وقائمة المفضلة في متجر حلويات سعد الدين 1919.",
};

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/auth");
    }

    const dbUser = await db.user.findUnique({
        where: { email: session.user.email },
        include: {
            orders: {
                include: { items: true },
                orderBy: { createdAt: 'desc' }
            },
            addresses: true,
            wishlist: {
                include: { product: true }
            }
        },
    });

    if (!dbUser) {
        redirect("/auth");
    }

    // تحديد العضوية التالية بناءً على النقاط الحالية
    const currentPoints = dbUser.points || 0;
    let currentTier = dbUser.tier || "العضوية البرونزية";
    let nextTierName = "العضوية الفضية";
    let nextTierGoal = 1000;

    if (currentPoints >= 3000) {
        currentTier = "العضوية الماسية";
        nextTierName = "العضوية الملكية";
        nextTierGoal = 5000;
    } else if (currentPoints >= 1500) {
        currentTier = "العضوية الذهبية";
        nextTierName = "العضوية الماسية";
        nextTierGoal = 3000;
    } else if (currentPoints >= 500) {
        currentTier = "العضوية الفضية";
        nextTierName = "العضوية الذهبية";
        nextTierGoal = 1500;
    }

    const userData = {
        name: dbUser.name || session.user.name || "مستخدم سعد الدين",
        email: dbUser.email ?? "",
        phone: "+966 50 000 0000",
        joined: dbUser.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }) : '2026',
        birthday: "1995-01-01",
        points: currentPoints,
        nextTierPoints: nextTierGoal,
        tier: currentTier,
        nextTier: nextTierName,
    };

    const realOrders = dbUser.orders.map((o) => ({
        id: o.id,
        date: new Date(o.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }),
        total: o.total,
        status: o.status as 'processing' | 'delivered' | 'cancelled',
        items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price }))
    }));

    const realAddresses = dbUser.addresses.map((a) => ({
        id: a.id,
        label: a.label,
        icon: 'home' as const,
        city: a.city,
        street: a.street,
        phone: a.phone,
        isDefault: a.isDefault
    }));

    const realWishlist = dbUser.wishlist.map((w) => ({
        id: w.product.id,
        name: w.product.name,
        note: w.product.note || "",
        price: w.product.price,
        image: w.product.image
    }));

    return (
        <ProfileClient
            initialUser={userData}
            initialOrders={realOrders}
            initialAddresses={realAddresses}
            initialWishlist={realWishlist}
        />
    );
}