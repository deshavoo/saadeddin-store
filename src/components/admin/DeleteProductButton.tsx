"use client";

import { useFormStatus } from "react-dom";
import { deleteProductAction } from "@/actions/product-actions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? "جارٍ الحذف..." : "حذف"}
        </button>
    );
}

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
    return (
        <form
            action={deleteProductAction}
            onSubmit={(e) => {
                if (!window.confirm(`هل تريد حذف «${name}» نهائيًا؟ سيُزال من السلات والمفضلة، وتبقى الطلبات السابقة محفوظة.`)) {
                    e.preventDefault();
                }
            }}
        >
            <input type="hidden" name="id" value={id} />
            <SubmitButton />
        </form>
    );
}
