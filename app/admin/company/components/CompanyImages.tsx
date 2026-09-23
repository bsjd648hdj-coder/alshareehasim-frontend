"use client";
import { memo, useState } from "react";
import { imageFields } from "../constants";
import type { CompanyData } from "../types";

interface CompanyImagesProps {
  data: CompanyData;
  onImageChange: (key: string, file: File) => Promise<void>;
  onImageDelete: (key: string) => Promise<void>;
}

const CompanyImages = function CompanyImages({ data, onImageChange, onImageDelete }: CompanyImagesProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleUpload = async (key: string, file: File) => {
    setLoadingKey(key);
    try { await onImageChange(key, file); } finally { setLoadingKey(null); }
  };

  const handleDelete = async (key: string) => {
    setLoadingKey(key);
    try { await onImageDelete(key); } finally { setLoadingKey(null); }
  };

  return (
    <div>
      <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-sm w-full mb-3">
        <span className="shrink-0">⚠️</span>
        <span>رفع الصورة قد يستغرق بضع ثوانٍ حسب حجمها وسرعة الإنترنت — لا تنسَ الضغط على حفظ بعد الانتهاء</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {imageFields.map(({ key, label }) => {
          const isLoading = loadingKey === key;
          return (
            <div key={key} className={isLoading ? "opacity-60 pointer-events-none" : ""}>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                {label}
                {isLoading && <span className="mr-1 text-blue-500 text-xs">جاري...</span>}
              </label>
              {data[key] && (
                <div className="relative inline-block mb-2">
                  <img src={data[key]} alt={label} className="h-14 object-contain rounded border" />
                  <button
                    type="button"
                    onClick={() => handleDelete(key)}
                    disabled={isLoading}
                    className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none disabled:opacity-50"
                    title="حذف الصورة"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                disabled={isLoading}
                onChange={(e) => e.target.files?.[0] && handleUpload(key, e.target.files[0])}
                className="w-full text-xs sm:text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 sm:file:py-1.5 sm:file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 disabled:opacity-50"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CompanyImages, (prev, next) => {
  return imageFields.every((f) => prev.data[f.key as keyof CompanyData] === next.data[f.key as keyof CompanyData]);
});
