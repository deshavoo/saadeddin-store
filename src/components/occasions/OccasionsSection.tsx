import { getActiveOccasions } from "@/lib/occasions";
import type { OccasionView } from "@/lib/occasion-types";
import OccasionsShowcase from "./OccasionsShowcase";

/** Server Component: يجلب المناسبات ويمرّرها للعرض التفاعلي. لا يعرض شيئًا إن لم توجد مناسبات. */
export default async function OccasionsSection() {
    let occasions: OccasionView[] = [];

    try {
        occasions = await getActiveOccasions();
    } catch (error) {
        // لا نكسر الصفحة الرئيسية إن لم تُنفَّذ الـ migration بعد أو تعذّر الاتصال
        console.error("[OccasionsSection]", error);
        return null;
    }

    if (occasions.length === 0) return null;

    return <OccasionsShowcase occasions={occasions} />;
}
