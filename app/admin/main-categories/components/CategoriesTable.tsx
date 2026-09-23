"use client";
import type { Category } from "../types";

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

interface CategoriesTableProps {
  categories: Category[];
  filtered: Category[];
  search: string;
  loading?: boolean;
  onSearchChange: (v: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (name: string) => void;
}

export default function CategoriesTable({ categories, filtered, search, loading, onSearchChange, onEdit, onDelete }: CategoriesTableProps) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-gray-100">
        <span className="text-xs sm:text-sm text-gray-500">إجمالي التصنيفات: <span className="font-bold text-gray-700">{categories.length}</span></span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث عن تصنيف..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 md:w-52"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm">
            <tr>
              <th className="px-3 sm:px-4 py-3">#</th>
              <th className="px-3 sm:px-4 py-3">اسم التصنيف</th>
              <th className="px-3 sm:px-4 py-3">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-3 sm:px-4 py-3"><div className="h-4 w-6 bg-gray-200 rounded animate-pulse" /></td>
                  <td className="px-3 sm:px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                  <td className="px-3 sm:px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : (
              <>
                {filtered.map((cat, i) => (
                  <tr key={cat.name} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3 text-gray-400 font-medium text-xs sm:text-sm">{i + 1}</td>
                    <td className="px-3 sm:px-4 py-3 font-medium text-gray-800 text-sm sm:text-base">{cat.name}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={() => onEdit(cat)} className="text-blue-500 hover:text-blue-700" title="تعديل">
                          <EditIcon />
                        </button>
                        <button onClick={() => onDelete(cat.name)} className="text-red-500 hover:text-red-700" title="حذف">
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">لا توجد تصنيفات</td></tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
