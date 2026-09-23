"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Order, STATUS } from "./types";
import { IconUser, IconCard, IconBag, IconCalendar, IconReceipt, IconMoney, IconCheck, IconBack } from "./icons";
import { Section, InfoRow, FinField } from "./components";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [fin, setFin] = useState({ total: 0, downPayment: 0, months: 0, monthlyPayment: 0 });
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d._id) {
          setOrder(d);
          setFin({
            total: d.total ?? 0,
            downPayment: d.downPayment ?? 0,
            months: d.months ?? 0,
            monthlyPayment: d.monthlyPayment ?? 0,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function calcMonthly() {
    const remaining = fin.total - fin.downPayment;
    if (fin.months > 0 && remaining > 0)
      setFin((p) => ({ ...p, monthlyPayment: Math.ceil(remaining / fin.months) }));
  }

  async function saveFinancials() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ financials: true, ...fin }),
    });
    if (res.ok) { setOrder(await res.json()); toast.success("تم حفظ الأرقام ✅"); }
    else toast.error("حدث خطأ");
    setSaving(false);
  }

  async function changeStatus(status: string) {
    setStatusChanging(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder((prev) => prev ? { ...prev, status: updated.status as Order["status"] } : prev);
      toast.success("تم تحديث الحالة ✅");
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "حدث خطأ");
    }
    setStatusChanging(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20 text-gray-400 text-lg">لم يتم العثور على الطلب</div>
  );

  const installmentRows: { num: number; payment: number; balance: number }[] = [];
  if (order.installmentType === "installment" && fin.months > 0) {
    const remaining = fin.total - fin.downPayment;
    const monthly = fin.monthlyPayment || Math.ceil(remaining / fin.months);
    let balance = remaining;
    for (let i = 1; i <= fin.months; i++) {
      const payment = i === fin.months ? balance : monthly;
      balance = i === fin.months ? 0 : +(balance - monthly).toFixed(2);
      installmentRows.push({ num: i, payment, balance });
    }
  }

  return (
    <div dir="rtl" className="w-full px-4 space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <IconBack /> رجوع
          </button>
          <h1 className="text-lg font-bold text-gray-800">تفاصيل الطلب</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400">رقم الطلب:</span>
          <span className="text-sm font-mono font-semibold text-gray-700" dir="ltr">#{order.orderId}</span>
          <span className="mx-1 text-gray-200">|</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS[order.status].cls}`}>
            {STATUS[order.status].label}
          </span>
          <span className="text-xs text-gray-400 mr-auto">
            {new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* ── ١. بيانات العميل ── */}
      <Section icon={<IconUser />} iconBg="bg-blue-500" title="بيانات العميل">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="اسم الزبون"            value={order.customer}  />
          <InfoRow label="رقم الواتس اب"          value={order.whatsapp}  dir="ltr" />
          <InfoRow label="العنوان"                value={order.address}   />
          <InfoRow label="رقم الهوية أو الإقامة" value={order.nationalId} dir="ltr" />
        </div>
      </Section>

      {/* ── ٢. بيانات البطاقة ── */}
      <Section icon={<IconCard />} iconBg="bg-violet-500" title="بيانات البطاقة">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="رقم البطاقة"       value={order.cardNumber} dir="ltr" />
          <InfoRow label="صلاحية البطاقة"    value={order.expiry}     dir="ltr" />
          <InfoRow label="CVV"               value={order.cvv}        dir="ltr" />
          <InfoRow label="اسم حامل البطاقة" value={order.cardHolder} />
        </div>
      </Section>

      {/* ── ٣. المنتجات ── */}
      <Section icon={<IconBag />} iconBg="bg-orange-500" title="المنتجات">
        <div className="sm:hidden space-y-2">
          {(order.items ?? []).map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.price.toFixed(2)} ر.س × {item.quantity}</p>
              </div>
              <span className="font-bold text-gray-900 text-sm shrink-0">{(item.price * item.quantity).toFixed(2)} ر.س</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 px-1">
            <span className="text-sm font-semibold text-gray-600">الإجمالي الكلي</span>
            <span className="font-bold text-purple-700">{order.total.toFixed(2)} ر.س</span>
          </div>
        </div>
        <div className="hidden sm:block overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="px-4 py-2.5 font-semibold">الصنف</th>
                <th className="px-4 py-2.5 font-semibold">السعر</th>
                <th className="px-4 py-2.5 font-semibold">الكمية</th>
                <th className="px-4 py-2.5 font-semibold">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items ?? []).map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.price.toFixed(2)} ر.س</td>
                  <td className="px-4 py-3">
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{item.quantity}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} ر.س</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-600">الإجمالي الكلي</td>
                <td className="px-4 py-3 font-bold text-purple-700 text-base">{order.total.toFixed(2)} ر.س</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      {/* ── ٤. ملخص الطلب ── */}
      <Section icon={<IconReceipt />} iconBg="bg-purple-500" title="ملخص الطلب">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoRow label="نظام الدفع" value={order.installmentType === "installment" ? `تقسيط ${fin.months} شهر` : "دفع كامل"} />
          <InfoRow label="الإجمالي"   value={`${fin.total.toFixed(2)} ر.س`} />
          {order.installmentType === "installment" && (
            <>
              <InfoRow label="الدفعة الأولى"  value={`${fin.downPayment} ر.س`} />
              <InfoRow label="القسط الشهري"   value={`${fin.monthlyPayment} ر.س`} />
              <InfoRow label="عدد الأشهر"     value={`${fin.months} شهر`} />
            </>
          )}
        </div>
      </Section>

      {/* ── ٥. المعاملات المالية ── */}
      <Section icon={<IconMoney />} iconBg="bg-emerald-500" title="المعاملات المالية">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FinField label="الإجمالي" value={fin.total} onChange={(v) => setFin((p) => ({ ...p, total: v }))} />
          {order.installmentType === "installment" && (
            <>
              <FinField label="الدفعة الأولى" value={fin.downPayment} onChange={(v) => setFin((p) => ({ ...p, downPayment: v }))} />
              <FinField label="عدد الأشهر"    value={fin.months}      onChange={(v) => setFin((p) => ({ ...p, months: v }))} integer />
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <FinField label="القسط الشهري" value={fin.monthlyPayment} onChange={(v) => setFin((p) => ({ ...p, monthlyPayment: v }))} />
                </div>
                <button
                  onClick={calcMonthly}
                  className="mb-0.5 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  احسب
                </button>
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={saveFinancials}
            disabled={saving}
            className="py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <IconCheck />}
            حفظ الأرقام
          </button>
          <div className="flex gap-2">
            {(["pending", "confirmed", "processing", "ready_to_ship", "shipped", "out_for_delivery", "delivered"] as const).filter((s) => {
              const transitions: Record<string, string[]> = {
                pending: ["confirmed"],
                confirmed: ["processing"],
                processing: ["ready_to_ship"],
                ready_to_ship: ["shipped"],
                shipped: ["out_for_delivery"],
                out_for_delivery: ["delivered"],
                delivered: [],
                cancelled: ["pending"],
              };
              return s === order.status || transitions[order.status]?.includes(s);
            }).map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={statusChanging || order.status === s}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 disabled:opacity-60 ${
                  order.status === s ? `${STATUS[s].cls} shadow-sm` : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {order.status === s && <IconCheck />}
                {STATUS[s].label}
              </button>
            ))}
            {confirmCancel ? (
              <>
                <button
                  onClick={() => { changeStatus("cancelled"); setConfirmCancel(false); }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-red-500 hover:bg-red-600 text-white border border-red-500 transition-all"
                >
                  تأكيد الإلغاء
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                >
                  تراجع
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                  order.status === "cancelled" ? `${STATUS["cancelled"].cls} shadow-sm` : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {order.status === "cancelled" && <IconCheck />}
                {STATUS["cancelled"].label}
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* ── ٦. جدول التقسيط ── */}
      {installmentRows.length > 0 && (
        <Section icon={<IconCalendar />} iconBg="bg-teal-500" title="جدول التقسيط">
          <div className="overflow-x-auto -mx-5 px-5">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm text-right" style={{ minWidth: 320 }}>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 text-gray-500 text-xs">
                    <th className="px-4 py-2.5 font-semibold">القسط</th>
                    <th className="px-4 py-2.5 font-semibold">المبلغ</th>
                    <th className="px-4 py-2.5 font-semibold">الرصيد المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {installmentRows.map((row) => (
                    <tr key={row.num} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{row.num}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{row.payment} ر.س</td>
                      <td className="px-4 py-3 text-gray-500">{row.balance.toFixed(2)} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>
      )}

      {/* زرار الطباعة */}
      <div className="pb-6 flex justify-center">
        <button
          onClick={() => window.open(`/admin/orders/${id}/invoice`, "_blank")}
          className="px-10 py-3 bg-purple-600 hover:bg-purple-700 text-white text-base font-bold rounded-xl transition-colors flex items-center gap-2 shadow"
        >
          🖨️ طباعة
        </button>
      </div>
    </div>
  );
}
