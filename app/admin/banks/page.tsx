"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import { isValidIBAN, friendlyFormatIBAN } from "ibantools";

type Bank = { _id: string; name: string; iban: string; logo: string };

type EditState = { name: string; iban: string; logoFile: File | null; preview: string };

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState>({ name: "", iban: "", logoFile: null, preview: "" });
  const [saving, setSaving] = useState(false);
  const [ibanError, setIbanError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/banks", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { setBanks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const startEdit = (bank: Bank) => {
    setEditId(bank._id);
    setEdit({ name: bank.name, iban: bank.iban, logoFile: null, preview: bank.logo });
    setIbanError("");
  };

  const cancelEdit = () => { setEditId(null); setIbanError(""); };

  const handleIbanChange = (raw: string) => {
    const val = raw.replace(/\s/g, "").toUpperCase();
    setEdit((p) => ({ ...p, iban: val }));
    setIbanError(val && !isValidIBAN(val) ? "الآيبان غير صحيح" : "");
  };

  const saveEdit = async () => {
    if (!edit.name.trim() || !edit.iban.trim()) { toast.error("الاسم والآيبان مطلوبان"); return; }
    if (!isValidIBAN(edit.iban)) { toast.error("الآيبان غير صحيح"); return; }
    setSaving(true);
    const formData = new FormData();
    formData.append("name", edit.name.trim());
    formData.append("iban", edit.iban.replace(/\s/g, ""));
    if (edit.logoFile) formData.append("logo", edit.logoFile);
    const res = await fetch(`/api/admin/banks/${editId}`, { method: "PUT", credentials: "include", body: formData });
    setSaving(false);
    if (res.ok) {
      const updated: Bank = await res.json();
      setBanks((prev) => prev.map((b) => (b._id === editId ? updated : b)));
      setEditId(null);
      toast.success("تم التعديل");
    } else {
      toast.error("فشل التعديل");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/banks/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleting(false);
    if (res.ok) { setBanks((prev) => prev.filter((b) => b._id !== deleteId)); toast.success("تم الحذف"); }
    else toast.error("فشل الحذف");
    setDeleteId(null);
  };

  const filtered = banks.filter((b) => b.name.includes(search) || b.iban.includes(search)).slice(0, perPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">بيانات البنوك</h1>
        <Link
          href="/admin/banks/add"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={16} />
          إضافة بنك جديد
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            أظهر
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>
            مدخلات
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            ابحث:
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        {/* موبايل: كاردات */}
        <div className="sm:hidden divide-y divide-gray-100">
          {loading ? (
            <p className="text-center py-8 text-gray-400">جاري التحميل...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-gray-400">ليست هناك بيانات متاحة</p>
          ) : (
            filtered.map((bank) => (
              <div key={bank._id} className="p-4 space-y-3">
                {editId === bank._id ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-dashed border-gray-300 cursor-pointer flex items-center justify-center bg-gray-50"
                      >
                        {edit.preview ? (
                          <Image src={edit.preview} alt="" width={40} height={40} className="object-contain" />
                        ) : (
                          <span className="text-gray-400 text-xs">صورة</span>
                        )}
                      </div>
                      <input
                        value={edit.name}
                        onChange={(e) => setEdit((p) => ({ ...p, name: e.target.value }))}
                        placeholder="اسم البنك"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                    <input
                      value={edit.iban ? friendlyFormatIBAN(edit.iban) ?? edit.iban : ""}
                      onChange={(e) => handleIbanChange(e.target.value)}
                      placeholder="الآيبان"
                      dir="ltr"
                      className={`w-full border rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 ${
                        ibanError ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-purple-300"
                      }`}
                    />
                    {ibanError && <p className="text-xs text-red-500">{ibanError}</p>}
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1">
                        <Check size={14} /> حفظ
                      </button>
                      <button onClick={cancelEdit} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-50">
                        <X size={14} /> إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {bank.logo ? (
                      <Image src={bank.logo} alt={bank.name} width={44} height={44} className="rounded-lg object-contain shrink-0" />
                    ) : (
                      <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs shrink-0">لا يوجد</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{bank.name}</p>
                      <p className="text-xs text-gray-500 font-mono truncate" dir="ltr">{bank.iban}</p>
                    </div>
                    <button onClick={() => startEdit(bank)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors shrink-0">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteId(bank._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ديسكتوب: جدول */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-600 font-semibold">
              <tr>
                <th className="px-4 py-3">الشعار</th>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">الآيبان</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">ليست هناك بيانات متاحة في الجدول</td></tr>
              ) : (
                filtered.map((bank) => (
                  <tr key={bank._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {editId === bank._id ? (
                        <div
                          onClick={() => fileRef.current?.click()}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-dashed border-gray-300 cursor-pointer flex items-center justify-center bg-gray-50"
                        >
                          {edit.preview ? (
                            <Image src={edit.preview} alt="" width={40} height={40} className="object-contain" />
                          ) : (
                            <span className="text-gray-400 text-xs">صورة</span>
                          )}
                        </div>
                      ) : bank.logo ? (
                        <Image src={bank.logo} alt={bank.name} width={40} height={40} className="rounded-lg object-contain" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">لا يوجد</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {editId === bank._id ? (
                        <input
                          value={edit.name}
                          onChange={(e) => setEdit((p) => ({ ...p, name: e.target.value }))}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                      ) : bank.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono">
                      {editId === bank._id ? (
                        <div>
                          <input
                            value={edit.iban ? friendlyFormatIBAN(edit.iban) ?? edit.iban : ""}
                            onChange={(e) => handleIbanChange(e.target.value)}
                            dir="ltr"
                            className={`border rounded-lg px-3 py-1.5 text-sm w-full font-mono focus:outline-none focus:ring-2 ${
                              ibanError ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-purple-300"
                            }`}
                          />
                          {ibanError && <p className="text-xs text-red-500 mt-0.5">{ibanError}</p>}
                        </div>
                      ) : bank.iban}
                    </td>
                    <td className="px-4 py-3">
                      {editId === bank._id ? (
                        <div className="flex gap-1">
                          <button onClick={saveEdit} disabled={saving} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-60">
                            <Check size={16} />
                          </button>
                          <button onClick={cancelEdit} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(bank)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteId(bank._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>يعرض 0 إلى {filtered.length} من أصل {banks.length} سجل</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40" disabled>السابق</button>
            <button className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40" disabled>التالي</button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={26} className="text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">حذف البنك</p>
              <p className="text-sm text-gray-500 mt-1">هل أنت متأكد من حذف هذا البنك؟ لا يمكن التراجع.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                {deleting ? "جاري الحذف..." : "حذف"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* hidden file input for logo edit */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setEdit((p) => ({ ...p, logoFile: file, preview: URL.createObjectURL(file) }));
          e.target.value = "";
        }}
      />
    </div>
  );
}
