"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toArabicWords } from "../../_lib/arabicWords";

interface OrderItem { name: string; }
interface ReceiptData {
  order: { orderId: string; installmentType: string; downPayment: number; total: number; customer: string; whatsapp: string; address: string; items: OrderItem[]; };
  company: { currencyAr?: string; header?: string; footer?: string; stamp?: string; };
}

export default function ReceiptPrintPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${id}/invoice`).then((r) => r.json()),
    ]).then(([d]) => setData(d));
  }, [id]);

  useEffect(() => {
    if (data) setTimeout(() => window.print(), 500);
  }, [data]);

  if (!data) return <div style={{ textAlign: "center", padding: 40 }}>جاري التحميل...</div>;

  const { order, company } = data;
  const currency = company.currencyAr || "ريال";
  const amount = order.installmentType === "installment" ? order.downPayment : order.total;
  const amountWords = toArabicWords(amount) + " فقط لا غير";
  const aboutPrefix = `قيمة ${order.installmentType === "installment" ? "دفعة من " : ""}ثمن جهاز/أجهزة:`;
  const aboutItems = (order.items ?? []).map((i: OrderItem) => i.name);

  const style = `
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: Arial, sans-serif; background: #fff !important; color: #000 !important; direction: rtl; padding: 12px; }
    ul { list-style: disc; padding-right: 20px !important; margin-top: 4px !important; }
    li { list-style: disc; }
    .receipt-table { width: 100%; border-collapse: collapse; font-size: 15px; }
    .receipt-table td { border: 1px solid #aaa; padding: 6px 10px; word-break: break-word; }
    .receipt-label { text-align: center; background-color: #808080; color: #000; font-weight: bold; white-space: nowrap; width: 1%; }
    .receipt-value { text-align: center; }
    .receipt-header-row { display: flex; justify-content: center; margin-bottom: 4px; }
    .receipt-no { font-size: 14px; font-weight: bold; color: #990431; text-align: center; margin-top: 4px; }
    @media (max-width: 600px) {
      .receipt-table { font-size: 13px; }
      .receipt-table td { padding: 5px 7px; }
      .receipt-no { font-size: 12px; }
    }
    @media print {
      @page { size: A4; margin: 10mm; }
      body { padding: 0; }
      img[alt="header"], img[alt="footer"] { width: 100% !important; max-height: none !important; }
    }
  `;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "12px", maxWidth: 700, width: "100%", margin: "0 auto" }} dir="rtl">
      <style>{style}</style>
{/* header image*/}
      {company.header && (
        <img src={company.header} alt="header" style={{ width: "100%", marginBottom: 16 }} />
      )}

      {/* receipt box */}
      <div style={{ border: "2px solid #808080", borderRadius: 8, marginBottom: 16, position: "relative" }}>
        <div className="receipt-header-row">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ backgroundColor: "#808080", padding: "1px 50px", borderRadius: "0 0 6px 6px" }}>
              <span style={{ fontSize: 20, fontWeight: "bold", color: "#000000" }}>سند قبض</span>
            </div>
            <span className="receipt-no">No. #{order.orderId}</span>
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <table className="receipt-table">
            <tbody>
              <tr>
                <td className="receipt-label">المبلغ</td>
                <td className="receipt-value">{amount}</td>
                <td className="receipt-value">{currency}</td>
              </tr>
              <tr>
                <td className="receipt-label">استلمت من السيد</td>
                <td colSpan={2} className="receipt-value">{order.customer}</td>
              </tr>
              <tr>
                <td className="receipt-label">رقم الجوال</td>
                <td colSpan={2} className="receipt-value">{order.whatsapp}</td>
              </tr>
              <tr>
                <td className="receipt-label">العنوان</td>
                <td colSpan={2} className="receipt-value">{order.address}</td>
              </tr>
              <tr>
                <td className="receipt-label">وذلك عن</td>
                <td colSpan={2} className="receipt-value">
                  {aboutPrefix}
                  <ul style={{ margin: "4px 0 0 0", paddingRight: 20, textAlign: "right" }}>
                    {aboutItems.map((name: string, idx: number) => (
                      <li key={idx}>{name}</li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="receipt-label">المبلغ بالحروف</td>
                <td colSpan={2} className="receipt-value">{amountWords}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ border: "1px solid #aaa", borderRadius: 6, marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 100 }}>
            <div style={{ textAlign: "center", padding: "12px 8px", borderLeft: "1px solid #aaa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: "bold" }}>توقيع المستلم</div>
              <div style={{ borderBottom: "1px solid #aaa", width: "80%" }}></div>
            </div>
            <div style={{ textAlign: "center", padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: "bold" }}>الختم</div>
              {company.stamp
                ? <img src={company.stamp} alt="ختم" style={{ maxWidth: 140, maxHeight: 110, objectFit: "contain" }} />
                : <div style={{ borderBottom: "1px solid #aaa", width: "80%" }}></div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* footer image*/}
      {company.footer && (
        <img src={company.footer} alt="footer" style={{ width: "100%" }} />
      )}
    </div>
  );
}
