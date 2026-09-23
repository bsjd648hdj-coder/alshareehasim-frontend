import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../../lib/resendClient";
import { otpEmailTemplate } from "../../../../lib/otpTemplate";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";
const FRONTEND = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").split(",")[0].trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const firstName = (body.firstName || "").trim();
    const lastName = (body.lastName || "").trim();
    const phone = (body.phone || "").trim();
    const password = body.password || "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "أدخل بريدًا إلكترونيًا صحيحًا" }, { status: 400 });
    }
    if (!firstName || firstName.length < 2) {
      return NextResponse.json({ error: "أدخل الاسم الأول" }, { status: 400 });
    }
    if (!lastName || lastName.length < 2) {
      return NextResponse.json({ error: "أدخل اسم العائلة" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "أدخل رقم الهاتف" }, { status: 400 });
    }
    if (!password || String(password).length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND}/api/customers/auth/register/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": FRONTEND },
      body: JSON.stringify({ email, firstName, lastName, phone, password }),
      signal: AbortSignal.timeout(8000),
    });

    const backendData = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: backendData.error || "خطأ في الخادم", cooldown: backendData.cooldown },
        { status: backendRes.status }
      );
    }

    const otp: string = backendData._otp;
    if (!otp) {
      return NextResponse.json({ error: "خطأ في إنشاء الرمز" }, { status: 500 });
    }

    try {
      await sendEmail({
        to: email,
        subject: "رمز التحقق لإنشاء حسابك | لمسه الثابته",
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
