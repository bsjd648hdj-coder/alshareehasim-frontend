"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CardSettingsPage() {
  const [settings, setSettings] = useState<{ showExpiryDate: boolean; showCvv: boolean } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/card-field-settings`, { credentials: "include" })
      .then(r => r.json())
      .then(setSettings);
  }, []);

  const toggle = async (field: "showExpiryDate" | "showCvv") => {
    setLoading(field);
    try {
      const res = await fetch(`/api/admin/card-field-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ field }),
      });
      const data = await res.json();
      setSettings(prev => prev ? { ...prev, [field]: data[field] } : prev);
      toast.success("تم التحديث");
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setLoading(null);
    }
  };

  if (!settings) return <div className="flex justify-center items-center h-40 text-gray-400">جاري التحميل...</div>;

  const items = [
    { field: "showExpiryDate" as const, label: "إظهار تاريخ انتهاء البطاقة" },
    { field: "showCvv" as const, label: "إظهار رمز CVV" },
  ];

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-lg font-bold text-gray-800 mb-4">إعدادات حقول البطاقة</h1>
      <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs mb-6">
        <span className="shrink-0">⚠️</span>
        <span>هذا التأثير سيؤثر على ظهور حقول <strong>تاريخ انتهاء البطاقة</strong> و<strong>رمز CVV</strong> في صفحة الدفع على الموقع — </span>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {items.map(({ field, label }) => (
          <div key={field} className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <button
              onClick={() => toggle(field)}
              disabled={loading === field}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                settings[field] ? "bg-purple-600" : "bg-gray-300"
              } disabled:opacity-60`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  settings[field] ? "translate-x-0.5" : "translate-x-6"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
