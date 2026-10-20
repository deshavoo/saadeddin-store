import { NextResponse } from "next/server";
import { REQUEST_TYPES, validateComplaint, type ComplaintInput } from "@/lib/complaintSchema";

/**
 * POST /api/support
 * - يتحقق من البيانات (نفس قواعد الفورم).
 * - Honeypot ضد البوتات + Rate limit بسيط لكل IP.
 * - التسليم عبر webhook (SUPPORT_WEBHOOK_URL). بدّل deliver() بقاعدة بياناتك أو الإيميل لو حبيت.
 */

const WINDOW_MS = 60 * 60 * 1000; // ساعة
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

// ملحوظة: الذاكرة هنا لكل instance. على Vercel/serverless الحماية تقريبية، استخدم Redis/Upstash للحماية الدقيقة.
function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
        hits.set(ip, recent);
        return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    return false;
}

const makeReference = () =>
    `SD-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

async function deliver(reference: string, data: ComplaintInput): Promise<void> {
    const typeLabel = REQUEST_TYPES.find((t) => t.id === data.type)?.label ?? data.type;
    const payload = {
        reference,
        ...data,
        typeLabel,
        createdAt: new Date().toISOString(),
        // حقل text جاهز لو الـ webhook بتاع Slack/Discord-compatible
        text: [
            `رسالة جديدة (${typeLabel}) — ${reference}`,
            `الاسم: ${data.name}`,
            `الجوال: ${data.phone}`,
            data.email && `البريد: ${data.email}`,
            data.orderNumber && `رقم الطلب: ${data.orderNumber}`,
            `التفاصيل: ${data.message}`,
        ]
            .filter(Boolean)
            .join("\n"),
    };

    const url = process.env.SUPPORT_WEBHOOK_URL;

    if (!url) {
        if (process.env.NODE_ENV === "production") {
            // مانخبيش الفشل: أحسن يظهر للعميل خطأ من إننا نضيّع شكوى
            throw new Error("SUPPORT_WEBHOOK_URL is not configured");
        }
        console.log("[support] (dev) new message:", payload);
        return;
    }

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, message: "بيانات غير صالحة" }, { status: 400 });
    }

    // Honeypot: لو الحقل المخفي اتملى يبقى بوت. نرد بنجاح وهمي من غير ما نبعت حاجة.
    if (typeof body.website === "string" && body.website.trim() !== "") {
        return NextResponse.json({ ok: true, reference: makeReference() });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { ok: false, message: "تم إرسال عدد كبير من الرسائل. حاول مرة أخرى لاحقًا." },
            { status: 429 },
        );
    }

    const result = validateComplaint(body);
    if (result.errors) {
        return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
    }

    const reference = makeReference();
    try {
        await deliver(reference, result.data);
    } catch (error) {
        console.error("[support] delivery failed:", error);
        return NextResponse.json(
            { ok: false, message: "تعذر إرسال رسالتك الآن. حاول مرة أخرى أو تواصل معنا هاتفيًا." },
            { status: 500 },
        );
    }

    return NextResponse.json({ ok: true, reference });
}
