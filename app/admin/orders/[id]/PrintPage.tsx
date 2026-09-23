"use client";
import { useEffect, useState } from "react";
import type { Order } from "./types";

interface CompanyData {
  nameAr?: string;
  nameEn?: string;
  header?: string;
  stamp?: string;
}

interface PrintPageProps {
  order: Order;
  fin: { total: number; downPayment: number; months: number; monthlyPayment: number };
  onClose: () => void;
}

export default function PrintPage({ order, fin, onClose }: PrintPageProps) {
  const [company, setCompany] = useState<CompanyData>({});

  useEffect(() => {
    fetch("/api/admin/company").then((r) => r.json()).then((res) => {
      console.log("company res:", res);
      setCompany({
        nameAr: res.nameAr,
        nameEn: res.nameEn,
        header: res.header || undefined,
        stamp: res.stamp || undefined,
      });
    }).catch((e) => console.error("fetch error:", e));
  }, []);

  const date = new Date(order.createdAt).toLocaleDateString("en-GB").replace(/\//g, "/");

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const content = document.getElementById("print-content")?.innerHTML || "";
    printWindow.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <style>body{margin:0;font-family:Arial,sans-serif;}*{box-sizing:border-box;}table{border-collapse:collapse;width:100%;}</style>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head><body>${content}</body></html>
    `);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close(); };
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:block print:p-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto print:shadow-none print:rounded-none print:max-h-none print:overflow-visible">

        {/* أزرار التحكم */}
        <div className="flex gap-3 p-3 border-b border-gray-100 print:hidden">
          <button onClick={handlePrint} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm">🖨️ طباعة</button>
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg text-sm">إغلاق</button>
        </div>

        {/* محتوى الطباعة */}
        <div id="print-content" className="px-4 py-4 [print-color-adjust:exact]" style={{ position: "relative", overflow: "visible" }}>

        {/* العلامة المائية */}
        {company.stamp && (
          <img
            src={company.stamp}
            alt="watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-30deg)",
              opacity: 0.45,
              pointerEvents: "none",
              zIndex: 9,
              width: "500px",
              height: "500px",
              objectFit: "contain",
            }}
          />
        )}

        {/* الترويسة */}
        {company.header && (
          <img src={company.header} alt="header" className="w-full object-contain mb-8" />
        )}

        {/* التاريخ ورقم الطلب */}
        <div className="flex justify-between items-center mb-6 text-sm font-semibold text-gray-700" dir="ltr">
          <span>{date}</span>
          <span>No. #{order.orderId}</span>
        </div>

        {/* رسالة الترحيب في مربع ببوردر أسود */}
        <div className="border-2 border-black rounded-lg overflow-hidden mb-6">
          <div className="grid grid-cols-2">
            <div className="p-3 border-l-2 border-black text-left text-sm leading-7 text-black font-semibold" dir="ltr">
              <p>Dear Customer,</p>
              <p>Thank you for shopping with {company.nameEn || "tabarak"}.</p>
              <p>Your order has been placed.</p>
              <p>Below is the summary of the order.</p>
            </div>
            <div className="p-3 text-right text-sm leading-7 text-black font-semibold" dir="rtl">
              <p>عميلنا العزيز،</p>
              <p>شكرا لتسوقكم من {company.nameAr || "مؤسسة تبارك الذكية"}.</p>
              <p>لقد تم إنشاء طلبكم بنجاح.</p>
              <p>فيما يلي ملخص الطلب.</p>
            </div>
          </div>
        </div>

        {/* جدول بيانات العميل */}
        <div className="border-2 border-black rounded-lg overflow-hidden mb-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="px-2 py-1 text-right border-l border-blue-400" dir="rtl">اسم العميل</th>
                <th className="px-2 py-1 text-right border-l border-blue-400" dir="rtl">رقم الجوال</th>
                <th className="px-2 py-1 text-right" dir="rtl">العنوان</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-2 py-1 text-right border-l border-gray-200 font-semibold" dir="rtl">{order.customer}</td>
                <td className="px-2 py-1 text-right border-l border-gray-200" dir="ltr">{order.whatsapp}</td>
                <td className="px-2 py-1 text-right" dir="rtl">{order.address}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* تفاصيل المنتج */}
        <div className="mb-2 text-center text-black font-bold text-1xl" dir="rtl">
          تفاصيل الفاتورة
        </div>

        {/* جدول بيانات المنتج */}
        <div className="border-2 border-black rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="px-2 py-1 text-right border-l border-blue-400" dir="rtl">اسم الجهاز</th>
                <th className="px-2 py-1 text-right border-l border-blue-400" dir="rtl">السعر</th>
                <th className="px-2 py-1 text-right border-l border-blue-400" dir="rtl">الكمية</th>
                <th className="px-2 py-1 text-right " dir="rtl">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item, i) => (
                <tr key={i} className="bg-white border-b border-gray-200">
                  <td className="px-2 py-1 text-right border-l border-gray-200 font-semibold" dir="rtl">{item.name}</td>
                  <td className="px-2 py-1 text-right border-l border-gray-200" dir="rtl">{item.price.toFixed(2)}</td>
                  <td className="px-2 py-1 text-right border-l border-gray-200" dir="rtl">{item.quantity}</td>
                  <td className="px-2 py-1 text-right" dir="rtl">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 font-bold border-t-2 border-black">
                <td colSpan={3} className="px-2 py-1 text-right border-l border-gray-200 border-b-2 border-b-black" dir="rtl">الإجمالي</td>
                <td className="px-2 py-1 text-right border-b-2 border-b-black" dir="rtl">{fin.total.toFixed(2)} ريال</td>
              </tr>
              {order.installmentType === "installment" && (
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={3} className="px-2 py-1 text-right border-l border-gray-200 border-b-2 border-b-black" dir="rtl">الدفعة المقدمة</td>
                  <td className="px-2 py-1 text-right border-b-2 border-b-black" dir="rtl">{fin.downPayment.toFixed(2)} ريال</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* مربع الشروط والمعلومات */}
        <div className="border-2 border-black rounded-lg overflow-hidden mb-4">
          <div className="grid grid-cols-2">
            <div className="border-l-2 border-black text-right text-black font-semibold" style={{ padding: "2rem", fontSize: "0.875rem", lineHeight: "3rem", minHeight: "150px" }} dir="rtl">
              <p>سيتم اعتماد الطلب وشحنه بعد تسديد المبلغ المطلوب</p>
              <p>التوصيل مجاناً من خلال شركة. مندوب توصيل , خلال 24 ساعة من دفع الدفعة المقدمة</p>
            </div>
            <div className="text-right text-black font-semibold" style={{ padding: "2rem", fontSize: "0.875rem", lineHeight: "3rem", minHeight: "150px" }} dir="rtl">
              <p>الرقم الضريبي : 314539044300003</p>
              <p>العرض شامل الهدايا</p>
            </div>
          </div>
        </div>

        {/* جدول الأقساط */}
        {order.installmentType === "installment" && fin.months > 0 && (() => {
          const startDate = new Date(order.createdAt);
          startDate.setMonth(startDate.getMonth() + 1);
          const installments = Array.from({ length: fin.months }, (_, i) => {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + i);
            return {
              num: i + 1,
              amount: fin.monthlyPayment,
              date: d.toLocaleDateString("en-GB").replace(/\//g, "/"),
            };
          });
          const chunks: typeof installments[] = [];
          for (let i = 0; i < installments.length; i += 5) chunks.push(installments.slice(i, i + 5));
          const remaining = (fin.total - fin.downPayment).toFixed(2);
          return (
            <div className="border-2 border-gray-400 rounded-lg p-3 mb-4 bg-gray-100">
              <div className="grid grid-cols-2 gap-3">
                {chunks.map((chunk, ci) => (
                  <div key={ci} className="border border-gray-300 rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-blue-500 text-white">
                          <th className="px-2 py-1 text-center border-l border-blue-400">#&nbsp;الدفعة</th>
                          <th className="px-2 py-1 text-center border-l border-blue-400">المبلغ</th>
                          <th className="px-2 py-1 text-center">تاريخ الاستحقاق</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chunk.map((inst) => (
                          <tr key={inst.num} className="bg-white border-b border-gray-200">
                            <td className="px-2 py-1 text-center border-l border-gray-200 font-semibold">{inst.num}</td>
                            <td className="px-2 py-1 text-center border-l border-gray-200">{inst.amount.toFixed(2)}</td>
                            <td className="px-2 py-1 text-center" dir="ltr">{inst.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right font-bold text-sm text-gray-800" dir="rtl">
                المتبقي: {remaining} ريـــال
              </div>
            </div>
          );
        })()}

        </div>
      </div>
    </div>
  );
}
