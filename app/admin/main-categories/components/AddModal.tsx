"use client";

interface AddModalProps {
  name: string;
  error: string;
  loading: boolean;
  onNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AddModal({ name, error, loading, onNameChange, onSubmit, onClose }: AddModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">إضافة تصنيف جديد</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">اسم التصنيف</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: هواتف ذكية"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
              {loading ? "جاري الإضافة..." : "إضافة"}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
