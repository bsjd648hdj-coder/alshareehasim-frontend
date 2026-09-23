"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface OrderItem { productId: string; name: string; price: number; quantity: number; image?: string; }
interface Order {
  orderId: string; createdAt: string; customer: string; whatsapp: string;
  address: string; nationalId: string; total: number; downPayment: number;
  months: number; monthlyPayment: number; installmentType: string;
  items: OrderItem[]; status: string; cardNumber: string;
}
interface Company {
  header?: string; footer?: string; stamp?: string; cancelStamp?: string; nameAr?: string; nameEn?: string;
  addressAr?: string; email?: string; taxNumber?: string; shippingCompany?: string;
  paymentMethod?: string; currencyAr?: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "م" : "ص";
  const hour = (h % 12 || 12).toString().padStart(2, "0");
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} | ${hour}:${m} ${period}`;
}

const th: React.CSSProperties = { padding: "8px 12px", border: "1px solid #d1d5db", textAlign: "right", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold" };
const td = (bg = "#fff"): React.CSSProperties => ({ padding: "8px 12px", border: "1px solid #d1d5db", textAlign: "right", backgroundColor: bg, verticalAlign: "middle" });
const sectionTitle = (color: string): React.CSSProperties => ({ backgroundColor: color, color: "#fff", padding: "6px 14px", fontWeight: "bold", fontSize: 14, borderRadius: "6px 6px 0 0" });
const infoBox: React.CSSProperties = { border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", flex: 1 };
const infoRow = (label: string, value: string | undefined) => (
  <tr>
    <td style={{ ...td("#f9fafb"), fontWeight: "bold", whiteSpace: "nowrap", width: 130 }}>{label}</td>
    <td style={td()}>{value || "—"}</td>
  </tr>
);

export default function CancellationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [company, setCompany] = useState<Company>({});

  useEffect(() => {
    if (!order) return;
    const images = [company.header, company.footer, company.cancelStamp].filter(Boolean) as string[];
    if (images.length === 0) { window.print(); return; }
    let loaded = 0;
    images.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => { if (++loaded === images.length) window.print(); };
      img.src = src;
    });
  }, [order, company]);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}/invoice`)
      .then((r) => r.json())
      .then(({ order: o, company: c }) => {
        setOrder(o);
        setCompany(c);
      });
  }, [id]);

  if (!order) return <div style={{ textAlign: "center", padding: 40, fontFamily: "Arial" }}>جاري التحميل...</div>;

  const currency = company.currencyAr || "ر.س";

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto", direction: "rtl", position: "relative", backgroundColor: "#fff" }}>
      {company.cancelStamp && (
        <img src={company.cancelStamp} alt="stamp" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 240, opacity: 0.75, pointerEvents: "none", zIndex: 9999 }} />
      )}
      <style>{`
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { background: #fff !important; color: #000 !important; margin: 0; }
        thead { display: table-header-group; }
        tfoot { display: table-row-group; }
        .invoice-flex-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .invoice-table-wrap { overflow-x: auto; margin-bottom: 16px; }
        @media (max-width: 600px) { .invoice-flex-row { flex-direction: column; } }
        @media print { html, body { height: auto !important; min-height: unset !important; } }
      `}</style>

      {company.header && <img src={company.header} alt="header" style={{ width: "100%", marginBottom: 16 }} />}

      {/* رسالة الإلغاء */}
      <div style={{ border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, backgroundColor: "#fef2f2" }}>
        <span style={{ fontSize: 18 }}>❌</span>
        <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.7 }}>
          <span style={{ fontWeight: "bold" }}>تم إلغاء الطلب</span> بناءً على طلب العميل — سيتم استرجاع المبلغ خلال <strong>١٤ يوم عمل</strong> حسب سياسة المتجر
        </div>
      </div>

      {/* رقم الطلب والتاريخ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, fontSize: 14 }}>
        <span style={{ fontWeight: "bold" }}>رقم الطلب: #{order.orderId}</span>
        <span style={{ color: "#6b7280" }}>{formatDate(order.createdAt)}</span>
      </div>

      {/* مصدرة من / مصدرة إلى */}
      <div className="invoice-flex-row">
        <div style={infoBox}>
          <div style={sectionTitle("#6366f1")}>مصدرة من:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              {infoRow("المتجر", `${company.nameAr || ""} | ${company.nameEn || ""}`)}
              {infoRow("الرقم الضريبي", company.taxNumber)}
              {infoRow("العنوان", company.addressAr)}
              {infoRow("البريد", company.email)}
            </tbody>
          </table>
        </div>
        <div style={infoBox}>
          <div style={sectionTitle("#10b981")}>مصدرة إلى:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              {infoRow("الاسم", order.customer)}
              {infoRow("العنوان", order.address)}
              {infoRow("الجوال", order.whatsapp)}
              {infoRow("رقم الهوية", order.nationalId)}
            </tbody>
          </table>
        </div>
      </div>

      {/* تفاصيل الدفع والشحن */}
      <div className="invoice-flex-row">
        <div style={infoBox}>
          <div style={sectionTitle("#f59e0b")}>تفاصيل الدفع:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              {infoRow("المبلغ", `${order.total.toFixed(2)} ${currency}`)}
              {order.installmentType === "installment" && infoRow("الدفعة الأولى", `${order.downPayment.toFixed(2)} ${currency}`)}
              {order.installmentType === "installment" && infoRow("الأقساط", `${order.months} شهر`)}
              {infoRow("طريقة الدفع", company.paymentMethod || (order.cardNumber ? "بطاقة بنكية" : "—"))}
            </tbody>
          </table>
        </div>
        <div style={infoBox}>
          <div style={sectionTitle("#3b82f6")}>تفاصيل الشحن:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              {infoRow("بواسطة", company.shippingCompany || "مندوب توصيل")}
              {infoRow("رقم الشحنة", `#${order.orderId}`)}
              {infoRow("الوقت المتوقع", "(من 8 إلى 48 ساعة)")}
            </tbody>
          </table>
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="invoice-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 500 }}>
          <thead>
            <tr>
              <th style={th}>الصورة</th>
              <th style={th}>المنتج</th>
              <th style={th}>الكمية</th>
              <th style={th}>إجمالي الطلب</th>
              <th style={th}>المبلغ المسترد</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <td style={{ ...td(i % 2 === 0 ? "#fff" : "#f9fafb"), textAlign: "center", width: 70 }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                    : <div style={{ width: 56, height: 56, backgroundColor: "#f3f4f6", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#9ca3af" }}>لا صورة</div>
                  }
                </td>
                <td style={td(i % 2 === 0 ? "#fff" : "#f9fafb")}>{item.name}</td>
                <td style={{ ...td(i % 2 === 0 ? "#fff" : "#f9fafb"), textAlign: "center" }}>{item.quantity}</td>
                <td style={td(i % 2 === 0 ? "#fff" : "#f9fafb")}>{order.total.toFixed(2)} {currency}</td>
                <td style={{ ...td(i % 2 === 0 ? "#fff" : "#f9fafb"), fontWeight: "bold", color: "#dc2626" }}>{order.downPayment.toFixed(2)} {currency}</td>
              </tr>
            ))}
          </tbody>
          
        </table>
      </div>

      {company.footer && <img src={company.footer} alt="footer" style={{ width: "100%" }} />}
    </div>
  );
}
