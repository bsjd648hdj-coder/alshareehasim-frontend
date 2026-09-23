"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Mail, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "email" | "otp";

const COOLDOWN_SECONDS = 60;

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { setUser } = useAuthStore();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("email");
      setEmail("");
      setEmailError("");
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setLoading(false);
      setCooldown(0);
      setTimeout(() => emailRef.current?.focus(), 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const handleSendOtp = async () => {
    const trimmed = email.toLowerCase().trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("أدخل بريدًا إلكترونيًا صحيحًا");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "حدث خطأ، حاول مرة أخرى");
        return;
      }
      setStep("otp");
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setEmailError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("أدخل رمز التحقق كاملًا");
      return;
    }
    setOtpError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "رمز التحقق غير صحيح");
        if (data.code === "EXPIRED" || data.code === "MAX_ATTEMPTS") {
          setOtp(["", "", "", "", "", ""]);
          setTimeout(() => otpRefs.current[0]?.focus(), 50);
        }
        return;
      }
      setUser(data.user);
      onClose();
    } catch {
      setOtpError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "حدث خطأ، حاول مرة أخرى");
        return;
      }
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch {
      setOtpError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Handle paste
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      if (digits.length === 6) {
        const newOtp = digits.split("");
        setOtp(newOtp);
        otpRefs.current[5]?.focus();
        return;
      }
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError("");
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      if (otp.join("").length === 6) handleVerifyOtp();
    }
  };

  if (!open) return null;

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : "";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="تسجيل الدخول"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0f2744]">
            {step === "email" ? "تسجيل الدخول" : "أدخل رمز التحقق"}
          </h2>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {step === "email" ? (
            <>
              <p className="text-sm text-gray-500 leading-relaxed">
                أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق.
              </p>

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="text-sm font-semibold text-gray-700">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    ref={emailRef}
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSendOtp()}
                    placeholder="example@mail.com"
                    dir="ltr"
                    className={`w-full px-4 py-3 pr-10 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20 ${
                      emailError ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#0f2744]"
                    }`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500 font-medium">{emailError}</p>
                )}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 bg-[#0f2744] text-white font-bold text-sm rounded-xl hover:bg-[#1a3a5c] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    إرسال رمز التحقق
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-500">تم إرسال رمز التحقق إلى</p>
                <p className="text-sm font-bold text-[#0f2744]" dir="ltr">{maskedEmail}</p>
              </div>

              {/* OTP Boxes */}
              <div className="flex gap-2 justify-center" dir="ltr">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-[#0f2744]/20 ${
                      otpError
                        ? "border-red-300 bg-red-50 text-red-600"
                        : digit
                        ? "border-[#0f2744] bg-[#f0f4f9] text-[#0f2744]"
                        : "border-gray-200 focus:border-[#0f2744]"
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-xs text-red-500 font-medium text-center">{otpError}</p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length < 6}
                className="w-full py-3 bg-[#0f2744] text-white font-bold text-sm rounded-xl hover:bg-[#1a3a5c] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "تحقق"
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <button
                  onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setOtpError(""); }}
                  className="hover:text-[#0f2744] transition font-medium"
                >
                  تغيير البريد
                </button>
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="hover:text-[#0f2744] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `إعادة الإرسال (${cooldown}ث)` : "إعادة إرسال الرمز"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
