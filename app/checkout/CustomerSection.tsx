"use client";

import { useState, useRef, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber, getCountries, getCountryCallingCode } from "react-phone-number-input";
import type { Value as PhoneValue, Country } from "react-phone-number-input";
import ar from "react-phone-number-input/locale/ar.json";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CustomerSectionProps {
  data: CustomerData;
  errors: Record<string, string>;
  confirmed: boolean;
  isAuthenticated: boolean;
  authLoading: boolean;
  onChange: (field: keyof CustomerData, value: string) => void;
  onConfirm: () => void;
  onEdit: () => void;
}

function Field({ label, value, error, placeholder, dir, inputMode, onChange }: {
  label: string; value: string; error?: string;
  placeholder?: string; dir?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-gray-600">{label}</label>
        {error && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-red-500 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            {error}
          </span>
        )}
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        inputMode={inputMode}
        className={`w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border transition focus:outline-none placeholder:text-gray-300 ${
          error ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-200 focus:border-[#63D3A8]"
        }`}
      />
    </div>
  );
}

const PRIORITY: Country[] = ["SA","AE","KW","BH","IQ","QA","OM","YE","EG"];

function getSortedCountries(): Country[] {
  const all = getCountries();
  const rest = all.filter(c => !PRIORITY.includes(c));
  return [...PRIORITY.filter(c => all.includes(c)), ...rest];
}

function CustomCountrySelect({ value, onChange }: {
  value: Country;
  onChange: (c: Country) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ?? "SA" as Country;
  const Flag = flags[selected];
  const sorted = getSortedCountries();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0 flex items-stretch">
      {/* flag + chevron */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 h-full bg-gray-50 border-r border-gray-200 hover:bg-gray-100 transition"
      >
        {Flag && <span className="w-6 h-4 rounded-sm overflow-hidden shrink-0 inline-flex"><Flag title={selected} /></span>}
        <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="country-dropdown absolute z-50 top-full mt-1 left-0 w-72 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto" dir="rtl">
          {sorted.map((c, i) => {
            const FlagIcon = flags[c];
            const isPriority = PRIORITY.includes(c);
            const isLastPriority = i === PRIORITY.length - 1;
            return (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 transition ${
                  c === selected ? "bg-[#f0fdf9]" : "hover:bg-gray-50"
                } ${isLastPriority ? "border-b border-gray-100" : ""}`}
              >
                <span className="flex-1 text-right text-[#1A2E44] truncate text-xs">
                  {isPriority ? ar[c] ?? c : c}
                </span>
                <span className="text-[11px] text-gray-400 font-mono shrink-0 w-10 text-left">+{getCountryCallingCode(c)}</span>
                {FlagIcon && <span className="w-6 h-4 rounded-sm overflow-hidden shrink-0 inline-flex"><FlagIcon title={c} /></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CustomerSection({ data, errors, confirmed, isAuthenticated, authLoading, onChange, onConfirm, onEdit }: CustomerSectionProps) {
  const [phoneErr, setPhoneErr] = useState("");
  const displayPhoneErr = phoneErr || errors.phone || "";

  // ── Skeleton أثناء تحميل auth state ──────────────────────────────────────
  if (authLoading) {
    return (
      <div className="px-4 sm:px-6 py-5 space-y-3 animate-pulse">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="h-3 w-48 bg-gray-100 rounded" />
        <div className="h-3 w-40 bg-gray-100 rounded" />
      </div>
    );
  }

  // ── المستخدم المسجل — عرض ملخص ───────────────────────────────────────────
  if (isAuthenticated && confirmed) {
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
    return (
      <div className="px-4 sm:px-6 py-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#1A2E44]">
          {fullName ? `حيّاك، ${fullName}` : "حيّاك"}
        </p>
        <button
          onClick={onEdit}
          className="text-xs font-medium text-gray-400 hover:text-[#1A2E44] transition shrink-0"
        >
          تعديل
        </button>
      </div>
    );
  }

  // ── الضيف — confirmed ─────────────────────────────────────────────────────
  if (!isAuthenticated && confirmed) {
    return (
      <div className="px-4 sm:px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1A2E44]">
            {data.firstName ? `${data.firstName} ${data.lastName}`.trim() : "ضيف"}
          </p>
          <p className="text-xs text-gray-400 font-mono" dir="ltr">{data.phone}</p>
        </div>
        <button onClick={onEdit} className="text-xs font-medium text-gray-400 hover:text-[#1A2E44] transition">تعديل</button>
      </div>
    );
  }

  // ── فورم التعديل / الإدخال ────────────────────────────────────────────────
  const missingPhone = isAuthenticated && !data.phone;

  return (
    <div className="px-4 sm:px-6 py-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#1A2E44]">
          {isAuthenticated
            ? (data.firstName ? `حيّاك، ${data.firstName}` : "حيّاك")
            : "بيانات التواصل"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {isAuthenticated
            ? "يمكنك تعديل بيانات التواصل لهذا الطلب إذا رغبت."
            : "أدخل بيانات التواصل لإتمام طلبك."}
        </p>
      </div>

      {/* للمستخدم المسجل: أظهر كل الحقول للتعديل */}
      {isAuthenticated && !missingPhone ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الاسم الأول" value={data.firstName} error={errors.firstName}
              placeholder="أدخل اسمك الأول"
              onChange={v => onChange("firstName", v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ""))} />
            <Field label="الاسم الأخير" value={data.lastName} error={errors.lastName}
              placeholder="أدخل اسمك الأخير"
              onChange={v => onChange("lastName", v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ""))} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-gray-600">رقم الجوال</label>
              {displayPhoneErr && <PhoneErrBadge msg={displayPhoneErr} />}
            </div>
            <PhoneInput
              defaultCountry="SA" international countryCallingCodeEditable={false} labels={ar}
              value={data.phone as PhoneValue}
              onChange={v => { const val = v ?? ""; onChange("phone", val); if (!val) setPhoneErr("رقم الجوال مطلوب"); else if (!isValidPhoneNumber(val)) setPhoneErr("رقم غير صحيح"); else setPhoneErr(""); }}
              onBlur={() => { if (!data.phone) setPhoneErr("رقم الجوال مطلوب"); else if (!isValidPhoneNumber(data.phone)) setPhoneErr("رقم غير صحيح"); }}
              countrySelectComponent={CustomCountrySelect}
              numberInputProps={{ placeholder: "5XXXXXXXX", inputMode: "numeric" }}
              className={`custom-phone-input ${displayPhoneErr ? "phone-error" : ""}`}
            />
          </div>
          <Field label="البريد الإلكتروني" value={data.email} placeholder="example@mail.com"
            dir="ltr" inputMode="email" onChange={v => onChange("email", v)} />
        </>
      ) : isAuthenticated && missingPhone ? (
        // فقط حقل الجوال الناقص
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-gray-600">رقم الجوال</label>
            {displayPhoneErr && <PhoneErrBadge msg={displayPhoneErr} />}
          </div>
          <PhoneInput
            defaultCountry="SA" international countryCallingCodeEditable={false} labels={ar}
            value={data.phone as PhoneValue}
            onChange={v => { const val = v ?? ""; onChange("phone", val); if (!val) setPhoneErr("رقم الجوال مطلوب"); else if (!isValidPhoneNumber(val)) setPhoneErr("رقم غير صحيح"); else setPhoneErr(""); }}
            onBlur={() => { if (!data.phone) setPhoneErr("رقم الجوال مطلوب"); else if (!isValidPhoneNumber(data.phone)) setPhoneErr("رقم غير صحيح"); }}
            countrySelectComponent={CustomCountrySelect}
            numberInputProps={{ placeholder: "5XXXXXXXX", inputMode: "numeric" }}
            className={`custom-phone-input ${displayPhoneErr ? "phone-error" : ""}`}
          />
        </div>
      ) : (
        // ضيف — كل الحقول
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الاسم الأول" value={data.firstName} error={errors.firstName}
              placeholder="أدخل اسمك الأول"
              onChange={v => onChange("firstName", v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ""))} />
            <Field label="الاسم الأخير" value={data.lastName} error={errors.lastName}
              placeholder="أدخل اسمك الأخير"
              onChange={v => onChange("lastName", v.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ""))} />
          </div>
          <Field label="البريد الإلكتروني (اختياري)" value={data.email}
            placeholder="example@mail.com" dir="ltr" inputMode="email"
            onChange={v => onChange("email", v)} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-gray-600">رقم الجوال</label>
              {displayPhoneErr && <PhoneErrBadge msg={displayPhoneErr} />}
            </div>
            <PhoneInput
              defaultCountry="SA" international countryCallingCodeEditable={false} labels={ar}
              value={data.phone as PhoneValue}
              onChange={v => { const val = v ?? ""; onChange("phone", val); if (!val) setPhoneErr("رقم الجوال مطلوب"); else if (!isValidPhoneNumber(val)) setPhoneErr("رقم غير صحيح"); else setPhoneErr(""); }}
              onBlur={() => { if (!data.phone) setPhoneErr("رقم الجوال مطلوب"); else if (!isValidPhoneNumber(data.phone)) setPhoneErr("رقم غير صحيح"); }}
              countrySelectComponent={CustomCountrySelect}
              numberInputProps={{ placeholder: "5XXXXXXXX", inputMode: "numeric" }}
              className={`custom-phone-input ${displayPhoneErr ? "phone-error" : ""}`}
            />
          </div>
        </>
      )}

      <button
        onClick={onConfirm}
        className="w-full py-3 text-white font-black text-sm sm:text-base hover:opacity-90 transition"
        style={{ background: "linear-gradient(135deg,#63D3A8,#56CFA1)" }}
      >
        تأكيد
      </button>
    </div>
  );
}

function PhoneErrBadge({ msg }: { msg: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-red-500 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
      {msg}
    </span>
  );
}

export function validateCustomer(data: CustomerData): Record<string, string> {
  const e: Record<string, string> = {};
  if (!data.firstName.trim()) e.firstName = "مطلوب";
  if (!data.lastName.trim()) e.lastName = "مطلوب";
  if (!data.phone) e.phone = "مطلوب";
  else {
    try {
      if (!isValidPhoneNumber(data.phone)) e.phone = "رقم غير صحيح";
    } catch { e.phone = "رقم غير صحيح"; }
  }
  return e;
}
