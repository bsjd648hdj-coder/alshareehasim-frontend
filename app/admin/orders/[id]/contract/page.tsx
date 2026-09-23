"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toArabicWords } from "../../_lib/arabicWords";

interface OrderItem { name: string; price: number; quantity: number; }
interface Order {
  orderId: string; createdAt: string; customer: string; whatsapp: string; address: string;
  total: number; downPayment: number; months: number; monthlyPayment: number;
  installmentType: string; items: OrderItem[];
}
interface Company { header?: string; footer?: string; nameAr?: string; currencyAr?: string; phone?: string; stamp?: string; }

export default function ContractPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ order: Order; company: Company } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}/invoice`).then((r) => r.json()).then(setData);
  }, [id]);

  useEffect(() => {
    if (data) setTimeout(() => window.print(), 500);
  }, [data]);

  if (!data) return <div style={{ textAlign: "center", padding: 40 }}>جاري التحميل...</div>;

  const { order, company } = data;
  const currency = company.currencyAr || "ريال";
  const remaining = order.total - (order.downPayment || 0);
  const monthly = order.monthlyPayment || (order.months > 0 ? Math.ceil(remaining / order.months) : remaining);
  const productNames = (order.items ?? []).map((i) => i.name).join("، ");

  const now = new Date(order.createdAt);
  const firstPayment = new Date(now);
  firstPayment.setMonth(firstPayment.getMonth() + 1);
  const firstPaymentStr = `${firstPayment.getFullYear()}/${String(firstPayment.getMonth() + 1).padStart(2, "0")}/${String(firstPayment.getDate()).padStart(2, "0")}`;

  const style = `
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; direction: rtl; background: #fff !important; color: #000 !important; }
    .sig-row { display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; }
    @media (max-width: 500px) {
      .sig-row { flex-direction: column; align-items: center; gap: 24px; }
    }
    @media print {
      @page { size: A4; margin: 10mm; }
      body { margin: 0; padding: 0; }
      img[alt="header"], img[alt="footer"] { width: 100% !important; max-height: none !important; }
    }
  `;


  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto", direction: "rtl" }}>
      <style>{style}</style>

      {company.header && <img src={company.header} alt="header" style={{ width: "100%", marginBottom: 24 }} />}

      {/* العنوان */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>عقد بيع بالتقسيط</div>
        <div style={{ fontSize: 13, color: "#555" }}>{company.nameAr || ""}</div>
      </div>

      <hr style={{ border: "none", borderTop: "2px solid #1a1a1a", marginBottom: 16 }} />

      {/* نص العقد */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", marginBottom: 16, fontSize: 13 }}>
        <tbody>
          <tr>
            <td style={{ padding: 16, lineHeight: 2.4, textAlign: "justify" }}>
              نعم أنا السيد :/ <strong>{order.customer}</strong> برقم جوال :/ <strong>{order.whatsapp}</strong> وعنوانه :/ <strong>{order.address}</strong>
              <br />
              أُقر وأعترف وأنا في حالتي الشرعية وبكامل قواي العقلية بأني في ذمتي للمؤسسة المدعوة :/ <strong>{company.nameAr}</strong>
              <br />
              مبلغ وقدره :/ <strong>{remaining.toLocaleString("ar-SA")} ( {toArabicWords(remaining)} ) {currency} فقط.</strong>
              <br />
              وذلك قيمة عن ما تبقى من ثمن جهاز/أجهزة :/ <strong>{productNames}</strong>
              <br />
              على أن يُدفع المبلغ على أقساط شهرية متتالية ومستمرة بدون انقطاع بما فيها شهر رمضان والأعياد
              <br />
              قيمة الدفعة الشهرية :/ <strong>{monthly.toFixed(2)} ( {toArabicWords(Math.round(monthly))} ) {currency} فقط</strong> اعتباراً من تاريخ :/ <strong>{firstPaymentStr}</strong>
              <br />
              نهاية المبلغ المذكور أعلاه وأنني بسداد الأقساط في موعدها بدون تأخر عن أي قسط عن موعده المحدد فإني ملتزم التزاماً تاماً بسداد المبلغ المتبقي كاملاً دفعة واحدة.
              <br />
              كما أنني أُقر على نفسي بأنه لا يوجد التزامات مالية ولا كفالات غرامية وقد أذنت والله خير الشاهدين لاسم :/ <strong>{order.customer}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <hr style={{ border: "none", borderTop: "2px solid #1a1a1a", marginBottom: 32 }} />

      {/* التوقيع والختم */}
      <div className="sig-row">
        <div style={{ textAlign: "center", width: 180 }}>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 8, color: "#555" }}>التوقيع :/ ........................</div>
        </div>
        <div style={{ textAlign: "center", width: 180 }}>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 8, color: "#555" }}>الختم</div>
          {company.stamp && <img src={company.stamp} alt="ختم" style={{ maxWidth: 150, maxHeight: 120, objectFit: "contain", marginTop: 8, marginLeft: "auto" }} />}
        </div>
      </div>

      {company.footer && <img src={company.footer} alt="footer" style={{ width: "100%", marginTop: 24 }} />}
    </div>
  );
}
