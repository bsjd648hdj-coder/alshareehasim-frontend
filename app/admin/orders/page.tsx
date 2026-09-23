"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Eye, Printer, CreditCard, FileText, CheckCircle, XCircle,
  FileX, Trash2, ChevronLeft, ChevronRight, Search, RefreshCw,
} from "lucide-react";
import { Order, STATUS } from "./[id]/types";

type SortField = "createdAt" | "total" | "status" | "customer";
type SortDir = "asc" | "desc";

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIMIT = 20;

export default function OrdersPage() {
  const router = useRouter();

  const [data, setData] = useState<OrdersResponse>({ orders: [], total: 0, page: 1, limit: LIMIT, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "confirmed" | "processing" | "ready_to_ship" | "shipped" | "out_for_delivery" | "delivered" | "cancelled">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const buildQuery = useCallback((p: number, s: string) => {
    const q = new URLSearchParams({
      page: String(p),
      limit: String(LIMIT),
      sortField,
      sortDir,
    });
    if (s) q.set("search", s);
    if (statusFilter) q.set("status", statusFilter);
    if (dateFrom) q.set("dateFrom", dateFrom);
    if (dateTo) q.set("dateTo", dateTo);
    return q.toString();
  }, [sortField, sortDir, statusFilter, dateFrom, dateTo]);

  const fetchOrders = useCallback(async (p: number, s: string, showLoading = true) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    if (showLoading) setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders?${buildQuery(p, s)}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("فشل جلب الطلبات");
      const json = await res.json();
      setData({ orders: [], total: 0, page: 1, limit: LIMIT, totalPages: 0, ...json, ...(Array.isArray(json?.orders) ? {} : { orders: [] }) } as OrdersResponse);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("تعذّر تحميل الطلبات، تحقق من الاتصال");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // fetch on filter/page/sort change
  useEffect(() => {
    fetchOrders(page, debouncedSearch);
  }, [page, debouncedSearch, statusFilter, dateFrom, dateTo, sortField, sortDir, fetchOrders]);



  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-purple-600 ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>;
  }

  async function changeStatus(id: string, status: string) {
    setChangingStatus(`${id}-${status}`);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          orders: prev.orders.map((o) => (o._id === id ? { ...o, status: status as Order["status"] } : o)),
        }));
        toast.success("تم تحديث الحالة ✅");
      } else {
        toast.error(json.error || "حدث خطأ");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setChangingStatus(null);
    }
  }

  async function deleteOrder(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          orders: prev.orders.filter((o) => o._id !== id),
          total: prev.total - 1,
        }));
        toast.success("تم حذف الطلب ✅");
      } else {
        toast.error("فشل الحذف");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setSortField("createdAt");
    setSortDir("desc");
  }

  const hasFilters = search || statusFilter || dateFrom || dateTo;

  // Pagination — max 7 buttons
  function paginationPages(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  }

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          الطلبات
          {data.total > 0 && (
            <span className="mr-2 text-sm font-normal text-gray-400">({data.total.toLocaleString("ar-EG")})</span>
          )}
        </h1>
        <button
          onClick={() => fetchOrders(page, debouncedSearch)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          تحديث
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Filters Bar */}
        <div className="flex flex-col gap-3 px-4 py-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pr-8 pl-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="اسم، واتس، هوية، رقم طلب"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="processing">جاري التجهيز</option>
              <option value="ready_to_ship">جاهز للشحن</option>
              <option value="shipped">تم الشحن</option>
              <option value="out_for_delivery">خرج للتسليم</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          {/* Date Range */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs text-gray-500 whitespace-nowrap">من:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs text-gray-500 whitespace-nowrap">إلى:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap px-2 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="w-full text-sm text-right" style={{ minWidth: "1100px" }}>
            <thead className="bg-gray-50 text-gray-600 font-semibold text-base">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-purple-600" onClick={() => handleSort("customer")}>
                  الاسم <SortIcon field="customer" />
                </th>
                <th className="px-4 py-3">رقم الواتس</th>
                <th className="px-4 py-3">نظام الدفع</th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-purple-600" onClick={() => handleSort("total")}>
                  الإجمالي <SortIcon field="total" />
                </th>
                <th className="px-4 py-3">الدفعة الأولى</th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-purple-600" onClick={() => handleSort("createdAt")}>
                  التاريخ <SortIcon field="createdAt" />
                </th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-purple-600" onClick={() => handleSort("status")}>
                  الحالة <SortIcon field="status" />
                </th>
                <th className="px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-red-500">{error}</td>
                </tr>
              ) : data.orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">لا توجد طلبات</td>
                </tr>
              ) : (
                data.orders.map((o, i) => (
                  <tr key={o._id} className="hover:bg-gray-50 text-base">
                    <td className="px-4 py-3 text-gray-400 font-medium">{(page - 1) * LIMIT + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{o.customer || "—"}</td>
                    <td className="px-4 py-3" dir="ltr">
                      {o.whatsapp ? (
                        <a href={`https://wa.me/${o.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-medium">{o.whatsapp}</a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.installmentType === "installment" ? `تقسيط ${o.months} شهر` : "كامل"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{o.total} ر.س</td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.installmentType === "installment" ? `${o.downPayment} ر.س` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button onClick={() => router.push(`/admin/orders/${o._id}`)} className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap">
                          <Eye size={12} /> تعديل
                        </button>
                        <button onClick={() => window.open(`/admin/orders/${o._id}/print`, "_blank")} className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap">
                          <Printer size={12} /> فاتورة
                        </button>
                        <button onClick={() => window.open(`/admin/orders/${o._id}/receipt`, "_blank")} className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap">
                          <CreditCard size={12} /> سند قبض
                        </button>
                        <button onClick={() => window.open(`/admin/orders/${o._id}/contract`, "_blank")} className="inline-flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap">
                          <FileText size={12} /> عقد التقسيط
                        </button>
                        {o.status !== "confirmed" && (
                          <button
                            disabled={changingStatus === `${o._id}-confirmed`}
                            onClick={() => changeStatus(o._id, "confirmed")}
                            className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <CheckCircle size={12} /> تأكيد
                          </button>
                        )}
                        {o.status !== "cancelled" && (
                          <button
                            disabled={changingStatus === `${o._id}-cancelled`}
                            onClick={() => changeStatus(o._id, "cancelled")}
                            className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <XCircle size={12} /> إلغاء
                          </button>
                        )}
                        {o.status === "cancelled" && (
                          <button onClick={() => window.open(`/admin/orders/${o._id}/cancellation`, "_blank")} className="inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap">
                            <FileX size={12} /> فاتورة إلغاء
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete({ id: o._id, name: o.customer || o.orderId })}
                          className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Trash2 size={12} /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>
              عرض {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, data.total)} من {data.total.toLocaleString("ar-EG")}
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              {paginationPages(page, data.totalPages).map((n, idx) =>
                n === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`px-3 py-1 rounded-lg border ${n === page ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
            <p className="text-sm text-gray-500 mb-1">هتحذف طلب</p>
            <p className="text-base font-bold text-red-600 mb-4">« {confirmDelete.name} »</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => deleteOrder(confirmDelete.id)}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors"
              >
                {deleting ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="border border-gray-300 text-gray-700 text-sm font-bold px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
