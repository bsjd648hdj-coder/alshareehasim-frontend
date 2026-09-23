"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

interface OrderItem { name: string; price: number; quantity: number; }
interface Order {
  orderId: string; createdAt: string; customer: string; whatsapp: string; address: string;
  total: number; downPayment: number; months: number; monthlyPayment: number;
  installmentType: string; items: OrderItem[];
}
interface Company { header?: string; footer?: string; nameEn?: string; nameAr?: string; stamp?: string; }

export default function PrintOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [company, setCompany] = useState<Company>({});
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${id}`).then((r) => r.json()),
      fetch("/api/admin/company").then((r) => r.json()).catch(() => ({})),
    ]).then(([o, c]) => { setOrder(o); setCompany(c); });
  }, [id]);

  useEffect(() => {
    if (!order) return;
    const images = [company.header, company.footer, company.stamp].filter(Boolean) as string[];
    if (images.length === 0) {
      if (contentRef.current) applyScale();
      window.print();
      return;
    }
    let loaded = 0;
    images.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (++loaded === images.length) {
          if (contentRef.current) applyScale();
          window.print();
        }
      };
      img.src = src;
    });
  }, [order, company]);

  function applyScale() {
    if (!contentRef.current) return;
    const A4_HEIGHT_PX = 1122;
    const A4_WIDTH_PX = 794;
    const h = contentRef.current.scrollHeight;
    const w = contentRef.current.scrollWidth;
    const scale = Math.min(A4_HEIGHT_PX / h, A4_WIDTH_PX / w, 1);
    contentRef.current.style.transform = `scale(${scale})`;
    contentRef.current.style.transformOrigin = "top left";
    contentRef.current.style.width = `${100 / scale}%`;
  }

  if (!order) return <div style={{ textAlign: "center", padding: 40 }}>جاري التحميل...</div>;

  const fin = { total: order.total, downPayment: order.downPayment, months: order.months, monthlyPayment: order.monthlyPayment };
  const date = new Date(order.createdAt).toLocaleDateString("en-GB");

  const startDate = new Date(order.createdAt);
  startDate.setMonth(startDate.getMonth() + 1);
  const installments = order.installmentType === "installment" && fin.months > 0
    ? Array.from({ length: fin.months }, (_, i) => {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + i);
        return { num: i + 1, amount: fin.monthlyPayment, date: d.toLocaleDateString("en-GB") };
      })
    : [];
  const chunks: typeof installments[] = [];
  for (let i = 0; i < installments.length; i += 6) chunks.push(installments.slice(i, i + 6));
  const remaining = (fin.total - fin.downPayment).toFixed(2);

  return (
    <>
      <style>{`
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { margin: 0; padding: 0; width: 210mm; height: 297mm; overflow: hidden; background: #fff !important; }
        }
        html, body { background: #fff !important; color: #000 !important; }
      `}</style>
      <div ref={contentRef} style={{ fontFamily: "Arial, sans-serif", padding: "10px 16px", width: "794px", position: "relative" }}>

        {company.stamp && (
          <img src={company.stamp} alt="stamp" style={{ position: "absolute", top: "80%", left: "25%", transform: "translate(-50%, -50%)", width: 200, opacity: 0.85, pointerEvents: "none", zIndex: 9999 }} />
        )}

        {company.header && <img src={company.header} alt="header" style={{ width: "100%", marginBottom: 10 }} />}

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontWeight: 600 }}>
          <span>{date}</span>
          <span>No. #{order.orderId}</span>
        </div>

        {/* رسالة الترحيب */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", marginBottom: 8 }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 10px", borderRight: "2px solid black", fontSize: 11, lineHeight: 1.8, width: "50%" }}>
                <p style={{ margin: 0 }}>Dear Customer,</p>
                <p style={{ margin: 0 }}>Thank you for shopping with {company.nameEn || "madar"}.</p>
                <p style={{ margin: 0 }}>Your order has been placed.</p>
                <p style={{ margin: 0 }}>Below is the summary of the order.</p>
              </td>
              <td style={{ padding: "6px 10px", fontSize: 11, lineHeight: 1.8, textAlign: "right", direction: "rtl", width: "50%" }}>
                <p style={{ margin: 0 }}>عميلنا العزيز،</p>
                <p style={{ margin: 0 }}>شكرا لتسوقكم من {company.nameAr || "سهلناها التقنية للاتصالات"}.</p>
                <p style={{ margin: 0 }}>لقد تم إنشاء طلبكم بنجاح.</p>
                <p style={{ margin: 0 }}>فيما يلي ملخص الطلب.</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* بيانات العميل */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", marginBottom: 8, fontSize: 11 }}>
          <thead>
            <tr style={{ backgroundColor: "#3b82f6", color: "white" }}>
              <th style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>اسم العميل</th>
              <th style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>رقم الجوال</th>
              <th style={{ padding: "4px 8px", textAlign: "right" }}>العنوان</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb", fontWeight: 600 }}>{order.customer}</td>
              <td style={{ padding: "4px 8px", textAlign: "left", borderLeft: "1px solid #e5e7eb" }}>{order.whatsapp}</td>
              <td style={{ padding: "4px 8px", textAlign: "right" }}>{order.address}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 6, fontSize: 12 }}>تفاصيل الفاتورة</div>

        {/* جدول المنتجات */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", marginBottom: 8, fontSize: 11 }}>
          <thead>
            <tr style={{ backgroundColor: "#3b82f6", color: "white" }}>
              <th style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>اسم الجهاز</th>
              <th style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>السعر</th>
              <th style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>الكمية</th>
              <th style={{ padding: "4px 8px", textAlign: "right" }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>{item.price.toFixed(2)}</td>
                <td style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>{item.quantity}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#eff6ff", fontWeight: "bold", borderTop: "2px solid black" }}>
              <td colSpan={3} style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>الإجمالي</td>
              <td style={{ padding: "4px 8px", textAlign: "right" }}>{fin.total.toFixed(2)} ريال</td>
            </tr>
            {order.installmentType === "installment" && (
              <tr style={{ backgroundColor: "#eff6ff", fontWeight: "bold" }}>
                <td colSpan={3} style={{ padding: "4px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>الدفعة المقدمة</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{fin.downPayment.toFixed(2)} ريال</td>
              </tr>
            )}
          </tfoot>
        </table>

        {/* الشروط */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", fontSize: 11, marginBottom: 8 }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 10px", borderRight: "2px solid black", textAlign: "right", direction: "rtl", lineHeight: 1.8, width: "50%" }}>
                <p style={{ margin: 0 }}>سيتم اعتماد الطلب وشحنه بعد تسديد المبلغ المطلوب</p>
                <p style={{ margin: 0 }}>التوصيل مجاناً من خلال شركة. مندوب توصيل , خلال 24 ساعة من دفع الدفعة المقدمة</p>
              </td>
              <td style={{ padding: "6px 10px", textAlign: "right", direction: "rtl", lineHeight: 1.8, width: "50%" }}>
                <p style={{ margin: 0 }}>الرقم الضريبي : 314781690600003</p>
                <p style={{ margin: 0 }}>العرض شامل الهدايا</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* جدول الأقساط */}
        {installments.length > 0 && (
          <div style={{ border: "2px solid #9ca3af", borderRadius: 6, padding: 8, backgroundColor: "#f3f4f6" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {chunks.map((chunk, ci) => (
                <table key={ci} style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db", fontSize: 10 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#3b82f6", color: "white" }}>
                      <th style={{ padding: "3px 4px", textAlign: "center", borderLeft: "1px solid #60a5fa" }}>#</th>
                      <th style={{ padding: "3px 4px", textAlign: "center", borderLeft: "1px solid #60a5fa" }}>المبلغ</th>
                      <th style={{ padding: "3px 4px", textAlign: "center" }}>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((inst) => (
                      <tr key={inst.num} style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "3px 4px", textAlign: "center", borderLeft: "1px solid #e5e7eb", fontWeight: 600 }}>{inst.num}</td>
                        <td style={{ padding: "3px 4px", textAlign: "center", borderLeft: "1px solid #e5e7eb" }}>{inst.amount.toFixed(2)}</td>
                        <td style={{ padding: "3px 4px", textAlign: "center", direction: "ltr", fontSize: 9 }}>{inst.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
            <div style={{ marginTop: 8, textAlign: "right", fontWeight: "bold", fontSize: 12, direction: "rtl" }}>
              المتبقي: {remaining} ريـــال
            </div>
          </div>
        )}

        {company.footer && <img src={company.footer} alt="footer" style={{ width: "100%", marginTop: 10 }} />}
      </div>
    </>
  );
}
