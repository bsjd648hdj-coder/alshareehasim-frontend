"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


type Admin = { _id: string; name: string; email: string; phone: string; createdAt: string };

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

export default function UsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddPass, setShowAddPass] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [editFormErrors, setEditFormErrors] = useState({ email: "", password: "" });

  const arabicRegex = /[\u0600-\u06FF]/;
  const objectIdRegex = /^[a-f0-9]{24}$/i;
  function safeId(id: string) { return objectIdRegex.test(id) ? id : ""; }
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\u0600-\u06FF]).{8,}$/;

  function validateEmail(val: string) {
    if (arabicRegex.test(val)) return "❌ البريد الإلكتروني لا يقبل أحرفاً عربية";
    if (val && !emailRegex.test(val)) return "❌ صيغة البريد الإلكتروني غير صحيحة";
    return "";
  }

  function validatePassword(val: string) {
    if (arabicRegex.test(val)) return "❌ كلمة المرور لا تقبل أحرفاً عربية";
    if (val.length > 0 && val.length < 8) return "❌ يجب أن تكون 8 أحرف على الأقل";
    if (val.length >= 8 && !/[a-zA-Z]/.test(val)) return "❌ يجب أن تحتوي على حروف إنجليزية";
    if (val.length >= 8 && !/[0-9]/.test(val)) return "❌ يجب أن تحتوي على أرقام";
    if (val.length >= 8 && !/[^a-zA-Z0-9]/.test(val)) return "❌ يجب أن تحتوي على علامة خاصة مثل @ # $ !";
    return "";
  }

  const ADMIN_USERS_URL = "/api/admin/users" as const;

  async function fetchAdmins() {
    const res = await fetch(ADMIN_USERS_URL);
    if (res.ok) setAdmins(await res.json());
  }

  useEffect(() => {
    fetch(ADMIN_USERS_URL).then((res) => res.ok ? res.json() : null).then((data) => { if (data) setAdmins(data); });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);
    setFormErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setShowModal(false);
    setForm({ name: "", phone: "", email: "", password: "" });
    toast.success(`تم إضافة ${form.name} بنجاح 🎉`);
    fetchAdmins();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(editForm.email);
    const passErr = editForm.password ? validatePassword(editForm.password) : "";
    setEditFormErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;
    setEditError("");
    setEditLoading(true);
    const id = safeId(editAdmin!._id);
    if (!id) return setEditError("معرّف غير صالح");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setEditLoading(false);
    if (!res.ok) return setEditError(data.error);
    setEditAdmin(null);
    toast.success("تم حفظ التعديلات بنجاح ✅");
    fetchAdmins();
  }

  async function handleDelete(id: string, name: string) {
    setConfirmDelete({ id, name });
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    const { id, name } = confirmDelete;
    setConfirmDelete(null);
    const safeDeleteId = safeId(id);
    if (!safeDeleteId) return toast.error("معرّف غير صالح");
    const res = await fetch(`/api/admin/users/${safeDeleteId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    toast.success(`تم حذف ${name} بنجاح ✅`);
    fetchAdmins();
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
        >
          + إضافة مستخدم
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-right min-w-[500px]">
          <thead className="bg-gray-50 text-gray-600 font-semibold text-base">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">البريد الإلكتروني</th>

              <th className="px-4 py-3">تاريخ الإضافة</th>
              <th className="px-4 py-3">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {admins.map((a, i) => (
              <tr key={a._id} className="hover:bg-gray-50 text-base">
                <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                <td className="px-4 py-3 text-gray-600">{a.email}</td>

                <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString("ar-EG")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setEditAdmin(a); setEditForm({ name: a.name, phone: a.phone, email: a.email, password: "" }); setEditError(""); setEditFormErrors({ email: "", password: "" }); }}
                      className="text-blue-500 hover:text-blue-700" title="تعديل">
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(a._id, a.name)} className="text-red-500 hover:text-red-700" title="حذف">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">لا يوجد مستخدمون</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {editAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">تعديل: {editAdmin.name}</h2>
            <form onSubmit={handleEdit} className="space-y-3">
              {[
                { label: "الاسم", key: "name", type: "text" },
                { label: "الهاتف", key: "phone", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={editForm[key as keyof typeof editForm]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-600 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => { setEditForm({ ...editForm, email: e.target.value }); setEditFormErrors((p) => ({ ...p, email: validateEmail(e.target.value) })); }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${editFormErrors.email ? "border-red-400" : "border-gray-300"}`}
                  required
                  dir="ltr"
                  placeholder="example@email.com"
                />
                {editFormErrors.email && <p className="text-red-500 text-xs mt-1">{editFormErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">كلمة المرور (اتركها فارغة إن لم ترد تغييرها)</label>
                <div className="relative">
                  <input
                    type={showEditPass ? "text" : "password"}
                    value={editForm.password}
                    onChange={(e) => { setEditForm({ ...editForm, password: e.target.value }); setEditFormErrors((p) => ({ ...p, password: e.target.value ? validatePassword(e.target.value) : "" })); }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 ${editFormErrors.password ? "border-red-400" : "border-gray-300"}`}
                    placeholder="اتركها فارغة للإبقاء كما هي"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showEditPass ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {editFormErrors.password && <p className="text-red-500 text-xs mt-1">{editFormErrors.password}</p>}
              {editError && <p className="text-red-500 text-sm">{editError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={editLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
                  {editLoading ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button type="button" onClick={() => setEditAdmin(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
            <p className="text-sm text-gray-500 mb-1">هتحذف الأدمن</p>
            <p className="text-base font-bold text-red-600 mb-4">« {confirmDelete.name} »</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmDeleteAction}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="border border-gray-300 text-gray-700 text-sm font-bold px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">إضافة مستخدم جديد</h2>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mt-0.5 shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-amber-700 text-sm">سيمتلك هذا المستخدم <span className="font-semibold">صلاحيات الأدمن الكاملة</span> على لوحة التحكم</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              {[
                { label: "الاسم", key: "name", type: "text" },
                { label: "الهاتف", key: "phone", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-600 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setFormErrors((p) => ({ ...p, email: validateEmail(e.target.value) })); }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? "border-red-400" : "border-gray-300"}`}
                  required
                  dir="ltr"
                  placeholder="example@email.com"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                {!formErrors.email && form.email && emailRegex.test(form.email) && <p className="text-green-500 text-xs mt-1">✅ بريد إلكتروني صحيح</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">كلمة المرور</label>
                <p className="text-xs text-gray-400 mb-1">يجب أن تحتوي على حروف إنجليزية + أرقام + علامات خاصة مثل @ # $ ! — ولا تقبل أحرفاً عربية</p>
                <div className="relative">
                  <input
                    type={showAddPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setFormErrors((p) => ({ ...p, password: validatePassword(e.target.value) })); }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 ${formErrors.password ? "border-red-400" : "border-gray-300"}`}
                    required
                    dir="ltr"
                    placeholder="Ex: Admin@123"
                  />
                  <button type="button" onClick={() => setShowAddPass(!showAddPass)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showAddPass ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                {!formErrors.password && passwordRegex.test(form.password) && <p className="text-green-500 text-xs mt-1">✅ كلمة مرور قوية</p>}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
                  {loading ? "جاري الإضافة..." : "إضافة"}
                </button>
                <button type="button"
                  onClick={() => { setShowModal(false); setForm({ name: "", phone: "", email: "", password: "" }); setError(""); setShowAddPass(false); setFormErrors({ email: "", password: "" }); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
