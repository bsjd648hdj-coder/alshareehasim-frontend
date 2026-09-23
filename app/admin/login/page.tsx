"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "حدث خطأ");
      else router.push("/admin/dashboard");
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-4 py-6 sm:py-10" dir="rtl">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-2xl shadow-md overflow-hidden">

        {/* العنوان */}
        <div className="px-5 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full mb-4 border border-purple-100">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shrink-0" />
            منطقة المشرفين
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">مرحباً بك 👋</h1>
          <p className="text-gray-500 text-xs sm:text-sm md:text-base">سجّل دخولك للوصول إلى لوحة التحكم</p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8">

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* البريد */}
            <div>
              <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="admin@sahlnaha.com"
                  className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-3 sm:py-3.5 pr-11 text-xs sm:text-sm md:text-base text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative group">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-3 sm:py-3.5 pr-11 pl-11 text-xs sm:text-sm md:text-base text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors touch-manipulation"
                >
                  {showPass ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* زرار الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-l from-purple-700 to-blue-500 text-white font-bold py-3 sm:py-3.5 md:py-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-200 active:scale-[0.98] hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base touch-manipulation mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  جاري التحقق...
                </>
              ) : (
                <>
                  دخول إلى لوحة التحكم
                  <svg className="w-4 h-4 shrink-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* فوتر */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">مخصص للمشرفين فقط 🔒</p>
            <Link href="/" className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors flex items-center gap-1.5 touch-manipulation">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              العودة للمتجر
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
