"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

type Brand = { name: string; count: number };
type BrandSetting = { brand: string; showInHome: boolean; order: number; bannerImages?: string[] };

const MAX_BANNER_SIZE_MB = 5;
const PAGE_SIZE = 10;

function useDebounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback((...args: Parameters<T>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

import React from 'react';

const BrandRow = React.memo(function BrandRow({
  brand,
  index,
  setting,
  onToggle,
  onOrderChange,
  onBannerDelete,
  onBannerUpload,
}: {
  brand: Brand;
  index: number;
  setting?: BrandSetting;
  onToggle: (name: string) => void;
  onOrderChange: (name: string, order: number) => void;
  onBannerDelete: (name: string, url: string) => void;
  onBannerUpload: (name: string, file: File) => void;
}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-2 sm:px-4 py-3 text-gray-400 text-xs sm:text-sm">{index}</td>
      <td className="px-2 sm:px-4 py-3 font-medium text-gray-800">{brand.name}</td>
      <td className="px-2 sm:px-4 py-3">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${brand.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          {brand.count} منتج
        </span>
      </td>
      <td className="px-2 sm:px-4 py-3 text-center">
        <input
          type="checkbox"
          checked={setting?.showInHome ?? false}
          onChange={() => onToggle(brand.name)}
          className="w-4 h-4 accent-blue-600 cursor-pointer"
        />
      </td>
      <td className="px-2 sm:px-4 py-3 text-center">
        <input
          type="number"
          min={0}
          key={`${brand.name}-${setting?.order ?? 0}`}
          defaultValue={setting?.order ?? 0}
          onChange={(e) => onOrderChange(brand.name, parseInt(e.target.value) || 0)}
          disabled={!setting?.showInHome}
          className="w-16 border border-gray-300 rounded px-2 py-1 text-xs text-center text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-2 sm:px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          {setting?.bannerImages?.map((url) => (
            <div key={url} className="flex items-center gap-2">
              <img src={url} alt="banner" className="h-8 w-16 object-cover rounded border border-gray-200" />
              <button onClick={() => onBannerDelete(brand.name, url)} className="text-red-500 hover:text-red-700 text-xs font-bold">حذف</button>
            </div>
          ))}
          <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 border border-blue-200 text-blue-600 text-xs hover:bg-blue-100">
            ↑ رفع
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onBannerUpload(brand.name, f); e.target.value = ""; }} />
          </label>
        </div>
      </td>
    </tr>
  );
}, (prev, next) => {
  return (
    prev.brand.name === next.brand.name &&
    prev.brand.count === next.brand.count &&
    prev.index === next.index &&
    prev.setting?.showInHome === next.setting?.showInHome &&
    prev.setting?.order === next.setting?.order &&
    JSON.stringify(prev.setting?.bannerImages) === JSON.stringify(next.setting?.bannerImages)
  );
});

export default function SubCategoriesPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [settings, setSettings] = useState<BrandSetting[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function getSetting(brand: string): BrandSetting | undefined {
    return settings.find((s) => s.brand === brand);
  }

  async function fetchData() {
    setLoading(true);
    setError(false);
    try {
      const [r1, r2] = await Promise.all([
        apiFetch("/api/admin/brands", { credentials: "include" }),
        apiFetch("/api/admin/brands/settings", { credentials: "include" }),
      ]);
      if (!r1.ok || !r2.ok) throw new Error();
      setBrands(await r1.json());
      setSettings(await r2.json());
    } catch {
      setError(true);
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleToggle(brand: string) {
    const res = await apiFetch("/api/admin/brands/settings/toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ brand }),
    });
    if (!res.ok) return toast.error("حدث خطأ");
    const { showInHome } = await res.json();
    setSettings((prev) => {
      const exists = prev.find((s) => s.brand === brand);
      if (exists) return prev.map((s) => s.brand === brand ? { ...s, showInHome } : s);
      return [...prev, { brand, showInHome, order: 0 }];
    });
    toast.success(showInHome ? "سيظهر في الرئيسية ✅" : "تم الإخفاء من الرئيسية");
  }

  const sendOrderChange = useCallback(async (brand: string, order: number) => {
    await apiFetch("/api/admin/brands/settings/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ brand, order }),
    });
    setSettings((prev) => {
      const exists = prev.find((s) => s.brand === brand);
      if (exists) return prev.map((s) => s.brand === brand ? { ...s, order } : s);
      return [...prev, { brand, showInHome: false, order }];
    });
  }, []);

  const debouncedOrderChange = useDebounce(sendOrderChange, 600);

  async function handleBannerUpload(brand: string, file: File) {
    if (file.size > MAX_BANNER_SIZE_MB * 1024 * 1024) {
      return toast.error(`حجم الصورة يجب أن يكون أقل من ${MAX_BANNER_SIZE_MB}MB`);
    }
    const form = new FormData();
    form.append("image", file);
    const res = await apiFetch(`/api/admin/brands/banner/${encodeURIComponent(brand)}`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    if (!res.ok) return toast.error("حدث خطأ في رفع البانر");
    const { bannerImages } = await res.json();
    setSettings((prev) => {
      const exists = prev.find((s) => s.brand === brand);
      if (exists) return prev.map((s) => s.brand === brand ? { ...s, bannerImages } : s);
      return [...prev, { brand, showInHome: false, order: 0, bannerImages }];
    });
    toast.success("تم رفع البانر ✅");
  }

  async function handleBannerDelete(brand: string, url: string) {
    if (!confirm("هل أنت متأكد من حذف هذا البانر؟")) return;
    const res = await apiFetch(`/api/admin/brands/banner/${encodeURIComponent(brand)}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return toast.error("حدث خطأ");
    setSettings((prev) => prev.map((s) => s.brand === brand ? { ...s, bannerImages: s.bannerImages?.filter((u) => u !== url) } : s));
    toast.success("تم حذف البانر");
  }

  const filtered = brands.filter((b) => b.name.includes(search));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-xl shadow animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-500 text-sm">فشل تحميل البيانات</p>
        <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">البراندات</h1>
      </div>

      <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm mb-4">
        <span className="shrink-0">⚠️</span>
        <span>فعّل <span className="font-bold">&quot;عرض في الرئيسية&quot;</span> بجانب البراند عشان منتجاته تظهر في الصفحة الرئيسية، وحدد <span className="font-bold">الترتيب</span> — الرقم الأصغر يظهر أولاً.</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-500">
              إجمالي البراندات: <span className="font-bold text-gray-700">{brands.length}</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
              الرئيسية: {settings.filter((s) => s.showInHome).length}
            </span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="ابحث عن براند..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 md:w-52"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[500px]">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm">
              <tr>
                <th className="px-2 sm:px-4 py-3">#</th>
                <th className="px-2 sm:px-4 py-3">البراند</th>
                <th className="px-2 sm:px-4 py-3">عدد المنتجات</th>
                <th className="px-2 sm:px-4 py-3 text-center">عرض في الرئيسية</th>
                <th className="px-2 sm:px-4 py-3 text-center">الترتيب</th>
                <th className="px-2 sm:px-4 py-3 text-center">البانر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((brand, i) => (
                <BrandRow
                  key={brand.name}
                  brand={brand}
                  index={(currentPage - 1) * PAGE_SIZE + i + 1}
                  setting={getSetting(brand.name)}
                  onToggle={handleToggle}
                  onOrderChange={debouncedOrderChange}
                  onBannerDelete={handleBannerDelete}
                  onBannerUpload={handleBannerUpload}
                />
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">لا توجد براندات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹ السابق
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                page === currentPage ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            التالي ›
          </button>
        </div>
      )}
    </div>
  );
}
