"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Lock, CreditCard, Clock } from "lucide-react";
import { RL_MAX } from "./useRateLimit";

interface CheckoutPaymentProps {
  shippingConfirmed: boolean;
  selectedPayment: "mada" | "mastercard" | "applepay" | null;
  setSelectedPayment: (v: "mada" | "mastercard" | "applepay" | null) => void;
  cardNumber: string; setCardNumber: (v: string) => void;
  cardExpiry: string; setCardExpiry: (v: string) => void;
  cardCvv: string; setCardCvv: (v: string) => void;
  cardHolder: string; setCardHolder: (v: string) => void;
  cardNumberError: string; setCardNumberError: (v: string) => void;
  cardExpiryError: string; setCardExpiryError: (v: string) => void;
  loading: boolean; blocked: boolean; fmtTime: string;
  onCardSubmit: () => void;
}

export default function CheckoutPayment({
  shippingConfirmed, selectedPayment, setSelectedPayment,
  cardNumber, setCardNumber, cardExpiry, setCardExpiry,
  cardCvv, setCardCvv, cardHolder, setCardHolder,
  cardNumberError, setCardNumberError, cardExpiryError, setCardExpiryError,
  loading, blocked, fmtTime, onCardSubmit,
}: CheckoutPaymentProps) {
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const cardExpiryRef = useRef<HTMLInputElement>(null);
  const cardCvvRef = useRef<HTMLInputElement>(null);

  // الافتراضي مدى
  useEffect(() => {
    if (shippingConfirmed && !selectedPayment) setSelectedPayment("mada");
  }, [shippingConfirmed]);

  const paymentLabel = selectedPayment === "mada" ? "مدى" : selectedPayment === "mastercard" ? "بطاقة ائتمانية" : selectedPayment === "applepay" ? "Apple Pay" : "مدى أو بطاقة ائتمانية";

  if (!shippingConfirmed) return (
    <div className="px-4 sm:px-6 py-5">
      <div className="flex items-center gap-2 mb-0.5">
        <CreditCard size={14} className="text-gray-500" />
        <p className="text-sm sm:text-base font-bold text-[#1A2E44]">الدفع</p>
      </div>
      <p className="text-xs sm:text-sm text-gray-400 mr-6">مدى أو بطاقة ائتمانية</p>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 py-5">
      <div className="flex items-center gap-2 mb-0.5">
        <CreditCard size={14} className="text-gray-500" />
        <p className="text-sm sm:text-base font-bold text-[#1A2E44]">الدفع</p>
      </div>
      <p className="text-xs sm:text-sm text-gray-400 mr-6">{paymentLabel}</p>

      <>
          {/* أزرار اختيار طريقة الدفع */}
          <div className="flex gap-2 mt-4">
            {(["mada", "mastercard"] as const).map(method => (
              <button key={method} onClick={() => setSelectedPayment(method)}
                className="flex-1 flex items-center justify-center px-2 sm:px-7 py-2 sm:py-4 border-2 transition-all"
                style={{ borderColor: selectedPayment === method ? "#63D3A8" : "#e5e7eb", background: selectedPayment === method ? "#f0fdf9" : "#fff" }}>
                <div className="w-10 h-5 sm:w-16 sm:h-9 relative shrink-0">
                  <Image src={method === "mada" ? "/mada.svg" : "/master.svg"} alt={method} fill className="object-contain" />
                </div>
              </button>
            ))}
            <button onClick={() => setSelectedPayment(selectedPayment === "applepay" ? "mada" : "applepay")}
              className="flex-1 flex items-center justify-center px-2 sm:px-6 py-2 sm:py-4 border-2 transition-all"
              style={{ borderColor: selectedPayment === "applepay" ? "#1A2E44" : "#e5e7eb", background: selectedPayment === "applepay" ? "#f5f7fa" : "#fff" }}>
              <div className="w-14 h-7 sm:w-22 sm:h-12 relative shrink-0">
                <Image src="/Apple-Pay-01.png" alt="Apple Pay" fill className="object-contain" />
              </div>
            </button>
          </div>

          {selectedPayment === "applepay" && (
            <div className="mt-3 flex items-center gap-2.5 px-4 py-3 border border-gray-100 bg-gray-50">
              <div className="w-8 h-8 relative shrink-0">
                <Image src="/Apple-Pay-01.png" alt="Apple Pay" fill className="object-contain" />
              </div>
              <div>
                <p className="text-sm font-black text-[#1A2E44]">Apple Pay قريباً</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">نعمل على إضافة Apple Pay، ترقّب التحديثات! في الوقت الحالي يمكنك الدفع بمدى أو بطاقة ائتمانية.</p>
              </div>
            </div>
          )}

          {/* فورم البطاقة - يظهر مباشرة لمدى أو ماستركارد */}
          {selectedPayment && selectedPayment !== "applepay" && (
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-bold text-gray-600 mb-2 block">بيانات البطاقة <span className="text-red-400">*</span></label>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col w-full gap-1">
                    <div className="flex border border-gray-200 overflow-hidden focus-within:border-[#63D3A8] transition" dir="ltr">
                      <input ref={cardNumberRef} type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" maxLength={19}
                        value={cardNumber}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                          v = v.match(/.{1,4}/g)?.join(" ") ?? v;
                          setCardNumber(v);
                          const raw = v.replace(/\s/g, "");
                          if (raw.length === 16) {
                            let sum = 0, shouldDouble = false;
                            for (let i = raw.length - 1; i >= 0; i--) {
                              let digit = parseInt(raw[i]);
                              if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
                              sum += digit; shouldDouble = !shouldDouble;
                            }
                            setCardNumberError(sum % 10 !== 0 ? "رقم البطاقة غير صحيح" : "");
                            if (sum % 10 === 0) cardExpiryRef.current?.focus();
                          } else { setCardNumberError(""); }
                        }}
                        className={`flex-1 px-3 py-3 text-sm sm:text-base font-mono focus:outline-none min-w-0 ${cardNumberError ? "bg-red-50" : ""}`}
                      />
                      <input ref={cardExpiryRef} type="text" inputMode="numeric" placeholder="MM/YY" maxLength={5}
                        value={cardExpiry}
                        onChange={e => {
                          const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                          const f = d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
                          setCardExpiry(f);
                          if (d.length === 4) {
                            const mm = Number(d.slice(0, 2)), yy = Number(d.slice(2));
                            const now = new Date();
                            if (mm < 1 || mm > 12) setCardExpiryError("الشهر بين 01 و 12");
                            else if (new Date(2000 + yy, mm - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1)) setCardExpiryError("البطاقة منتهية الصلاحية");
                            else { setCardExpiryError(""); cardCvvRef.current?.focus(); }
                          } else { setCardExpiryError(""); }
                        }}
                        className={`w-20 sm:w-24 px-2 py-3 text-sm sm:text-base font-mono text-center focus:outline-none border-r border-gray-200 ${cardExpiryError ? "bg-red-50" : ""}`}
                      />
                      <input ref={cardCvvRef} type="password" inputMode="numeric" placeholder="CVV" maxLength={3}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        className="w-16 sm:w-20 px-2 py-3 text-sm sm:text-base font-mono text-center focus:outline-none border-r border-gray-200"
                      />
                    </div>
                    {(cardNumberError || cardExpiryError) && (
                      <p className="text-red-500 text-xs font-bold flex items-center gap-1">⚠ {cardNumberError || cardExpiryError}</p>
                    )}
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-xs sm:text-sm font-bold text-gray-600 mb-2 block">اسم حامل البطاقة</label>
                    <input type="text" placeholder="AHMED MOHAMMED" dir="ltr"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value.replace(/[^a-zA-Z ]/g, "").toUpperCase())}
                      className="flex-1 px-3 py-3 text-sm sm:text-base border border-gray-200 focus:border-[#63D3A8] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <button onClick={onCardSubmit}
                disabled={cardNumber.replace(/\s/g, "").length < 16 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardHolder.trim() || !!cardNumberError || !!cardExpiryError || loading || blocked}
                className="w-full py-4 text-white font-black text-base flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition"
                style={{ background: blocked ? "#9ca3af" : "linear-gradient(135deg,#63D3A8,#56CFA1)" }}>
                <Lock size={15} />
                {loading ? "جاري الإرسال..." : blocked ? (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />يمكنك الطلب بعد {fmtTime}
                  </span>
                ) : "تأكيد الدفع الآن"}
              </button>

              {blocked && (
                <div className="flex items-start gap-2 px-3 py-2.5 border border-gray-200 bg-gray-50">
                  <Clock size={14} className="text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-gray-800">لقد تجاوزت الحد المسموح به من الطلبات</p>
                    <p className="text-xs text-gray-600 mt-0.5">يمكنك إرسال طلب جديد خلال <span className="font-black tabular-nums">{fmtTime}</span></p>
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-gray-300 flex items-center justify-center gap-1">
                <Lock size={9} /> اتصال مشفّر وآمن · PCI DSS
              </p>
            </div>
          )}
      </>
    </div>
  );
}
