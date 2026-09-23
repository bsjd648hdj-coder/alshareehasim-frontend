"use client";

import { Lock, BadgeCheck, User, Phone, MapPin, IdCard, ArrowLeft } from "lucide-react";

export function MField({ label, icon, value, error, placeholder, maxLength, dir, inputMode, onChange }: {
  label: string; icon: React.ReactNode; value: string; error?: string;
  placeholder?: string; maxLength?: number; dir?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gray-500 mb-1">
        <span className="text-[#B5854A]">{icon}</span>{label}
        {error && <span className="text-red-500 mr-auto text-[10px] sm:text-[11px]">⚠ {error}</span>}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        maxLength={maxLength} dir={dir} inputMode={inputMode}
        className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border transition focus:outline-none placeholder:text-gray-200 ${
          error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#B5854A]"
        }`} />
    </div>
  );
}

interface LoadingOverlayProps { show: boolean; }
export function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-7 px-4 bg-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0A1C29]" style={{ animation: "spin 0.85s linear infinite" }} />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-[#0A1C29] font-black text-sm sm:text-base">جاري معالجة الدفع</p>
        <p className="text-gray-400 text-xs sm:text-sm">يرجى الانتظار...</p>
      </div>
      <p className="text-[10px] text-gray-300 flex items-center gap-1"><Lock size={9} /> اتصال مشفّر وآمن · PCI DSS</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

interface SuccessModalProps { show: boolean; onClose: () => void; }
export function SuccessModal({ show, onClose }: SuccessModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
        <div className="h-1" style={{ background: "linear-gradient(90deg,#B5854A,#C8A375,#B5854A)" }} />
        <div className="p-7 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FEFEFE" }}>
            <BadgeCheck className="w-7 h-7 text-[#B5854A]" />
          </div>
          <h2 className="text-xl font-black text-[#0A1C29] mb-1">تم استلام طلبك! 🎉</h2>
          <p className="text-[#B5854A] font-bold text-sm mb-5">سيتم التواصل معك قريباً على واتساب</p>
          <button onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-black text-sm hover:opacity-90 transition"
            style={{ background: "linear-gradient(135deg,#B5854A,#C8A375)" }}>
            حسناً، شكراً! ✓
          </button>
        </div>
      </div>
    </div>
  );
}

interface OrderModalProps {
  show: boolean; onClose: () => void;
  name: string; nationalId: string; whatsapp: string; address: string;
  errors: Record<string, string>;
  loading: boolean;
  setName: (v: string) => void; setNationalId: (v: string) => void;
  setWhatsapp: (v: string) => void; setAddress: (v: string) => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: () => void;
}
export function OrderModal({ show, onClose, name, nationalId, whatsapp, address, errors, loading, setName, setNationalId, setWhatsapp, setAddress, setErrors, onSubmit }: OrderModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
        <div className="h-1" style={{ background: "linear-gradient(90deg,#B5854A,#C8A375,#B5854A)" }} />
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-black text-[#0A1C29]">بيانات التوصيل</h3>
        </div>
        <div className="p-5 space-y-3">
          <MField label="الاسم" icon={<User size={13} />} value={name} error={errors.name} placeholder="محمد أحمد"
            onChange={v => { setName(v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "")); setErrors(p => ({ ...p, name: "" })); }} />
          <MField label="رقم الهوية" icon={<IdCard size={13} />} value={nationalId} error={errors.nationalId} placeholder="1XXXXXXXXX" maxLength={10} inputMode="numeric"
            onChange={v => {
              const val = v.replace(/\D/g, "").slice(0, 10);
              setNationalId(val);
              if (val.length > 0 && !/^[12]/.test(val)) setErrors(p => ({ ...p, nationalId: "يجب أن يبدأ بـ 1 أو 2" }));
              else if (val.length === 10 && !/^[12]\d{9}$/.test(val)) setErrors(p => ({ ...p, nationalId: "10 أرقام تبدأ بـ 1 أو 2" }));
              else setErrors(p => ({ ...p, nationalId: "" }));
            }} />
          <MField label="واتساب" icon={<Phone size={13} />} value={whatsapp} error={errors.whatsapp} placeholder="05XXXXXXXX" maxLength={10} dir="ltr" inputMode="numeric"
            onChange={v => {
              const val = v.replace(/\D/g, "").slice(0, 10);
              setWhatsapp(val);
              if (val.length > 0 && !/^0/.test(val)) setErrors(p => ({ ...p, whatsapp: "يجب أن يبدأ بـ 05" }));
              else if (val.length >= 2 && !/^05/.test(val)) setErrors(p => ({ ...p, whatsapp: "يجب أن يبدأ بـ 05" }));
              else if (val.length === 10 && !/^05\d{8}$/.test(val)) setErrors(p => ({ ...p, whatsapp: "10 أرقام تبدأ بـ 05" }));
              else setErrors(p => ({ ...p, whatsapp: "" }));
            }} />
          <MField label="العنوان" icon={<MapPin size={13} />} value={address} error={errors.address} placeholder="المدينة - الحي - الشارع"
            onChange={v => { setAddress(v); setErrors(p => ({ ...p, address: "" })); }} />
          <button onClick={onSubmit} disabled={loading}
            className="w-full py-3 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-70 hover:opacity-90 transition"
            style={{ background: "linear-gradient(135deg,#B5854A,#C8A375)" }}>
            {loading ? "جاري..." : <><span>تأكيد الطلب</span><ArrowLeft size={15} /></>}
          </button>
          <p className="text-center text-[10px] text-gray-300 flex items-center justify-center gap-1">
            <Lock size={9} /> بياناتك محمية
          </p>
        </div>
      </div>
    </div>
  );
}
