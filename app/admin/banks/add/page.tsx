"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { isValidIBAN, friendlyFormatIBAN } from "ibantools";

export default function AddBankPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [iban, setIban] = useState("");
  const [ibanError, setIbanError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "").toUpperCase();
    setIban(raw);
    if (raw && !isValidIBAN(raw)) {
      setIbanError("الآيبان غير صحيح");
    } else {
      setIbanError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !iban.trim()) {
      toast.error("اسم البنك والآيبان مطلوبان");
      return;
    }
    if (!isValidIBAN(iban)) {
      toast.error("الآيبان غير صحيح");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("iban", iban.replace(/\s/g, ""));
    if (logoFile) formData.append("logo", logoFile);

    const res = await fetch("/api/admin/banks", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    setLoading(false);
    if (res.ok) {
      toast.success("تم إضافة البنك");
      router.push("/admin/banks");
    } else {
      const data = await res.json();
      toast.error(data.error || "فشل الإضافة");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 px-2 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-800">إضافة بنك جديد</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">اسم البنك</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: البنك الأهلي السعودي (SNB)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">الآيبان</label>
          <input
            value={iban ? friendlyFormatIBAN(iban) ?? iban : ""}
            onChange={handleIbanChange}
            placeholder="SA00 0000 0000 0000 0000 0000"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 ${
              ibanError ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-purple-300"
            }`}
            dir="ltr"
          />
          {ibanError && <p className="text-xs text-red-500 mt-1">{ibanError}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">الشعار</label>
          <div
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-purple-400 transition-colors"
          >
            {preview ? (
              <Image src={preview} alt="preview" width={48} height={48} className="rounded-lg object-contain" />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">صورة</div>
            )}
            <span className="text-sm text-gray-500">{logoFile ? logoFile.name : "No file chosen"}</span>
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            {loading ? "جاري الإضافة..." : "إضافة"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/banks")}
            className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            رجوع
          </button>
        </div>
      </form>
    </div>
  );
}
