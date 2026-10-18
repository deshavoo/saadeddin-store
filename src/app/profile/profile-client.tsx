'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Camera, Crown, ShoppingBag, MapPin, UserRound, Heart, Menu, X, Plus, Pencil,
  Trash2, RotateCcw, Eye, CheckCircle2, AlertCircle, Mail, Phone, CalendarDays,
  Lock, Home, Briefcase, Gift, ChevronLeft,
} from 'lucide-react';
import { updateProfile, updatePassword } from '@/actions/user-actions';

type OrderStatus = 'processing' | 'delivered' | 'cancelled';
interface OrderItem { name: string; qty: number; price: number }
interface Order { id: string; date: string; total: number; status: OrderStatus; items: OrderItem[] }
interface Address { id: string; label: string; icon: 'home' | 'work' | 'other'; city: string; street: string; phone: string; isDefault: boolean }
interface Product { id: string; name: string; note: string; price: number; image: string }

export interface UserData {
  name: string;
  email: string;
  phone: string;
  joined: string;
  birthday: string;
  points: number;
  nextTierPoints: number;
  tier: string;
  nextTier: string;
}

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  processing: { label: 'قيد التنفيذ', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  delivered: { label: 'تم التوصيل', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  cancelled: { label: 'ملغي', cls: 'bg-rose-50 text-rose-800 ring-rose-200' },
};

const TABS = [
  { id: 'orders', label: 'الطلبات السابقة', icon: ShoppingBag },
  { id: 'addresses', label: 'عنوان التوصيل', icon: MapPin },
  { id: 'account', label: 'تفاصيل الحساب', icon: UserRound },
  { id: 'wishlist', label: 'المفضلة', icon: Heart },
] as const;
type TabId = (typeof TABS)[number]['id'];

const fmt = (n: number) => `${n.toLocaleString('ar-SA')} ر.س`;

const inputCls =
  'w-full rounded-xl border border-[#c5a880]/40 bg-white px-4 py-3 text-[#062920] placeholder:text-[#062920]/40 ' +
  'outline-none transition focus:border-[#0b3c2e] focus:ring-2 focus:ring-[#c5a880]/50';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b3c2e] px-5 py-3 font-semibold text-[#FEF8EB] ' +
  'transition hover:bg-[#062920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] focus-visible:ring-offset-2';

const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5a880]/50 bg-white px-4 py-2.5 text-sm font-semibold text-[#0b3c2e] ' +
  'transition hover:bg-[#c5a880]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]';

function Field({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#0b3c2e]">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#062920]/60 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#c5a880]/30 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#0b3c2e]">{title}</h3>
          <button onClick={onClose} aria-label="إغلاق" className="rounded-full p-2 text-[#0b3c2e] hover:bg-[#c5a880]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ToastState { type: 'success' | 'error'; message: string }
function Toast({ toast, onDone }: { toast: ToastState | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [toast, onDone]);
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-6 z-60 flex justify-center">
      <div className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-xl ring-1 ${ok ? 'bg-[#0b3c2e] text-[#FEF8EB] ring-[#c5a880]/50' : 'bg-rose-700 text-white ring-rose-300'}`}>
        {ok ? <CheckCircle2 size={20} className="text-[#c5a880]" /> : <AlertCircle size={20} />}
        {toast.message}
      </div>
    </div>
  );
}

function ProfileHeader({ user, avatar, onAvatar }: { user: UserData; avatar: string | null; onAvatar: (file: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const progress = Math.min(100, Math.round((user.points / user.nextTierPoints) * 100));
  const remaining = user.nextTierPoints - user.points;
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('');

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#c5a880]/30 bg-linear-to-bl from-[#0b3c2e] to-[#062920] text-[#FEF8EB] shadow-xl">
      <div aria-hidden className="pointer-events-none absolute -inset-s-20 -top-24 h-72 w-72 rounded-full bg-[#c5a880]/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 inset-e-10 h-64 w-64 rounded-full bg-[#c5a880]/10 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-10 inset-s-4 select-none text-[9rem] font-black leading-none text-[#c5a880]/[0.07] sm:text-[12rem]">
        1919
      </span>

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-start">
          <div className="relative shrink-0">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-2 border-[#c5a880] bg-[#062920] text-3xl font-bold text-[#c5a880] shadow-[0_0_30px_rgba(197,168,128,0.35)]">
              {avatar ? (
                <Image src={avatar} alt={`صورة ${user.name}`} width={112} height={112} unoptimized className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="تغيير الصورة الشخصية"
              className="absolute -bottom-1 inset-e-0 grid h-9 w-9 place-items-center rounded-full bg-[#c5a880] text-[#062920] shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Camera size={18} />
            </button>
            <input
              ref={fileRef} type="file" accept="image/*" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onAvatar(f); }}
            />
          </div>

          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-extrabold sm:text-3xl">{user.name}</h1>
            <ul className="space-y-1 text-sm text-[#FEF8EB]/80">
              <li className="flex items-center justify-center gap-2 sm:justify-start"><Mail size={15} className="text-[#c5a880]" />{user.email}</li>
              <li className="flex items-center justify-center gap-2 sm:justify-start"><Phone size={15} className="text-[#c5a880]" /><span dir="ltr">{user.phone}</span></li>
              <li className="flex items-center justify-center gap-2 sm:justify-start"><CalendarDays size={15} className="text-[#c5a880]" />عضو منذ {user.joined}</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-[#c5a880]/40 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c5a880] px-3 py-1 text-sm font-bold text-[#062920]">
              <Crown size={16} />
              {user.tier}
            </span>
            <p className="text-end">
              <span className="text-2xl font-extrabold text-[#c5a880]">{user.points.toLocaleString('ar-SA')}</span>
              <span className="ms-1 text-sm text-[#FEF8EB]/70">نقطة</span>
            </p>
          </div>
          <div
            role="progressbar" aria-valuemin={0} aria-valuemax={user.nextTierPoints} aria-valuenow={user.points}
            aria-label="التقدم نحو المستوى التالي"
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/15"
          >
            <div className="h-full rounded-full bg-linear-to-l from-[#c5a880] to-[#e8d5b0] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2.5 text-sm text-[#FEF8EB]/80">
            تبقّى {remaining.toLocaleString('ar-SA')} نقطة للوصول إلى {user.nextTier}
          </p>
        </div>
      </div>
    </section>
  );
}

function OrdersTab({ orders, onReorder }: { orders: Order[]; onReorder: (o: Order) => void }) {
  const [selected, setSelected] = useState<Order | null>(null);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c5a880]/50 p-10 text-center">
        <p className="mb-4 text-[#062920]/70">لم تقم بأي طلب بعد.</p>
        <Link href="/menu" className={btnPrimary}>تصفح الحلويات</Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="rounded-2xl border border-[#c5a880]/30 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#0b3c2e]">طلب <span dir="ltr">#{o.id}</span></p>
                <p className="text-sm text-[#062920]/60">{o.date}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#c5a880]/20 pt-4">
              <p className="text-lg font-extrabold text-[#0b3c2e]">{fmt(o.total)}</p>
              <div className="flex gap-2">
                <button className={btnGhost} onClick={() => setSelected(o)}><Eye size={16} />التفاصيل</button>
                <button className={btnPrimary + ' px-4! py-2.5! text-sm'} onClick={() => onReorder(o)}><RotateCcw size={16} />إعادة الطلب</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {selected && (
        <Modal title={`تفاصيل الطلب #${selected.id}`} onClose={() => setSelected(null)}>
          <ul className="divide-y divide-[#c5a880]/20">
            {selected.items.map((it) => (
              <li key={it.name} className="flex items-center justify-between gap-4 py-3">
                <span className="text-[#062920]">{it.name} <span className="text-[#062920]/50">× {it.qty}</span></span>
                <span className="font-semibold text-[#0b3c2e]">{fmt(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FEF8EB] px-4 py-3">
            <span className="font-semibold text-[#0b3c2e]">الإجمالي</span>
            <span className="text-lg font-extrabold text-[#0b3c2e]">{fmt(selected.total)}</span>
          </div>
        </Modal>
      )}
    </>
  );
}

const ADDR_ICON = { home: Home, work: Briefcase, other: MapPin } as const;

function AddressesTab({ addresses, notify }: { addresses: Address[]; notify: (t: ToastState) => void }) {
  const [list, setList] = useState<Address[]>(addresses);
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<Address | null>(null);

  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      label: String(f.get('label')).trim(),
      city: String(f.get('city')).trim(),
      street: String(f.get('street')).trim(),
      phone: String(f.get('phone')).trim(),
      isDefault: f.get('isDefault') === 'on',
    };
    if (!data.label || !data.city || !data.street) {
      notify({ type: 'error', message: 'أكمل الاسم والمدينة والعنوان لحفظ العنوان' });
      return;
    }
    setList((prev) => {
      const base = data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      if (editing === 'new') {
        return [...base, { id: crypto.randomUUID(), icon: 'other', ...data, isDefault: data.isDefault || base.length === 0 }];
      }
      return base.map((a) => (a.id === (editing as Address).id ? { ...a, ...data } : a));
    });
    notify({ type: 'success', message: editing === 'new' ? 'تمت إضافة العنوان' : 'تم تحديث العنوان' });
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setList((prev) => {
      const rest = prev.filter((a) => a.id !== toDelete.id);
      if (toDelete.isDefault && rest[0]) rest[0] = { ...rest[0], isDefault: true };
      return rest;
    });
    notify({ type: 'success', message: 'تم حذف العنوان' });
    setToDelete(null);
  };

  const current = editing && editing !== 'new' ? editing : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((a) => {
          const Icon = ADDR_ICON[a.icon] || MapPin;
          return (
            <article key={a.id} className="flex flex-col rounded-2xl border border-[#c5a880]/30 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-[#0b3c2e]">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0b3c2e] text-[#c5a880]"><Icon size={17} /></span>
                  {a.label}
                </h3>
                {a.isDefault && <span className="rounded-full bg-[#c5a880]/25 px-3 py-1 text-xs font-bold text-[#0b3c2e]">الافتراضي</span>}
              </div>
              <p className="text-[#062920]">{a.city}</p>
              <p className="text-sm text-[#062920]/70">{a.street}</p>
              <p className="mt-1 text-sm text-[#062920]/70" dir="ltr" style={{ textAlign: 'right' }}>{a.phone}</p>
              <div className="mt-4 flex gap-2 border-t border-[#c5a880]/20 pt-4">
                <button className={btnGhost} onClick={() => setEditing(a)}><Pencil size={15} />تعديل</button>
                <button className={btnGhost + ' text-rose-700! hover:bg-rose-50!'} onClick={() => setToDelete(a)}><Trash2 size={15} />حذف</button>
              </div>
            </article>
          );
        })}

        <button
          onClick={() => setEditing('new')}
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c5a880]/60 text-[#0b3c2e] transition hover:bg-[#c5a880]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
        >
          <Plus size={26} />
          <span className="font-semibold">إضافة عنوان جديد</span>
        </button>
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'إضافة عنوان جديد' : 'تعديل العنوان'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <Field label="اسم العنوان"><input name="label" defaultValue={current?.label} placeholder="المنزل، العمل…" className={inputCls} /></Field>
            <Field label="المدينة"><input name="city" defaultValue={current?.city} className={inputCls} /></Field>
            <Field label="العنوان بالتفصيل"><input name="street" defaultValue={current?.street} placeholder="الحي، الشارع، رقم المبنى" className={inputCls} /></Field>
            <Field label="رقم الجوال"><input name="phone" type="tel" dir="ltr" defaultValue={current?.phone} className={inputCls + ' text-right'} /></Field>
            <label className="flex items-center gap-3 text-sm font-semibold text-[#0b3c2e]">
              <input type="checkbox" name="isDefault" defaultChecked={current?.isDefault} className="h-5 w-5 accent-[#0b3c2e]" />
              اجعله عنوان التوصيل الافتراضي
            </label>
            <button type="submit" className={btnPrimary + ' w-full'}>{editing === 'new' ? 'إضافة العنوان' : 'حفظ التعديلات'}</button>
          </form>
        </Modal>
      )}

      {toDelete && (
        <Modal title="حذف العنوان" onClose={() => setToDelete(null)}>
          <p className="mb-5 text-[#062920]">سيتم حذف عنوان «{toDelete.label}» نهائيًا. هل تريد المتابعة؟</p>
          <div className="flex gap-3">
            <button className={btnPrimary + ' flex-1 bg-rose-700! hover:bg-rose-800!'} onClick={confirmDelete}>حذف العنوان</button>
            <button className={btnGhost + ' flex-1'} onClick={() => setToDelete(null)}>إلغاء</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function AccountTab({ user, onUpdateUser, notify }: { user: UserData; onUpdateUser: (updated: Partial<UserData>) => void; notify: (t: ToastState) => void }) {
  const [info, setInfo] = useState({ name: user.name, email: user.email, phone: user.phone, birthday: user.birthday });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingPw, setIsSubmittingPw] = useState(false);

  const saveInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(info.email)) {
      notify({ type: 'error', message: 'صيغة البريد الإلكتروني غير صحيحة' });
      return;
    }

    setIsSubmittingInfo(true);
    try {
      const res = await updateProfile({ name: info.name, phone: info.phone });
      if (res.error) {
        notify({ type: 'error', message: res.error });
      } else {
        notify({ type: 'success', message: res.success || 'تم تحديث بياناتك بنجاح' });
        onUpdateUser({ name: info.name, phone: info.phone });
      }
    } catch {
      notify({ type: 'error', message: 'حدث خطأ غير متوقع' });
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) return notify({ type: 'error', message: 'كلمة المرور الجديدة يجب أن تتكون من 8 أحرف على الأقل' });
    if (pw.next !== pw.confirm) return notify({ type: 'error', message: 'كلمتا المرور غير متطابقتين' });

    setIsSubmittingPw(true);
    try {
      const res = await updatePassword({ currentPassword: pw.current, newPassword: pw.next });
      if (res.error) {
        notify({ type: 'error', message: res.error });
      } else {
        notify({ type: 'success', message: res.success || 'تم تغيير كلمة المرور' });
        setPw({ current: '', next: '', confirm: '' });
      }
    } catch {
      notify({ type: 'error', message: 'حدث خطأ غير متوقع' });
    } finally {
      setIsSubmittingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={saveInfo} className="rounded-2xl border border-[#c5a880]/30 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-5 text-lg font-bold text-[#0b3c2e]">البيانات الشخصية</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم الكامل" icon={<UserRound size={16} className="text-[#c5a880]" />}>
            <input className={inputCls} value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} required />
          </Field>
          <Field label="البريد الإلكتروني" icon={<Mail size={16} className="text-[#c5a880]" />}>
            <input type="email" dir="ltr" className={inputCls + ' text-right'} value={info.email} disabled title="لا يمكن تعديل البريد الإلكتروني" />
          </Field>
          <Field label="رقم الجوال" icon={<Phone size={16} className="text-[#c5a880]" />}>
            <input type="tel" dir="ltr" className={inputCls + ' text-right'} value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} required />
          </Field>
          <Field label="تاريخ الميلاد" icon={<Gift size={16} className="text-[#c5a880]" />}>
            <input type="date" className={inputCls} value={info.birthday} onChange={(e) => setInfo({ ...info, birthday: e.target.value })} />
          </Field>
        </div>
        <p className="mt-3 text-sm text-[#062920]/60">نستخدم تاريخ ميلادك لإرسال خصم خاص في شهر ميلادك.</p>
        <button type="submit" disabled={isSubmittingInfo} className={btnPrimary + ' mt-5'}>
          {isSubmittingInfo ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>

      <form onSubmit={savePassword} className="rounded-2xl border border-[#c5a880]/30 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#0b3c2e]"><Lock size={18} className="text-[#c5a880]" />الأمان وكلمة المرور</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="كلمة المرور الحالية">
            <input type="password" autoComplete="current-password" className={inputCls} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          </Field>
          <Field label="كلمة المرور الجديدة">
            <input type="password" autoComplete="new-password" className={inputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          </Field>
          <Field label="تأكيد كلمة المرور">
            <input type="password" autoComplete="new-password" className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
          </Field>
        </div>
        <button type="submit" disabled={isSubmittingPw} className={btnPrimary + ' mt-5'}>
          {isSubmittingPw ? 'جارٍ التغيير...' : 'تغيير كلمة المرور'}
        </button>
      </form>
    </div>
  );
}

function WishlistTab({ wishlist, notify }: { wishlist: Product[]; notify: (t: ToastState) => void }) {
  const [items, setItems] = useState<Product[]>(wishlist);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c5a880]/50 p-10 text-center">
        <p className="mb-4 text-[#062920]/70">قائمة المفضلة فارغة. اضغط على القلب في أي منتج لحفظه هنا.</p>
        <Link href="/menu" className={btnPrimary}>تصفح الحلويات</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => (
        <article key={p.id} className="group overflow-hidden rounded-2xl border border-[#c5a880]/30 bg-white shadow-sm">
          <div className="relative aspect-4/3 bg-[#FEF8EB]">
            <Image src={p.image} alt={p.name} fill sizes="(min-width:1280px) 25vw, (min-width:480px) 40vw, 90vw" className="object-cover" />
            <button
              onClick={() => { setItems((s) => s.filter((x) => x.id !== p.id)); notify({ type: 'success', message: 'تمت الإزالة من المفضلة' }); }}
              aria-label={`إزالة ${p.name} من المفضلة`}
              className="absolute inset-e-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-rose-600 shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
            >
              <Heart size={18} fill="currentColor" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-[#0b3c2e]">{p.name}</h3>
            <p className="text-sm text-[#062920]/60">{p.note}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-extrabold text-[#0b3c2e]">{fmt(p.price)}</span>
              <button
                onClick={() => notify({ type: 'success', message: `أُضيف «${p.name}» إلى السلة` })}
                className={btnPrimary + ' px-4! py-2! text-sm'}
              >
                <ShoppingBag size={15} />أضف للسلة
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ProfileClient({
  initialUser,
  initialOrders,
  initialAddresses,
  initialWishlist
}: {
  initialUser: UserData;
  initialOrders: Order[];
  initialAddresses: Address[];
  initialWishlist: Product[];
}) {
  const [currentUser, setCurrentUser] = useState<UserData>(initialUser);
  const [tab, setTab] = useState<TabId>('orders');
  const [drawer, setDrawer] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => () => { if (avatar) URL.revokeObjectURL(avatar); }, [avatar]);

  const handleAvatar = (file: File) => {
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'اختر صورة بحجم أقل من 5 ميجابايت' });
      return;
    }
    setAvatar(URL.createObjectURL(file));
    setToast({ type: 'success', message: 'تم تحديث الصورة الشخصية' });
  };

  const handleReorder = (o: Order) =>
    setToast({ type: 'success', message: `أُضيفت منتجات الطلب #${o.id} إلى السلة` });

  const active = TABS.find((t) => t.id === tab)!;
  const choose = (id: TabId) => { setTab(id); setDrawer(false); };

  const nav = (
    <nav aria-label="أقسام الحساب" className="space-y-1.5">
      {TABS.map(({ id, label, icon: Icon }) => {
        const on = id === tab;
        return (
          <button
            key={id} onClick={() => choose(id)} aria-current={on ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-start font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880] ${on ? 'bg-[#0b3c2e] text-[#FEF8EB] shadow-md' : 'text-[#0b3c2e] hover:bg-[#c5a880]/15'
              }`}
          >
            <Icon size={19} className={on ? 'text-[#c5a880]' : ''} />
            {label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <main dir="rtl" lang="ar" className="min-h-screen bg-[#FEF8EB] font-['Cairo'] text-[#062920]">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0b3c2e] hover:underline">
          <ChevronLeft size={16} className="rotate-180" />
          العودة إلى المتجر
        </Link>

        <ProfileHeader user={currentUser} avatar={avatar} onAvatar={handleAvatar} />

        <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
          <aside className="hidden h-fit rounded-3xl border border-[#c5a880]/30 bg-white p-3 shadow-sm lg:block">{nav}</aside>

          <div className="lg:hidden">
            <button
              onClick={() => setDrawer(true)} aria-haspopup="dialog" aria-expanded={drawer}
              className="flex w-full items-center justify-between rounded-2xl border border-[#c5a880]/40 bg-white px-4 py-3.5 font-bold text-[#0b3c2e] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"
            >
              <span className="flex items-center gap-3"><active.icon size={19} className="text-[#c5a880]" />{active.label}</span>
              <Menu size={20} />
            </button>
          </div>

          <section aria-labelledby="tab-title" className="min-w-0 lg:col-start-2 lg:row-start-1">
            <h2 id="tab-title" className="mb-5 hidden text-2xl font-extrabold text-[#0b3c2e] lg:block">{active.label}</h2>
            {tab === 'orders' && <OrdersTab orders={initialOrders} onReorder={handleReorder} />}
            {tab === 'addresses' && <AddressesTab addresses={initialAddresses} notify={setToast} />}
            {tab === 'account' && <AccountTab user={currentUser} onUpdateUser={(upd) => setCurrentUser((prev) => ({ ...prev, ...upd }))} notify={setToast} />}
            {tab === 'wishlist' && <WishlistTab wishlist={initialWishlist} notify={setToast} />}
          </section>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="أقسام الحساب">
          <div className="absolute inset-0 bg-[#062920]/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 inset-s-0 w-72 max-w-[85%] border-e border-[#c5a880]/30 bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-extrabold text-[#0b3c2e]">حسابي</span>
              <button onClick={() => setDrawer(false)} aria-label="إغلاق القائمة" className="rounded-full p-2 hover:bg-[#c5a880]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a880]"><X size={20} /></button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <Toast toast={toast} onDone={() => setToast(null)} />
    </main>
  );
}