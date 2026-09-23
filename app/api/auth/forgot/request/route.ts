import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../../lib/resendClient";
import { otpEmailTemplate } from "../../../../lib/otpTemplate";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";
const FRONTEND = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").split(",")[0].trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "أدخل بريدًا إلكترونيًا صحيحًا" }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND}/api/customers/auth/forgot/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": FRONTEND },
      body: JSON.stringify({ email }),
    });

    const backendData = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: backendData.error || "خطأ في الخادم", cooldown: backendData.cooldown },
        { status: backendRes.status }
      );
    }

    // notFound: backend found no account — still return ok so we don't leak account existence
    if (backendData.notFound) {
      return NextResponse.json({ success: true });
    }

    const otp: string = backendData._otp;
    if (!otp) {
      return NextResponse.json({ error: "خطأ في إنشاء الرمز" }, { status: 500 });
    }

    try {
      await sendEmail({
        to: email,
        subject: "رمز إعادة تعيين كلمة المرور | لمسه الثابته",
        html: otpEmailTemplate(otp),
      });
    } catch {
      return NextResponse.json({ error: "فشل إرسال بريد التحقق" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
