"use client";

import { useState, useRef } from "react";
import { User, Phone, MapPin, IdCard, ArrowLeft, Lock, CheckCircle2, BadgeCheck, Truck } from "lucide-react";
import type { CustomerInfo } from "../../store/cartStore";
import { useCartStore } from "../../store/cartStore";

interface CustomerFormProps {
  total: number;
  itemCount: number;
  initialData?: CustomerInfo | null;
  installmentMonths?: number;
  onSubmit: (info: CustomerInfo) => void;
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default function CustomerForm({ initialData, total, onSubmit }: CustomerFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [nationalId, setNationalId] = useState(initialData?.nationalId ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { items, clear } = useCartStore();

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "الاسم مطلوب";
    if (!nationalId.trim()) e.nationalId = "رقم الهوية مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim())) e.nationalId = "هوية سعودية: 10 أرقام تبدأ بـ 1 أو 2";
    if (!whatsapp.trim()) e.whatsapp = "رقم الواتساب مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) e.whatsapp = "يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!address.trim()) e.address = "العنوان مطلوب";
    setErrors(e);
    if (Object.keys(e).length) {
      const firstKey = Object.keys(e)[0];
      const el = formRef.current?.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      return;
    }
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
    onSubmit({ name, nationalId, whatsapp, address, installmentType: "full", months: 0, downPayment: 0 });
    setShowPopup(true);
  };

  const allDone = !!(name.trim() && nationalId.trim() && whatsapp.trim() && address.trim() && !Object.values(errors).some(Boolean));

  return (
    <>
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => { setShowPopup(false); clear(); }}
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
                  <span className="text-lg font-black text-[#B5854A]">{fmt(total)} <span className="text-xs font-medium text-[#0A1C29]/40"><img src="/money-icon.webp" alt="ر.س" className="inline w-7 h-7 object-contain align-middle" /></span></span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-[#C8A375]/40 px-4 py-3 mb-4" style={{ background: "#FEFEFE" }}>
                <Truck className="w-4 h-4 text-[#B5854A]" />
                <span className="text-sm font-bold text-[#0A1C29]">الدفع عند الاستلام</span>
              </div>
              <p className="text-[#0A1C29]/50 text-xs mb-5">سيتصل بك فريقنا على رقم واتساب المسجل لتأكيد الطلب وتحديد موعد التوصيل</p>
              <button
                onClick={() => { setShowPopup(false); clear(); }}
                className="w-full py-3.5 rounded-xl text-white font-black text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #B5854A 0%, #C8A375 100%)" }}
              >
                حسناً، شكراً! ✓
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={formRef} className="rounded-2xl border border-[#C8A375]/40 overflow-hidden" style={{ background: "#ffffff" }}>
        <div className="px-5 py-4 border-b border-[#C8A375]/30 flex items-center gap-3" style={{ background: "#FEFEFE" }}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${allDone ? "bg-[#B5854A]" : "bg-[#0A1C29]"}`}>
            {allDone
              ? <CheckCircle2 size={16} className="text-white" />
              : <span className="text-white text-xs font-black">1</span>
            }
          </div>
          <div>
            <h3 className="text-sm font-black text-[#0A1C29]">معلوماتك الشخصية</h3>
            <p className="text-[10px] text-[#0A1C29]/50 mt-0.5">الاسم والهوية والتواصل والعنوان</p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field fieldName="name" label="الاسم الكامل" icon={<User size={14} />} value={name} error={errors.name} placeholder="محمد أحمد العلي"
              onChange={(v) => { setName(v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "")); setErrors(p => ({ ...p, name: "" })); }} />
            <Field fieldName="nationalId" label="رقم الهوية / الإقامة" icon={<IdCard size={14} />} value={nationalId} error={errors.nationalId} placeholder="1XXXXXXXXX" maxLength={10} inputMode="numeric"
              onChange={(v) => { setNationalId(v.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, nationalId: "" })); }} />
            <Field fieldName="whatsapp" label="رقم الواتساب" icon={<Phone size={14} />} value={whatsapp} error={errors.whatsapp} placeholder="05XXXXXXXX" maxLength={10} dir="ltr" inputMode="numeric"
              onChange={(v) => { setWhatsapp(v.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, whatsapp: "" })); }} />
            <Field fieldName="address" label="عنوان التوصيل" icon={<MapPin size={14} />} value={address} error={errors.address} placeholder="المدينة - الحي - الشارع"
              onChange={(v) => { setAddress(v); setErrors(p => ({ ...p, address: "" })); }} />
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-3">
          <button
            onClick={handleSubmit}
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
    </>
  );
}

function Field({ label, icon, value, error, placeholder, maxLength, dir, inputMode, onChange, fieldName, hint }: {
  label: string; icon: React.ReactNode; value: string; error?: string;
  placeholder?: string; maxLength?: number; dir?: string; hint?: string;
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
      {hint && !error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <svg width="12" height="12" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="#B5854A" strokeWidth="2" fill="none"/>
            <rect x="4.5" y="4.5" width="5" height="5" rx="0.5" fill="#B5854A"/>
            <rect x="22" y="2" width="10" height="10" rx="1.5" stroke="#B5854A" strokeWidth="2" fill="none"/>
            <rect x="24.5" y="4.5" width="5" height="5" rx="0.5" fill="#B5854A"/>
            <rect x="2" y="22" width="10" height="10" rx="1.5" stroke="#B5854A" strokeWidth="2" fill="none"/>
            <rect x="4.5" y="24.5" width="5" height="5" rx="0.5" fill="#B5854A"/>
            <rect x="15" y="2" width="2" height="5" rx="0.5" fill="#B5854A"/>
            <rect x="15" y="15" width="3" height="2" rx="0.5" fill="#B5854A"/>
            <rect x="20" y="15" width="2" height="3" rx="0.5" fill="#B5854A"/>
            <rect x="15" y="20" width="2" height="4" rx="0.5" fill="#B5854A"/>
            <rect x="19" y="19" width="3" height="2" rx="0.5" fill="#B5854A"/>
            <rect x="24" y="20" width="2" height="5" rx="0.5" fill="#B5854A"/>
          </svg>
          <p className="text-[#B5854A] text-[10px] font-bold">{hint}</p>
        </div>
      )}
      {error && <p className="text-red-500 text-[10px] font-bold mt-1">⚠ {error}</p>}
    </div>
  );
}
