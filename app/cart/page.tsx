"use client";

import { useRef, useEffect, useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Home, Truck, Lock, MessageCircle, BadgeCheck, ShieldCheck, Zap, Package, User, Phone, MapPin, IdCard, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import type { CustomerInfo } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import CartItem from "./components/CartItem";
import AnimatedBackground from "../components/AnimatedBackground";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, totalPrice, totalItems, setCustomer, clear } = useCartStore();
  const { user, initialized } = useAuthStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const scrolled = useRef(false);

  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [finalOrderTotal, setFinalOrderTotal] = useState(0);
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (!scrolled.current) { scrolled.current = true; window.scrollTo(0, 0); } }, []);

  const total = mounted ? totalPrice() : 0;
  const count = mounted ? totalItems() : 0;

  const handleOrder = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "الاسم مطلوب";
    if (!nationalId.trim()) e.nationalId = "رقم الهوية مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim())) e.nationalId = "هوية سعودية: 10 أرقام تبدأ بـ 1 أو 2";
    if (!whatsapp.trim()) e.whatsapp = "رقم الواتساب مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) e.whatsapp = "يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!address.trim()) e.address = "العنوان مطلوب";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "cash_on_delivery",
          items: items.map(i => ({ productId: i.product._id, name: i.product.name, price: i.product.salePrice ?? i.product.originalPrice, quantity: i.qty })),
          total,
          customer: name,
          whatsapp,
          nationalId,
          address,
        }),
      });
    } catch { /* silent */ }
    setLoading(false);
    setCustomer({ name, nationalId, whatsapp, address, installmentType: "full", months: 0, downPayment: 0 });
    setFinalOrderTotal(total);
    clear();
    setShowModal(false);
    setShowPopup(true);
  };

  if (!mounted) return null;

  if (items.length === 0 && !showPopup)
    return (
      <>
        <AnimatedBackground />
        <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 px-4 text-center" dir="rtl">
          <ShoppingBag className="w-16 h-16 text-[#0A1C29]/20" strokeWidth={1.5} />
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-[#0A1C29]">السلة فارغة</h2>
            <p className="text-[#0A1C29]/40 text-sm">لم تضف أي منتجات بعد</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
            style={{ background: "#B5854A" }}
          >
            تصفح المنتجات
          </button>
        </main>
      </>
    );

  return (
    <div className="min-h-[100dvh] bg-white" dir="rtl">
      <AnimatedBackground />

      {/* Redirect Loading Overlay */}
      {redirecting && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-7 px-4 bg-white">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0A1C29]" style={{ animation: "spin 0.85s linear infinite" }} />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-[#0A1C29] font-black text-sm sm:text-base">جاري الانتقال للطلب</p>
            <p className="text-gray-400 text-xs sm:text-sm">يرجى الانتظار...</p>
          </div>
          <p className="text-[10px] text-gray-300 flex items-center gap-1"><Lock size={9} /> اتصال مشفّر وآمن · PCI DSS</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Success Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => { setShowPopup(false); router.replace("/"); }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "#ffffff" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #B5854A, #C8A375, #B5854A)" }} />
            <div className="p-6 sm:p-8 text-center" dir="rtl">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #FEFEFE, #f5e6d3)" }}>
                <BadgeCheck className="w-8 h-8 text-[#B5854A]" />
              </div>
              <h2 className="text-xl font-black text-[#0A1C29] mb-1">تم استلام طلبك! 🎉</h2>
              <p className="text-[#B5854A] font-bold text-sm mb-4">سيتم التواصل معك قريباً</p>
              <div className="rounded-2xl border border-[#C8A375]/40 p-4 mb-4 text-right space-y-2" style={{ background: "#FEFEFE" }}>
                <div className="flex justify-between text-xs">
                  <span className="text-[#0A1C29]/50">الاسم</span>
                  <span className="font-bold text-[#0A1C29]">{name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#0A1C29]/50">واتساب</span>
                  <span className="font-bold text-[#0A1C29]" dir="ltr">{whatsapp}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#0A1C29]/50">العنوان</span>
                  <span className="font-bold text-[#0A1C29] text-left max-w-[60%]">{address}</span>
                </div>
                <div className="border-t border-[#C8A375]/30 pt-2 flex justify-between items-center">
                  <span className="text-[#0A1C29]/50 text-xs">الإجمالي</span>
                  <span className="text-lg font-black text-[#B5854A]">{fmt(finalOrderTotal)} <span className="text-xs font-medium text-[#0A1C29]/40"><img src="/money-icon.webp" alt="ر.س" className="inline w-7 h-7 object-contain align-middle" /></span></span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-[#C8A375]/40 px-4 py-3 mb-4" style={{ background: "#FEFEFE" }}>
                <Truck className="w-4 h-4 text-[#B5854A]" />
                <span className="text-sm font-bold text-[#0A1C29]">الدفع عند الاستلام</span>
              </div>
              <p className="text-[#0A1C29]/50 text-xs mb-5">سيتصل بك فريقنا على رقم واتساب المسجل لتأكيد الطلب وتحديد موعد التوصيل</p>
              <button
                onClick={() => { setShowPopup(false); router.replace("/"); }}
                className="w-full py-3.5 rounded-xl text-white font-black text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #B5854A 0%, #C8A375 100%)" }}
              >
                حسناً، شكراً! ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "#ffffff" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #B5854A, #C8A375, #B5854A)" }} />
            <div className="px-5 py-4 border-b border-[#C8A375]/30 flex items-center gap-3" style={{ background: "#FEFEFE" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#B5854A]">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0A1C29]">معلوماتك الشخصية</h3>
                <p className="text-[10px] text-[#0A1C29]/50 mt-0.5">الاسم والهوية والتواصل والعنوان</p>
              </div>
            </div>
            <div className="p-5 space-y-4" dir="rtl">
              <div className="grid grid-cols-1 gap-4">
                <Field fieldName="name" label="الاسم الكامل" icon={<User size={14} />} value={name} error={errors.name} placeholder="محمد أحمد العلي"
                  onChange={(v) => { setName(v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "")); setErrors(p => ({ ...p, name: "" })); }} />
                <Field fieldName="nationalId" label="رقم الهوية / الإقامة" icon={<IdCard size={14} />} value={nationalId} error={errors.nationalId} placeholder="1XXXXXXXXX" maxLength={10} inputMode="numeric"
                  onChange={(v) => { setNationalId(v.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, nationalId: "" })); }} />
                <Field fieldName="whatsapp" label="رقم الواتساب" icon={<Phone size={14} />} value={whatsapp} error={errors.whatsapp} placeholder="05XXXXXXXX" maxLength={10} dir="ltr" inputMode="numeric"
                  onChange={(v) => { setWhatsapp(v.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, whatsapp: "" })); }} />
                <Field fieldName="address" label="عنوان التوصيل" icon={<MapPin size={14} />} value={address} error={errors.address} placeholder="المدينة - الحي - الشارع"
                  onChange={(v) => { setAddress(v); setErrors(p => ({ ...p, address: "" })); }} />
              </div>
              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #B5854A 0%, #C8A375 100%)" }}
              >
                {loading ? "جاري المعالجة..." : "تأكيد الدفع عند الاستلام"}
                {!loading && <ArrowLeft size={16} />}
              </button>
              <p className="text-center text-[10px] text-[#0A1C29]/40 flex items-center justify-center gap-1">
                <Lock size={10} /> بياناتك محمية ومشفرة بالكامل
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#C8A375]/30" style={{ background: "rgba(255,255,255,0.95)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#0A1C29]/60 hover:text-[#0A1C29] transition text-sm font-bold">
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">رجوع</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#B5854A]" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#B5854A] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {count}
              </span>
            </div>
            <span className="text-base font-black text-[#0A1C29]">السلة</span>
          </div>

          <Link href="/" className="w-9 h-9 rounded-xl border border-[#C8A375]/40 hover:border-[#B5854A] flex items-center justify-center transition" style={{ background: "#FEFEFE" }}>
            <Home className="w-4 h-4 text-[#B5854A]" />
          </Link>
        </div>
      </header>

      {/* BODY */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-white">

        {/* Summary Bar */}
        <div className="rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 relative overflow-hidden border border-[#C8A375]/40" style={{ background: "linear-gradient(135deg, #FEFEFE 0%, #f5e6d3 100%)" }}>
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle, #B5854A 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex flex-row items-center justify-between gap-2">
            <div>
              <p className="text-[#0A1C29]/50 text-xs mb-1">إجمالي الطلب</p>
              <p className="text-3xl sm:text-4xl font-black text-[#B5854A]">
                {fmt(total)} <span className="text-sm font-medium text-[#0A1C29]/40"><img src="/money-icon.webp" alt="ر.س" className="inline w-7 h-7 object-contain align-middle" /></span>
              </p>
            </div>
            <div className="flex gap-3 sm:gap-6">
              <MiniStat icon={<ShieldCheck size={14} />} label="ضمان" value="سنتين" />
              <MiniStat icon={<Zap size={14} />} label="توصيل" value="مجاني" />
              <MiniStat icon={<Package size={14} />} label="منتجات" value={`${count}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* RIGHT: Products */}
          <div className="lg:col-span-8 space-y-6">

            {/* Products */}
            <section>
              <SectionHeader title="المنتجات" badge={`${count} منتج`} />
              <div className="space-y-3 mt-4">
                {items.map(({ product, qty }) => (
                  <CartItem key={product._id} product={product} qty={qty} onUpdateQty={updateQty} onRemove={removeItem} />
                ))}
              </div>
            </section>

            {/* Mobile Summary */}
            <section className="lg:hidden">
              <SectionHeader title="ملخص الطلب" />
              <div className="mt-3">
                <OrderSummaryMobile items={items} total={total} />
              </div>
            </section>

            {/* Guest Notice */}
            {initialized && !user && (
              <div className="border border-[#C8A375]/50 bg-[#fdf8f2] px-4 py-3.5" dir="rtl">
                <div className="flex gap-3 items-start">
                  <span className="text-[#B5854A] mt-0.5 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>
                  <div className="space-y-2.5 flex-1">
                    <p className="text-xs text-[#0A1C29]/70 leading-relaxed">
                      لتتمكن من متابعة طلبك وتفاصيله بسهولة بعد إتمام الدفع، ننصحك بتسجيل الدخول أو إنشاء حساب — وهو اختياري تمامًا.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href="/auth?redirect=/cart"
                        className="text-xs font-bold text-[#0A1C29] border border-[#0A1C29]/30 px-3 py-1.5 hover:border-[#0A1C29] transition-colors"
                        style={{ borderRadius: 0 }}
                      >
                        تسجيل الدخول
                      </Link>
                      <Link
                        href="/auth?tab=register&redirect=/cart"
                        className="text-xs font-bold text-[#B5854A] border border-[#B5854A]/40 px-3 py-1.5 hover:border-[#B5854A] transition-colors"
                        style={{ borderRadius: 0 }}
                      >
                        إنشاء حساب
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => {
                setRedirecting(true);
                setTimeout(() => router.push("/checkout"), 3000);
              }}
              disabled={redirecting}
              className="w-full py-4 rounded-xl text-white font-black text-base transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-90"
              style={{ background: "linear-gradient(135deg, #B5854A 0%, #C8A375 100%)" }}
            >
              {redirecting ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  جاري التحميل...
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  إتمام الطلب
                </>
              )}
            </button>
          </div>

          {/* LEFT: Sticky Summary (desktop) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-[#C8A375]/40 overflow-hidden" style={{ background: "#ffffff" }}>
                <div className="px-5 py-4 border-b border-[#C8A375]/30" style={{ background: "#FEFEFE" }}>
                  <h3 className="text-sm font-black text-[#0A1C29]">ملخص الطلب</h3>
                </div>
                <div className="p-5 space-y-3">
                  {items.map(({ product, qty }) => {
                    const price = product.salePrice ?? product.originalPrice ?? product.price;
                    return (
                      <div key={product._id} className="flex justify-between items-start gap-2">
                        <p className="text-xs text-[#0A1C29]/60 leading-relaxed line-clamp-1 flex-1">{product.name} <span className="text-[#0A1C29]/30">×{qty}</span></p>
                        <span className="text-xs font-bold text-[#0A1C29] whitespace-nowrap">{fmt(price * qty)} <img src="/money-icon.webp" alt="ر.س" className="inline w-6 h-6 object-contain align-middle" /></span>
                      </div>
                    );
                  })}
                  <div className="border-t border-dashed border-[#C8A375]/40 pt-3 flex justify-between text-xs">
                    <span className="text-[#0A1C29]/50 flex items-center gap-1.5"><Truck size={12} /> التوصيل</span>
                    <span className="font-bold text-[#B5854A]">مجاني ✓</span>
                  </div>
                  <div className="border-t border-[#C8A375]/30 pt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-[#0A1C29]/60">الإجمالي</span>
                    <span className="text-2xl font-black text-[#B5854A]">{fmt(total)} <span className="text-xs font-medium text-[#0A1C29]/40"><img src="/money-icon.webp" alt="ر.س" className="inline w-7 h-7 object-contain align-middle" /></span></span>
                  </div>
                </div>
              </div>

              {/* Trust */}
              <div className="rounded-2xl border border-[#C8A375]/40 p-4 grid grid-cols-2 gap-2" style={{ background: "#ffffff" }}>
                <TrustBadge icon={<Lock size={13} />} text="دفع آمن" />
                <TrustBadge icon={<Truck size={13} />} text="شحن سريع" />
                <TrustBadge icon={<BadgeCheck size={13} />} text="ضمان رسمي" />
                <TrustBadge icon={<MessageCircle size={13} />} text="دعم واتساب" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-1 h-5 rounded-full bg-[#B5854A]" />
      <h2 className="text-sm sm:text-base font-black text-[#0A1C29]">{title}</h2>
      {badge && <span className="text-[10px] font-bold text-[#B5854A] bg-[#B5854A]/10 border border-[#B5854A]/20 px-2 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#B5854A]/30 flex items-center justify-center mx-auto mb-0.5 text-[#B5854A]" style={{ background: "rgba(181,133,74,0.15)" }}>{icon}</div>
      <p className="text-[#0A1C29]/50 text-[8px] sm:text-[9px]">{label}</p>
      <p className="text-[#0A1C29] text-[10px] sm:text-[11px] font-bold">{value}</p>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#C8A375]/40 px-3 py-2.5" style={{ background: "#FEFEFE" }}>
      <span className="text-[#B5854A]">{icon}</span>
      <span className="text-[11px] font-bold text-[#0A1C29]/70">{text}</span>
    </div>
  );
}

function OrderSummaryMobile({ items, total }: { items: { product: { _id: string; name: string; salePrice?: number; originalPrice?: number; price: number }; qty: number }[]; total: number }) {
  return (
    <div className="rounded-2xl border border-[#C8A375]/40 p-4 space-y-2.5" style={{ background: "#ffffff" }}>
      {items.map(({ product, qty }) => {
        const price = product.salePrice ?? product.originalPrice ?? product.price;
        return (
          <div key={product._id} className="flex justify-between items-center">
            <p className="text-xs text-[#0A1C29]/60 line-clamp-1 flex-1 ml-3">{product.name} <span className="text-[#0A1C29]/30">×{qty}</span></p>
            <span className="text-xs font-bold text-[#0A1C29] whitespace-nowrap">{fmt(price * qty)} <img src="/money-icon.webp" alt="ر.س" className="inline w-6 h-6 object-contain align-middle" /></span>
          </div>
        );
      })}
      <div className="border-t border-dashed border-[#C8A375]/40 pt-2.5 flex justify-between text-xs">
        <span className="text-[#0A1C29]/50 flex items-center gap-1"><Truck size={11} /> التوصيل</span>
        <span className="font-bold text-[#B5854A]">مجاني</span>
      </div>
      <div className="border-t border-[#C8A375]/30 pt-2.5 flex justify-between items-center">
        <span className="text-sm font-bold text-[#0A1C29]/60">الإجمالي</span>
        <span className="text-xl font-black text-[#B5854A]">{fmt(total)} <span className="text-xs text-[#0A1C29]/40"><img src="/money-icon.webp" alt="ر.س" className="inline w-7 h-7 object-contain align-middle" /></span></span>
      </div>
    </div>
  );
}

function Field({ label, icon, value, error, placeholder, maxLength, dir, inputMode, onChange, fieldName }: {
  label: string; icon: React.ReactNode; value: string; error?: string;
  placeholder?: string; maxLength?: number; dir?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (v: string) => void; fieldName?: string;
}) {
  return (
    <div data-field={fieldName}>
      <label className="flex items-center gap-1.5 text-xs font-bold text-[#0A1C29]/70 mb-1.5">
        <span className="text-[#B5854A]">{icon}</span>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        dir={dir}
        inputMode={inputMode}
        className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-[#0A1C29] border-2 transition-all focus:outline-none placeholder:text-[#0A1C29]/25 ${
          error
            ? "border-red-400/50 bg-red-50 focus:border-red-400"
            : "border-[#C8A375]/40 bg-[#FEFEFE]/40 focus:border-[#B5854A] focus:bg-white"
        }`}
      />
      {error && <p className="text-red-500 text-[10px] font-bold mt-1">⚠ {error}</p>}
    </div>
  );
}
