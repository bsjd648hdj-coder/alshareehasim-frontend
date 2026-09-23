"use client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

type SubCat = { name: string; category: string; count: number };
type Settings = { category: string; subCategory: string; showInHome: boolean; order: number };
type CatImage = { name: string; image: string };

export default function CategoryItemsPage() {
  const [items, setItems] = useState<SubCat[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [max, setMax] = useState(4);
  const [maxInput, setMaxInput] = useState(4);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [categories, setCategories] = useState<CatImage[]>([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string>("");

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/sub-categories", { credentials: "include" }).then((r) => r.json()),
      apiFetch("/api/admin/sub-categories/settings", { credentials: "include" }).then((r) => r.json()),
      apiFetch("/api/admin/sub-categories/public").then((r) => r.json()),
    ])
      .then(([subs, settingsData, cats]) => {
        setItems(subs);
        setSettings(settingsData.settings ?? settingsData);
        const m = settingsData.max ?? 4;
        setMax(m);
        setMaxInput(m);
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
        toast.error("فشل تحميل البيانات، حاول مجدداً");
      });
  }, []);

  // تنظيف الـ object URL عند unmount أو تغيير الصورة
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  async function handleSaveMax() {
    if (maxInput < 1) return toast.error("الحد الأدنى 1");
    setSaving(true);
    const res = await apiFetch("/api/admin/sub-categories/settings/max", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ max: maxInput }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("حدث خطأ");
    setMax(maxInput);
    toast.success(`تم تحديث الحد إلى ${maxInput} ✅`);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setHasFile(!!file);
    if (!file) return;
    // تنظيف الـ URL القديم قبل إنشاء جديد
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreview(url);
  }

  function resetFileState() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setPreview("");
    setHasFile(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleUploadImage() {
    if (!selectedCat) return toast.error("اختر تصنيفاً أولاً");
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("اختر صورة أولاً");
    setUploading(true);
    const fd = new FormData();
    fd.append("category", selectedCat);
    fd.append("image", file);
    const res = await apiFetch("/api/admin/sub-categories/settings/image", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    setUploading(false);
    if (!res.ok) return toast.error("حدث خطأ أثناء الرفع");
    const { url } = await res.json();
    setCategories((prev) => prev.map((c) => c.name === selectedCat ? { ...c, image: url } : c));
    resetFileState();
    toast.success("تم رفع الصورة بنجاح ✅");
  }

  const currentImage = categories.find((c) => c.name === selectedCat)?.image ?? "";

  const visible = settings
    .filter((s) => s.showInHome && s.category !== "__config__")
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const item = items.find((i) => i.category === s.category && i.name === s.subCategory);
      return { ...s, count: item?.count ?? 0 };
    });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-500 font-semibold">فشل تحميل البيانات</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">التصنيفات في الرئيسية</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visible.length >= max ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>
          {visible.length}/{max}
        </span>
      </div>

      {/* Max control */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">الحد الأقصى للتصنيفات في الرئيسية:</span>
        <input
          type="number"
          min={1}
          max={20}
          value={maxInput}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setMaxInput(isNaN(val) ? 1 : Math.max(1, val));
          }}
          className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSaveMax}
          disabled={saving || maxInput === max}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
        {visible.length > maxInput && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            ⚠️ يوجد {visible.length} تصنيف مختار، سيظهر أول {maxInput} فقط
          </span>
        )}
      </div>

      {/* Category image upload */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">صورة التصنيف في قسم &quot;تسوق حسب الأقسام&quot;</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">اختر التصنيف</label>
            <select
              value={selectedCat}
              onChange={(e) => { setSelectedCat(e.target.value); resetFileState(); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            >
              <option value="">-- اختر --</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedCat && (
            <>
              {(preview || currentImage) && (
                <img src={preview || currentImage} alt="" className="w-16 h-16 object-cover rounded-lg border" />
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">ارفع صورة جديدة</label>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange}
                  className="text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <button
                onClick={handleUploadImage}
                disabled={uploading || !hasFile}
                className="bg-teal-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "جاري الرفع..." : "رفع الصورة"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[500px]">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm">
              <tr>
                <th className="px-4 py-3">الترتيب</th>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">عدد المنتجات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">جاري التحميل...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">لا توجد تصنيفات معروضة في الرئيسية</td></tr>
              ) : (
                visible.map((s, i) => (
                  <tr key={`${s.category}-${s.subCategory}`} className={`hover:bg-gray-50 ${i >= max ? "opacity-40" : ""}`}>
                    <td className="px-4 py-3 text-gray-400 font-medium text-xs sm:text-sm">
                      {i + 1}
                      {i >= max && <span className="mr-1 text-xs text-red-400">(مخفي)</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm">{s.category}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm">{s.subCategory}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${s.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {s.count} منتج
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
