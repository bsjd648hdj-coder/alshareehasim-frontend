"use client";
import type { Category } from "../types";

interface EditModalProps {
  editCat: Category;
  editName: string;
  editError: string;
  editLoading: boolean;
  onNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function EditModal({ editCat, editName, editError, editLoading, onNameChange, onSubmit, onClose }: EditModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">تعديل: {editCat.name}</h2>
        {editCat.count > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            ⚠️ سيتم تغيير اسم التصنيف في <span className="font-bold">{editCat.count} منتج</span>
          </p>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm text-gray-600 mb-1">اسم التصنيف</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {editError && <p className="text-red-500 text-xs sm:text-sm">{editError}</p>}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={editLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
              {editLoading ? "جاري الحفظ..." : "حفظ"}
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
