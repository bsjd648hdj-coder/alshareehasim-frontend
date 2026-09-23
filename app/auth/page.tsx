"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "../store/authStore";

const COOLDOWN_SECONDS = 60;

// ─── OTP input component ──────────────────────────────────────────────────────
function OtpInputs({
  otp,
  setOtp,
  error,
  setError,
  onComplete,
}: {
  otp: string[];
  setOtp: (v: string[]) => void;
  error: string;
  setError: (v: string) => void;
  onComplete?: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first empty digit or first digit on mount
    const firstEmpty = otp.findIndex((d) => !d);
    const targetIdx = firstEmpty === -1 ? 0 : firstEmpty;
    setTimeout(() => refs.current[targetIdx]?.focus(), 50);
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const digits = pasted.replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = digits[i] || "";
    }
    setOtp(next);
    setError("");
    const focusIdx = Math.min(digits.length, 5);
    refs.current[focusIdx]?.focus();
    if (digits.length === 6) {
      setTimeout(() => onComplete?.(), 50);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      if (digits.length === 6) {
        setOtp(digits.split(""));
        refs.current[5]?.focus();
        setTimeout(() => onComplete?.(), 50);
        return;
      }
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }
    if (next.every((d) => d.length === 1)) {
      setTimeout(() => onComplete?.(), 50);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length === 6) {
      onComplete?.();
    }
  };

  return (
    <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={6}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          style={{ borderRadius: 0 }}
          className={`w-11 h-12 text-center text-xl font-bold border-2 transition-colors focus:outline-none ${
            error
              ? "border-red-400 bg-red-50 text-red-600"
              : digit
              ? "border-[#0A1C29] text-[#0A1C29]"
              : "border-[#d9d9d9] focus:border-[#B5854A]"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />;
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  inputRef,
  onKeyDown,
  dir,
  autoComplete,
  inputMode,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  dir?: "ltr" | "rtl";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        dir={dir}
        style={{ borderRadius: 0 }}
        className={`w-full px-4 py-3 border text-sm focus:outline-none transition-colors ${
          error
            ? "border-red-400 bg-red-50"
            : "border-[#d9d9d9] focus:border-[#B5854A]"
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Btn({
  onClick,
  disabled,
  loading,
  children,
  variant = "primary",
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
}) {
  const base =
    "w-full py-3 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const styles =
    variant === "primary"
      ? "bg-[#0A1C29] text-white hover:bg-[#1a3a5c]"
      : "border border-[#d9d9d9] text-[#0A1C29] hover:border-[#0A1C29] bg-white";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ borderRadius: 0 }}
      className={`${base} ${styles}`}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// REGISTER FORM
// ═════════════════════════════════════════════════════════════════════════════
// Saudi phone: 05xxxxxxxx or +9665xxxxxxxx or 009665xxxxxxxx
function isValidSaudiPhone(p: string) {
  return /^((\+966|00966|966)?(05)\d{8})$/.test(p.replace(/\s/g, ""));
}

function isValidEmailFormat(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

type RegisterState = {
  step: "form" | "otp";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  otpExpiresAt?: number;
  cooldownEndsAt?: number;
};

const REGISTER_STORAGE_KEY = "auth_register_draft";
const OTP_VALID_DURATION_MS = 10 * 60 * 1000; // 10 minutes

function loadRegisterDraft(defaultState: RegisterState): RegisterState {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(REGISTER_STORAGE_KEY) || sessionStorage.getItem(REGISTER_STORAGE_KEY);
    if (!saved) return defaultState;
    const parsed = JSON.parse(saved);

    // If in OTP step, verify it has not expired
    if (parsed.step === "otp") {
      if (parsed.otpExpiresAt && Date.now() > parsed.otpExpiresAt) {
        return { ...defaultState, ...parsed, step: "form" };
      }
      return { ...defaultState, ...parsed, step: "otp" };
    }

    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function saveRegisterDraft(state: RegisterState) {
  try {
    const raw = JSON.stringify(state);
    localStorage.setItem(REGISTER_STORAGE_KEY, raw);
    sessionStorage.setItem(REGISTER_STORAGE_KEY, raw);
  } catch { /* ignore */ }
}

function clearRegisterDraft() {
  try {
    localStorage.removeItem(REGISTER_STORAGE_KEY);
    sessionStorage.removeItem(REGISTER_STORAGE_KEY);
  } catch { /* ignore */ }
}

function RegisterForm({
  onSuccess,
  savedState,
  onStateChange,
}: {
  onSuccess: (user: object) => void;
  savedState: RegisterState;
  onStateChange: (s: Partial<RegisterState>) => void;
}) {
  const { step, firstName, lastName, phone, email, password } = savedState;
  const setStep = (v: "form" | "otp") => onStateChange({ step: v });

  const [showPass, setShowPass] = useState(false);

  // live errors — keyed by field name
  const [errors, setErrors] = useState<Record<string, string>>({});
  // touched — track which fields the user has interacted with
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  const [loading, setLoading] = useState(false);

  const getRemainingCooldown = useCallback(() => {
    if (!savedState.cooldownEndsAt) return 0;
    const diff = Math.ceil((savedState.cooldownEndsAt - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }, [savedState.cooldownEndsAt]);

  const [cooldown, setCooldown] = useState<number>(getRemainingCooldown);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "form") setTimeout(() => firstNameRef.current?.focus(), 100);
  }, [step]);

  // Keep cooldown timer in sync with real-time, even when switching apps/tabs
  useEffect(() => {
    const sync = () => {
      const rem = getRemainingCooldown();
      setCooldown(rem);

      // Check if OTP expired while app was in background or tab closed
      if (step === "otp" && savedState.otpExpiresAt && Date.now() > savedState.otpExpiresAt) {
        onStateChange({ step: "form" });
        setGlobalError("انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد");
      }
    };

    sync();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(sync, 1000);

    const onVisibleOrFocus = () => sync();
    window.addEventListener("focus", onVisibleOrFocus);
    document.addEventListener("visibilitychange", onVisibleOrFocus);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("focus", onVisibleOrFocus);
      document.removeEventListener("visibilitychange", onVisibleOrFocus);
    };
  }, [getRemainingCooldown, step, savedState.otpExpiresAt, onStateChange]);

  // ── Live field validators ─────────────────────────────────────────────────
  const validateField = useCallback((name: string, value: string) => {
    let msg = "";
    if (name === "firstName" && value.trim().length < 2) msg = "أدخل الاسم الأول (حرفان على الأقل)";
    if (name === "lastName" && value.trim().length < 2) msg = "أدخل اسم العائلة (حرفان على الأقل)";
    if (name === "phone" && !isValidSaudiPhone(value)) msg = "أدخل رقم سعودي صحيح (مثال: 0512345678)";
    if (name === "email" && !isValidEmailFormat(value)) msg = "أدخل بريدًا إلكترونيًا صحيحًا";
    if (name === "password" && value.length < 6) msg = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  }, []);

  const touch = (name: string) => setTouched((prev) => ({ ...prev, [name]: true }));

  // ── Debounced email existence check ──────────────────────────────────────
  const checkEmailExists = useCallback((val: string) => {
    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
    if (!isValidEmailFormat(val)) return;
    setEmailChecking(true);
    emailDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(val.toLowerCase().trim())}`);
        const data = await res.json();
        if (data.exists) {
          setErrors((prev) => ({ ...prev, email: "هذا البريد الإلكتروني مسجل مسبقًا" }));
        } else {
          setErrors((prev) => {
            if (prev.email === "هذا البريد الإلكتروني مسجل مسبقًا") {
              const next = { ...prev };
              delete next.email;
              return next;
            }
            return prev;
          });
        }
      } catch { /* fail open */ } finally {
        setEmailChecking(false);
      }
    }, 600);
  }, []);

  // ── Field change handlers ─────────────────────────────────────────────────
  const handleFieldChange = (name: string, value: string) => {
    onStateChange({ [name]: value } as Partial<RegisterState>);
    if (name === "email" && touched.email) checkEmailExists(value);
    if (touched[name]) validateField(name, value);
    else setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (name: string, value: string) => {
    touch(name);
    validateField(name, value);
    if (name === "email" && isValidEmailFormat(value)) checkEmailExists(value);
  };

  // ── Submit validation ─────────────────────────────────────────────────────
  const validateAll = () => {
    const fields = { firstName, lastName, phone, email, password };
    let valid = true;
    for (const [name, value] of Object.entries(fields)) {
      touch(name);
      if (!validateField(name, value)) valid = false;
    }
    // Also block if email is already taken
    if (errors.email === "هذا البريد الإلكتروني مسجل مسبقًا") valid = false;
    return valid;
  };

  const handleSendOtp = async () => {
    if (!validateAll()) return;
    setGlobalError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.replace(/\s/g, ""),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.cooldown) {
          const cooldownEndsAt = Date.now() + Number(data.cooldown) * 1000;
          onStateChange({ cooldownEndsAt });
          setCooldown(Number(data.cooldown));
        }
        if (res.status === 409) {
          setErrors((prev) => ({ ...prev, email: "هذا البريد الإلكتروني مسجل مسبقًا" }));
        } else {
          setGlobalError(data.error || "حدث خطأ، حاول مرة أخرى");
        }
        return;
      }
      const cooldownEndsAt = Date.now() + COOLDOWN_SECONDS * 1000;
      const otpExpiresAt = Date.now() + OTP_VALID_DURATION_MS;
      onStateChange({ step: "otp", cooldownEndsAt, otpExpiresAt });
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      setGlobalError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { setOtpError("أدخل رمز التحقق كاملًا"); return; }
    setOtpError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: code,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.replace(/\s/g, ""),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "رمز التحقق غير صحيح");
        if (data.code === "EXPIRED" || data.code === "MAX_ATTEMPTS") {
          setOtp(["", "", "", "", "", ""]);
        }
        return;
      }
      clearRegisterDraft();
      onSuccess(data.user);
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
      const res = await fetch("/api/auth/register/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.replace(/\s/g, ""),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.cooldown) {
          const cooldownEndsAt = Date.now() + Number(data.cooldown) * 1000;
          onStateChange({ cooldownEndsAt });
          setCooldown(Number(data.cooldown));
        }
        setOtpError(data.error || "حدث خطأ");
        return;
      }
      const cooldownEndsAt = Date.now() + COOLDOWN_SECONDS * 1000;
      const otpExpiresAt = Date.now() + OTP_VALID_DURATION_MS;
      onStateChange({ cooldownEndsAt, otpExpiresAt });
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      setOtpError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : "";

  if (step === "otp") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-[#0A1C29]">تحقق من بريدك الإلكتروني</p>
          <p className="text-sm text-gray-500">أرسلنا رمز تحقق مكوّن من 6 أرقام إلى</p>
          <p className="text-sm font-semibold text-[#B5854A]" dir="ltr">{maskedEmail}</p>
        </div>

        <OtpInputs otp={otp} setOtp={setOtp} error={otpError} setError={setOtpError} onComplete={handleVerifyOtp} />
        {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}

        <Btn onClick={handleVerifyOtp} loading={loading} disabled={otp.join("").length < 6}>
          إنشاء الحساب والدخول
        </Btn>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-[#f0f0f0]">
          <button
            onClick={() => {
              setErrors({});
              setGlobalError("");
              onStateChange({ step: "form" });
              setOtp(["", "", "", "", "", ""]);
              setOtpError("");
            }}
            className="hover:text-[#0A1C29] transition-colors font-medium"
          >
            تعديل البيانات
          </button>
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            className="hover:text-[#0A1C29] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `إعادة الإرسال (${cooldown}ث)` : "إعادة إرسال الرمز"}
          </button>
        </div>
      </div>
    );
  }

  // ── Live field input helper ───────────────────────────────────────────────
  const liveInput = (
    name: string,
    value: string,
    extra?: {
      label: string; id: string; type?: string; placeholder?: string;
      dir?: "ltr" | "rtl"; autoComplete?: string;
      inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
      inputRef?: React.RefObject<HTMLInputElement | null>;
      suffix?: React.ReactNode;
    }
  ) => {
    const err = touched[name] ? errors[name] : "";
    const isOk = touched[name] && !err && value.length > 0;
    const checking = name === "email" && emailChecking;
    return (
      <div className="space-y-1.5">
        <label htmlFor={extra?.id} className="text-sm font-medium text-gray-700">
          {extra?.label}
        </label>
        <div className="relative">
          <input
            ref={extra?.inputRef}
            id={extra?.id}
            type={extra?.type || "text"}
            autoComplete={extra?.autoComplete}
            inputMode={extra?.inputMode}
            value={value}
            dir={extra?.dir}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            onBlur={(e) => handleBlur(name, e.target.value)}
            placeholder={extra?.placeholder}
            style={{ borderRadius: 0 }}
            className={`w-full px-4 py-3 border text-sm focus:outline-none transition-colors ${extra?.suffix ? "pr-10" : ""} ${
              err ? "border-red-400 bg-red-50" : "border-[#d9d9d9] focus:border-[#B5854A]"
            }`}
          />
          {/* suffix slot (e.g. show/hide password button) */}
          {extra?.suffix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">{extra.suffix}</div>
          )}
          {/* email checking spinner only */}
          {!extra?.suffix && checking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin inline-block" />
            </div>
          )}
        </div>
        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
    );
  };

  const eyeIcon = (visible: boolean) => visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="space-y-4">
      {globalError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {liveInput("firstName", firstName, {
          label: "الاسم الأول", id: "reg-firstName",
          placeholder: "محمد", autoComplete: "given-name", inputRef: firstNameRef,
        })}
        {liveInput("lastName", lastName, {
          label: "اسم العائلة", id: "reg-lastName",
          placeholder: "الأحمد", autoComplete: "family-name",
        })}
      </div>

      {liveInput("phone", phone, {
        label: "رقم الجوال ", id: "reg-phone",
        type: "tel", placeholder: "0512345678",
        dir: "ltr", autoComplete: "tel", inputMode: "tel",
      })}

      {liveInput("email", email, {
        label: "البريد الإلكتروني", id: "reg-email",
        type: "email", placeholder: "xyz@example.com",
        dir: "ltr", autoComplete: "email", inputMode: "email",
      })}

      {/* Password — special: has show/hide button as suffix */}
      {liveInput("password", password, {
        label: "كلمة المرور", id: "reg-password",
        type: showPass ? "text" : "password",
        placeholder: "6 أحرف على الأقل", autoComplete: "new-password",
        suffix: (
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {eyeIcon(showPass)}
          </button>
        ),
      })}

      <Btn onClick={handleSendOtp} loading={loading} disabled={emailChecking}>
        إرسال رمز التحقق
      </Btn>

      {savedState.otpExpiresAt && Date.now() < savedState.otpExpiresAt && (
        <button
          type="button"
          onClick={() => {
            setErrors({});
            setGlobalError("");
            onStateChange({ step: "otp" });
          }}
          className="w-full text-center text-xs text-[#0A1C29] hover:underline font-medium pt-1"
        >
          العودة لإدخال رمز التحقق الحالي ←
        </button>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// LOGIN FORM
// ═════════════════════════════════════════════════════════════════════════════
function LoginForm({ onSuccess }: { onSuccess: (user: object) => void }) {
  type LoginStep = "login" | "forgot-email" | "forgot-otp" | "forgot-success";
  const [step, setStep] = useState<LoginStep>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCooldown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCooldown(COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); timerRef.current = null; return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  const handleLogin = async () => {
    const trimEmail = email.toLowerCase().trim();
    const trimPass = password.trim();
    if (!trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      setError("أدخل بريدًا إلكترونيًا صحيحًا"); return;
    }
    if (!trimPass) { setError("أدخل كلمة المرور"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimEmail, password: trimPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "بيانات غير صحيحة"); return; }
      onSuccess(data.user);
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async () => {
    const trimEmail = forgotEmail.toLowerCase().trim();
    if (!trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      setForgotEmailError("أدخل بريدًا إلكترونيًا صحيحًا"); return;
    }
    setForgotEmailError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotEmailError(data.error || "حدث خطأ"); return;
      }
      setStep("forgot-otp");
      startCooldown();
    } catch {
      setForgotEmailError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setOtpError("أدخل رمز التحقق كاملًا"); return; }
    if (!newPassword || newPassword.length < 6) { setNewPasswordError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setOtpError(""); setNewPasswordError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.toLowerCase().trim(), otp: code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "رمز التحقق غير صحيح");
        if (data.code === "EXPIRED" || data.code === "MAX_ATTEMPTS") {
          setOtp(["", "", "", "", "", ""]);
        }
        return;
      }
      setStep("forgot-success");
    } catch {
      setOtpError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgot = async () => {
    if (cooldown > 0 || loading) return;
    setOtp(["", "", "", "", "", ""]); setOtpError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || "حدث خطأ"); return; }
      startCooldown();
    } catch {
      setOtpError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const maskedForgotEmail = forgotEmail
    ? forgotEmail.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : "";

  // ── Forgot success ──
  if (step === "forgot-success") {
    return (
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#0A1C29] text-base">تم تغيير كلمة المرور</p>
          <p className="text-sm text-gray-500 mt-1">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
        </div>
        <Btn onClick={() => { setStep("login"); setForgotEmail(""); setOtp(["","","","","",""]); setNewPassword(""); }}>
          العودة لتسجيل الدخول
        </Btn>
      </div>
    );
  }

  // ── Forgot OTP + new password ──
  if (step === "forgot-otp") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-[#0A1C29]">تحقق من بريدك الإلكتروني</p>
          <p className="text-sm text-gray-500">أرسلنا رمز تحقق إلى</p>
          <p className="text-sm font-semibold text-[#B5854A]" dir="ltr">{maskedForgotEmail}</p>
        </div>

        <OtpInputs otp={otp} setOtp={setOtp} error={otpError} setError={setOtpError} />
        {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-sm font-medium text-gray-700">
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNewPass ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setNewPasswordError(""); }}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleForgotVerify()}
              placeholder="6 أحرف على الأقل"
              style={{ borderRadius: 0 }}
              className={`w-full px-4 py-3 border text-sm focus:outline-none transition-colors pr-10 ${
                newPasswordError ? "border-red-400 bg-red-50" : "border-[#d9d9d9] focus:border-[#B5854A]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNewPass((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showNewPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showNewPass ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {newPasswordError && <p className="text-xs text-red-500">{newPasswordError}</p>}
        </div>

        <Btn onClick={handleForgotVerify} loading={loading} disabled={otp.join("").length < 6 || !newPassword}>
          تغيير كلمة المرور
        </Btn>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-[#f0f0f0]">
          <button
            onClick={() => { setStep("forgot-email"); setOtp(["","","","","",""]); setOtpError(""); setNewPassword(""); }}
            className="hover:text-[#0A1C29] transition-colors font-medium"
          >
            تغيير البريد
          </button>
          <button
            onClick={handleResendForgot}
            disabled={cooldown > 0 || loading}
            className="hover:text-[#0A1C29] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `إعادة الإرسال (${cooldown}ث)` : "إعادة إرسال الرمز"}
          </button>
        </div>
      </div>
    );
  }

  // ── Forgot email entry ──
  if (step === "forgot-email") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-base font-semibold text-[#0A1C29]">نسيت كلمة المرور؟</p>
          <p className="text-sm text-gray-500 mt-1">أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة التعيين</p>
        </div>

        <Field
          label="البريد الإلكتروني"
          id="forgot-email"
          type="email"
          value={forgotEmail}
          onChange={(v) => { setForgotEmail(v); setForgotEmailError(""); }}
          error={forgotEmailError}
          placeholder="xyz@example.com"
          dir="ltr"
          autoComplete="email"
          inputMode="email"
          onKeyDown={(e) => e.key === "Enter" && !loading && handleForgotRequest()}
        />

        <Btn onClick={handleForgotRequest} loading={loading}>
          إرسال رمز التحقق
        </Btn>

        <button
          onClick={() => { setStep("login"); setForgotEmail(""); setForgotEmailError(""); }}
          className="w-full text-sm text-gray-500 hover:text-[#0A1C29] transition-colors text-center"
        >
          العودة لتسجيل الدخول
        </button>
      </div>
    );
  }

  // ── Login ──
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <Field
        label="البريد الإلكتروني"
        id="login-email"
        type="email"
        value={email}
        onChange={(v) => { setEmail(v); setError(""); }}
        placeholder="xyz@example.com"
        dir="ltr"
        autoComplete="email"
        inputMode="email"
        inputRef={emailRef}
        onKeyDown={(e) => e.key === "Enter" && document.getElementById("login-password")?.focus()}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
            كلمة المرور
          </label>
          <button
            type="button"
            onClick={() => { setStep("forgot-email"); setForgotEmail(email); }}
            className="hidden text-xs text-[#B5854A] hover:text-[#9a6d38] transition-colors font-medium"
          >
            نسيت كلمة السر؟
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
            placeholder="••••••••"
            style={{ borderRadius: 0 }}
            className={`w-full px-4 py-3 border text-sm focus:outline-none transition-colors pr-10 ${
              error ? "border-red-400 bg-red-50" : "border-[#d9d9d9] focus:border-[#B5854A]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPass ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <Btn onClick={handleLogin} loading={loading}>
        تسجيل الدخول
      </Btn>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
type Tab = "login" | "register";

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initialized, setUser } = useAuthStore();

  const queryTab = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(queryTab === "register" ? "register" : "login");

  // Keep tab updated if query param changes
  useEffect(() => {
    if (queryTab === "register" || queryTab === "login") {
      setTab(queryTab);
    }
  }, [queryTab]);

  const defaultRegisterState: RegisterState = {
    step: "form",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  };

  const [registerState, setRegisterState] = useState<RegisterState>(() => {
    return loadRegisterDraft(defaultRegisterState);
  });

  const handleRegisterStateChange = (partial: Partial<RegisterState>) => {
    setRegisterState((prev) => {
      const next = { ...prev, ...partial };
      saveRegisterDraft(next);
      return next;
    });
  };

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      const redirect = searchParams.get("redirect");
      const safe =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/account";
      router.replace(safe);
    }
  }, [initialized, user, router, searchParams]);

  const handleSuccess = (user: object) => {
    setUser(user as Parameters<typeof setUser>[0]);
    clearRegisterDraft();
    const redirect = searchParams.get("redirect");
    const safe =
      redirect && redirect.startsWith("/") && !redirect.startsWith("//")
        ? redirect
        : "/account";
    router.replace(safe);
  };

  if (!initialized) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-[#0A1C29]/20 border-t-[#0A1C29] rounded-full animate-spin inline-block" />
    </div>
  );
  if (user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16" dir="rtl">
      <div className="w-full max-w-[460px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <Image
            src="/logo.webp"
            alt="لمسة"
            width={260}
            height={104}
            className="object-contain h-24 w-auto"
            priority
          />
          <h1 className="text-xl font-bold text-[#0A1C29]">أهلًا بك في مؤسسة لمسة</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e5e7eb] mb-6">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-[#0A1C29] text-[#0A1C29]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
            </button>
          ))}
        </div>

        {tab === "login" ? (
          <LoginForm key="login" onSuccess={handleSuccess} />
        ) : (
          <RegisterForm
            key="register"
            onSuccess={handleSuccess}
            savedState={registerState}
            onStateChange={handleRegisterStateChange}
          />
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}
