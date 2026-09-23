"use client";
import { useCompany } from "./hooks/useCompany";
import CompanyFields from "./components/CompanyFields";
import CompanyImages from "./components/CompanyImages";

function CompanySkeleton() {
  return (
    <div className="pt-2 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-5">
        {/* Text fields skeleton */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            <div className="space-y-1">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-100 rounded-lg" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
        {/* Image fields skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-14 w-20 bg-gray-100 rounded border" />
            </div>
          ))}
        </div>
        {/* Save button skeleton */}
        <div className="h-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function CompanyPage() {
  const { data, loading, saving, handleChange, handleImageChange, handleImageDelete, handleSave } = useCompany();

  if (loading) return <CompanySkeleton />;

  return (
    <div className="pt-2">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">بيانات الشركة</h1>
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4 sm:space-y-5">
        <CompanyFields data={data} onChange={handleChange} />
        <CompanyImages data={data} onImageChange={handleImageChange} onImageDelete={handleImageDelete} />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 rounded-lg transition disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ البيانات"}
        </button>
      </div>
    </div>
  );
}
