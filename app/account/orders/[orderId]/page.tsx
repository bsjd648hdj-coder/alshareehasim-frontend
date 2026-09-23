"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

function resolveImg(src?: string | null) {
  if (!src) return null;
  return src.startsWith("http") ? src : `${API}${src}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "pending" | "confirmed" | "processing" | "ready_to_ship"
  | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

type OrderItem = {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

type Order = {
  _id: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  statusHistory: { status: string; changedAt: string; changedBy: string }[];
  createdAt: string;
  updatedAt: string;
  installmentType?: "full" | "installment";
  months?: number;
  monthlyPayment?: number;
  downPayment?: number;
  customer?: string;
  whatsapp?: string;
  nationalId?: string;
  address?: string;
  shipping?: {
    companyName?: string;
    price?: number;
    isFree?: boolean;
    deliveryMinDays?: number;
    deliveryMaxDays?: number;
  };
  deliveryAddress?: { formattedAddress?: string };
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending:          "قيد المعالجة",
  confirmed:        "مؤكد",
  processing:       "جاري التجهيز",
  ready_to_ship:    "جاهز للشحن",
  shipped:          "تم الشحن",
  out_for_delivery: "خرج للتسليم",
  delivered:        "تم التسليم",
  cancelled:        "ملغي",
};

const STATUS_STYLE: Record<string, { badge: string; dot: string }> = {
  pending:          { badge: "bg-blue-50 text-blue-600 border-blue-200",     dot: "bg-blue-500" },
  confirmed:        { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
  processing:       { badge: "bg-orange-50 text-orange-600 border-orange-200",   dot: "bg-orange-500" },
  ready_to_ship:    { badge: "bg-indigo-50 text-indigo-600 border-indigo-200",   dot: "bg-indigo-500" },
  shipped:          { badge: "bg-violet-50 text-violet-600 border-violet-200",   dot: "bg-violet-500" },
  out_for_delivery: { badge: "bg-amber-50 text-amber-600 border-amber-200",      dot: "bg-amber-500" },
  delivered:        { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-600" },
  cancelled:        { badge: "bg-red-50 text-red-500 border-red-200",            dot: "bg-red-500" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function fmtMoney(n: number) {
  return n.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({ label, value, ltr, bold }: { label: string; value: string; ltr?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm text-[#0A1C29] text-left ${bold ? "font-black" : "font-semibold"}`} dir={ltr ? "ltr" : undefined}>
        {value}
      </span>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-sm">
        {children}
      </div>
    </section>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <span className="w-8 h-8 border-2 border-[#0A1C29]/15 border-t-[#0A1C29] rounded-full animate-spin inline-block" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/account/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.replace(`/auth?redirect=/account/orders/${orderId}`);
            return;
          }
          setError(data.error || "حدث خطأ");
          return;
        }
        setOrder(data.order || data);
      } catch {
        setError("حدث خطأ في تحميل الطلب");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId, router]);

  if (loading) return <Spinner />;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center gap-4 px-4" dir="rtl">
        <p className="text-4xl">⚠️</p>
        <p className="text-base font-bold text-[#0A1C29]">{error || "الطلب غير موجود"}</p>
        <Link href="/account?tab=orders" className="text-sm text-[#B5854A] font-semibold underline underline-offset-2">
          العودة لطلباتي
        </Link>
      </div>
    );
  }

  const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
  const shippingPrice = order.shipping?.price ?? 0;
  const isFree = order.shipping?.isFree || shippingPrice === 0;
  const isInstallment = order.installmentType === "installment";
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f5f5f5]" dir="rtl">

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors text-[#0A1C29]"
            aria-label="رجوع"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-black text-[#0A1C29] leading-none">تفاصيل الطلب</p>
            <p className="text-xs text-gray-400 mt-0.5 font-mono" dir="ltr">#{order.orderId}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border rounded-full ${st.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {STATUS_LABEL[order.status]}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── Hero card ── */}
        <div className="bg-[#0A1C29] rounded-2xl px-5 py-4 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-white/50 mb-1">الإجمالي</p>
            <p className="text-2xl font-black text-[#B5854A] tabular-nums" dir="ltr">
              {fmtMoney(order.total)}
              <span className="text-sm font-semibold text-white/60 mr-1">SAR</span>
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-white/50 mb-1">تاريخ الطلب</p>
            <p className="text-sm font-semibold text-white">{fmtDate(order.createdAt)}</p>
          </div>
        </div>

        {/* ── بيانات العميل ── */}
        {(order.customer || order.whatsapp || order.nationalId) && (
          <Section title="بيانات العميل">
            <div className="divide-y divide-[#f0f0f0]">
              {order.customer   && <Row label="الاسم"       value={order.customer} />}
              {order.whatsapp   && <Row label="واتساب"      value={order.whatsapp} ltr />}
              {order.nationalId && <Row label="رقم الهوية"  value={order.nationalId} ltr />}
            </div>
          </Section>
        )}

        {/* ── المنتجات ── */}
        <Section title="المنتجات">
          <div className="divide-y divide-[#f0f0f0]">
            {order.items.map((item, i) => {
              const imgUrl = resolveImg(item.image);
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-[#f5f5f5] border border-[#ebebeb] flex items-center justify-center">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={item.name} width={56} height={56} className="object-contain w-full h-full p-1" loading="lazy" />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0A1C29] leading-snug">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {fmtMoney(item.price)} ر.س{item.quantity > 1 && ` × ${item.quantity}`}
                    </p>
                  </div>
                  <p className="text-sm font-black text-[#0A1C29] shrink-0 tabular-nums" dir="ltr">
                    {fmtMoney(item.price * item.quantity)}
                    <span className="text-[10px] font-normal text-gray-400 mr-0.5"> ر.س</span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* الإجماليات */}
          <div className="border-t border-[#f0f0f0] divide-y divide-[#f0f0f0]">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">المجموع الفرعي</span>
              <span className="text-sm font-semibold text-[#0A1C29]">{fmtMoney(subtotal)} ر.س</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">الشحن</span>
              <span className={`text-sm font-semibold ${isFree ? "text-emerald-600" : "text-[#0A1C29]"}`}>
                {isFree ? "مجاني 🎉" : `${fmtMoney(shippingPrice)} ر.س`}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#f8f9fa] rounded-b-2xl">
              <span className="text-sm font-bold text-[#0A1C29]">الإجمالي</span>
              <span className="text-base font-black text-[#0A1C29] tabular-nums" dir="ltr">
                {fmtMoney(order.total)}
                <span className="text-xs font-semibold text-gray-400 mr-1">SAR</span>
              </span>
            </div>
          </div>
        </Section>

        {/* ── طريقة الدفع ── */}
        <Section title="طريقة الدفع">
          <div className="divide-y divide-[#f0f0f0]">
            <Row label="نوع الدفع" value={isInstallment ? "تقسيط" : "دفع كامل"} />
            {isInstallment && (
              <>
                <Row label="الدفعة الأولى"  value={`${fmtMoney(order.downPayment ?? 0)} ر.س`} ltr />
                <Row label="عدد الأقساط"    value={`${order.months} شهر`} />
                <Row label="القسط الشهري"   value={`${fmtMoney(order.monthlyPayment ?? 0)} ر.س`} ltr />
              </>
            )}
            <Row label="الإجمالي المدفوع" value={`${fmtMoney(order.total)} SAR`} ltr bold />
          </div>
        </Section>

        {/* ── التوصيل ── */}
        {(order.shipping?.companyName || order.deliveryAddress?.formattedAddress || order.address) && (
          <Section title="التوصيل">
            <div className="divide-y divide-[#f0f0f0]">
              {order.shipping?.companyName && <Row label="شركة الشحن" value={order.shipping.companyName} />}
              {order.shipping?.deliveryMinDays != null && (
                <Row
                  label="مدة التوصيل"
                  value={
                    order.shipping.deliveryMinDays === order.shipping.deliveryMaxDays
                      ? `${order.shipping.deliveryMinDays} أيام`
                      : `${order.shipping.deliveryMinDays}–${order.shipping.deliveryMaxDays} أيام`
                  }
                />
              )}
              {(order.deliveryAddress?.formattedAddress || order.address) && (
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">عنوان التوصيل</p>
                  <p className="text-sm font-semibold text-[#0A1C29] leading-relaxed">
                    {order.deliveryAddress?.formattedAddress || order.address}
                  </p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── سجل الحالة ── */}
        {order.statusHistory?.length > 0 && (
          <Section title="سجل الحالة">
            <div className="px-4 py-3 space-y-3">
              {[...order.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 shrink-0 w-2 h-2 rounded-full bg-[#B5854A]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0A1C29]">{STATUS_LABEL[h.status] ?? h.status}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(h.changedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── زر الرجوع ── */}
        <Link
          href="/account?tab=orders"
          className="flex items-center justify-center gap-2 w-full py-3.5 border border-[#0A1C29] text-sm font-semibold text-[#0A1C29] hover:bg-[#0A1C29] hover:text-white transition-colors rounded-2xl"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          العودة لطلباتي
        </Link>

        <div className="pb-4" />
      </div>
    </div>
  );
}
