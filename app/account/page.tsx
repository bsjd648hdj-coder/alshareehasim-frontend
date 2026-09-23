"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";

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

const STATUS_STYLE: Record<string, { badge: string }> = {
  pending:          { badge: "bg-amber-50 text-amber-600 border-amber-200" },
  confirmed:        { badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  processing:       { badge: "bg-orange-50 text-orange-600 border-orange-100" },
  ready_to_ship:    { badge: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  shipped:          { badge: "bg-violet-50 text-violet-600 border-violet-100" },
  out_for_delivery: { badge: "bg-amber-50 text-amber-600 border-amber-100" },
  delivered:        { badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  cancelled:        { badge: "bg-red-50 text-red-500 border-red-100" },
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

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ sm }: { sm?: boolean }) {
  return (
    <span className={`border-2 border-[#0A1C29]/15 border-t-[#0A1C29] rounded-full animate-spin inline-block ${sm ? "w-4 h-4" : "w-6 h-6"}`} />
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
  const firstItem = order.items[0];
  const imgUrl = resolveImg(firstItem?.image);

  return (
    <Link
      href={`/account/orders/${order._id}`}
      className="block focus-visible:outline-none hover:bg-[#fafafa] transition-colors"
      aria-label={`طلب رقم ${order.orderId}`}
    >
      {/* الصف الأول: رقم الطلب + الصورة على الشمال */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400">رقم الطلب</span>
          <span className="text-[13px] font-bold text-[#0A1C29] font-mono" dir="ltr">#{order.orderId}</span>
        </div>
        <div className="w-[52px] h-[52px] rounded-lg bg-[#f4f5f7] border border-[#ebebeb] flex items-center justify-center shrink-0">
          {imgUrl ? (
            <Image src={imgUrl} alt={firstItem?.name ?? "منتج"} width={52} height={52}
              className="object-contain w-full h-full p-1.5" loading="lazy" unoptimized />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8ccd4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          )}
        </div>
      </div>

      <div className="mx-4 border-t border-[#f0f0f0]" />

      {/* الصف الثاني: السعر والتاريخ جنب بعض */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="text-[14px] font-black text-[#0A1C29] tabular-nums">
          {fmtMoney(order.total)}
          <span className="text-[11px] font-medium text-[#9a9fa8] mr-1">ر.س</span>
        </span>
        <span className="text-[11px] text-[#b0b5be]">{fmtDate(order.createdAt)}</span>
      </div>

      {/* الحالة + زرار عرض التفاصيل */}
      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${st.badge}`}>
          {STATUS_LABEL[order.status]}
        </span>
        <span className="text-[11px] font-semibold text-[#0A1C29] underline underline-offset-2">عرض التفاصيل</span>
      </div>
    </Link>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({
  label, value, ltr, bold,
}: {
  label: string; value: string; ltr?: boolean; bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-xs text-[#0A1C29] text-left ${bold ? "font-black" : "font-semibold"}`} dir={ltr ? "ltr" : undefined}>
        {value}
      </span>
    </div>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, ltr }: { label: string; value?: string; ltr?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
      <span className="text-sm font-semibold text-[#0A1C29]" dir={ltr ? "ltr" : undefined}>{value || "—"}</span>
    </div>
  );
}

// ─── Main Inner ───────────────────────────────────────────────────────────────

function AccountPageInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, setUser, logout, initialized } = useAuthStore();

  const defaultTab = searchParams.get("tab") === "orders" ? "orders" : "profile";
  const [tab, setTab] = useState<"profile" | "orders">(defaultTab as "profile" | "orders");

  const [editing,     setEditing]     = useState(false);
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [phone,       setPhone]       = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [orders,        setOrders]        = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError,   setOrdersError]   = useState("");
  const [ordersFetched, setOrdersFetched] = useState(false);

  useEffect(() => {
    if (initialized && !loading && !user) router.replace("/auth?redirect=/account");
  }, [initialized, loading, user, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName   || "");
      setPhone(user.phone         || "");
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await fetch("/api/account/orders");
      const data = await res.json();
      if (!res.ok) {
        setOrdersError(data.error || "حدث خطأ");
        return;
      }
      setOrders(data.orders || []);
    } catch {
      setOrdersError("حدث خطأ في تحميل الطلبات");
    } finally {
      setOrdersLoading(false);
      setOrdersFetched(true);
    }
  }, []);

  useEffect(() => {
    if (tab === "orders" && user && !ordersFetched && !ordersLoading) {
      fetchOrders();
    }
  }, [tab, user, ordersFetched, ordersLoading, fetchOrders]);

  const handleSave = async () => {
    setSaveError(""); setSaveSuccess(false); setSaving(true);
    try {
      const res  = await fetch("/api/account/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ firstName, lastName, phone }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error || "حدث خطأ، حاول مرة أخرى"); return; }
      setUser(data.user);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch { setSaveError("حدث خطأ، حاول مرة أخرى"); }
    finally   { setSaving(false); }
  };

  const handleLogout = async () => { await logout(); router.replace("/"); };

  if (!initialized || loading)
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!user) return null;

  const initials    = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "مستخدم";

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center px-3 sm:px-4 py-8 sm:py-12" dir="rtl">

      {/* ── Container ── max-w-[560px] مريح على موبايل وديسكتوب */}
      <div className="w-full max-w-[560px] space-y-3">

        {/* ── Hero ── */}
        <div className="bg-white border border-[#e8e8e8] rounded-sm px-5 py-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#0A1C29]/8 border border-[#e0e0e0] flex items-center justify-center text-base font-black text-[#0A1C29] shrink-0 select-none">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-black text-[#0A1C29] truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5" dir="ltr">{user.email}</p>
          </div>
        </div>

        {/* ── Tabs container ── */}
        <div className="bg-white border border-[#e8e8e8] rounded-sm overflow-hidden">

          {/* Tab headers */}
          <div className="flex border-b border-[#e8e8e8]">
            {(["profile", "orders"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-[#B5854A] text-[#0A1C29]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "profile" ? "بياناتي" : "طلباتي"}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5">

            {/* ── Profile ── */}
            {tab === "profile" && (
              <div className="space-y-5">
                {saveSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-sm">
                    <span className="text-green-500 text-base">✓</span> تم حفظ البيانات بنجاح
                  </div>
                )}
                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-sm">
                    {saveError}
                  </div>
                )}

                {!editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 p-4 bg-[#f7f8fa] border border-[#e8e8e8] rounded-sm">
                      <InfoRow label="الاسم الأول"  value={user.firstName} />
                      <InfoRow label="اسم العائلة" value={user.lastName} />
                    </div>
                    <div className="p-4 bg-[#f7f8fa] border border-[#e8e8e8] rounded-sm space-y-4">
                      <InfoRow label="البريد الإلكتروني" value={user.email}        ltr />
                      <InfoRow label="رقم الجوال"        value={user.phone || "—"} ltr />
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="w-full py-3 border border-[#0A1C29] text-sm font-semibold text-[#0A1C29] hover:bg-[#0A1C29] hover:text-white transition-colors rounded-sm"
                    >
                      تعديل البيانات
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { label: "الاسم الأول",  value: firstName, set: setFirstName, id: "fn" },
                        { label: "اسم العائلة", value: lastName,  set: setLastName,  id: "ln" },
                      ] as const).map(({ label, value, set, id }) => (
                        <div key={id} className="space-y-1.5">
                          <label htmlFor={`acc-${id}`} className="text-xs font-medium text-gray-500">{label}</label>
                          <input
                            id={`acc-${id}`}
                            value={value}
                            onChange={(e) => (set as (v: string) => void)(e.target.value)}
                            className="w-full px-3 py-2.5 border border-[#d9d9d9] text-sm rounded-sm focus:outline-none focus:border-[#B5854A] transition-colors bg-white"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500">البريد الإلكتروني</label>
                      <div className="w-full px-3 py-2.5 border border-[#e8e8e8] bg-[#f7f8fa] text-sm text-gray-400 rounded-sm select-none" dir="ltr">
                        {user.email}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="acc-phone" className="text-xs font-medium text-gray-500">رقم الجوال</label>
                      <input
                        id="acc-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        dir="ltr"
                        inputMode="tel"
                        className="w-full px-3 py-2.5 border border-[#d9d9d9] text-sm rounded-sm focus:outline-none focus:border-[#B5854A] transition-colors bg-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 bg-[#0A1C29] text-white text-sm font-semibold hover:bg-[#1a3a5c] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 rounded-sm"
                      >
                        {saving ? <Spinner sm /> : "حفظ التعديلات"}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false); setSaveError("");
                          setFirstName(user.firstName || "");
                          setLastName(user.lastName   || "");
                          setPhone(user.phone         || "");
                        }}
                        className="px-4 py-3 border border-[#d9d9d9] text-sm text-gray-600 hover:border-[#0A1C29] transition-colors rounded-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#f0f0f0]">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors rounded-sm"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}

            {/* ── Orders ── */}
            {tab === "orders" && (
              <div>
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#f0f0f0]">
                  <span className="text-xs font-bold text-gray-500">
                    {ordersFetched && !ordersLoading ? `إجمالي الطلبات (${orders.length})` : "الطلبات"}
                  </span>
                  <button
                    onClick={() => fetchOrders()}
                    disabled={ordersLoading}
                    className="flex items-center gap-1 text-xs font-bold text-[#B5854A] hover:text-[#0A1C29] transition-colors disabled:opacity-50"
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${ordersLoading ? "animate-spin" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>{ordersLoading ? "جاري التحديث..." : "تحديث"}</span>
                  </button>
                </div>

                {ordersLoading && (
                  <div className="flex justify-center py-14"><Spinner /></div>
                )}
                {ordersError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-sm mx-4 mb-3">
                    {ordersError}
                  </div>
                )}
                {!ordersLoading && !ordersError && ordersFetched && orders.length === 0 && (
                  <div className="text-center py-16 space-y-2">
                    <p className="text-4xl">🛍️</p>
                    <p className="text-sm font-bold text-[#0A1C29]">لا توجد طلبات حاليًا</p>
                    <p className="text-xs text-gray-400">طلباتك ستظهر هنا بعد إتمام الشراء</p>
                  </div>
                )}
                {orders.length > 0 && (
                  <div className="flex flex-col divide-y divide-[#f0f0f0]">
                    {orders.map((order) => (
                      <OrderCard key={order._id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="w-6 h-6 border-2 border-[#0A1C29]/15 border-t-[#0A1C29] rounded-full animate-spin inline-block" />
        </div>
      }
    >
      <AccountPageInner />
    </Suspense>
  );
}
