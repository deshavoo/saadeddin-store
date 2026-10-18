import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// عدّل المسار حسب صفحة تسجيل الدخول عندك
export const LOGIN_PATH = "/auth/login";


export const getAdminUser = cache(async () => {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return null;

    const user = await db.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, role: true },
    });

    return user && user.role === "ADMIN" ? user : null;
});

/** للصفحات والـ layouts: يحوّل غير المسجّلين لتسجيل الدخول وغير الإداريين للرئيسية. */
export async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.email) redirect(LOGIN_PATH);

    const admin = await getAdminUser();
    if (!admin) redirect("/");

    return admin;
}
