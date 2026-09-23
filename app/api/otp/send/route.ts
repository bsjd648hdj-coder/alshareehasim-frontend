import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../lib/resendClient";
import { otpEmailTemplate } from "../../../lib/otpTemplate";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const purpose = body.purpose || "checkout";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "بريد إلكتروني غير صحيح" }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND}/api/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
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
        subject: "رمز التحقق الخاص بك | لمسه الثابته",
        html: otpEmailTemplate(otp),
      });
    } catch {
      // إذا فشل Resend، نلغي OTP في backend
      await fetch(`${BACKEND}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose, _invalidate: true }),
      }).catch(() => {});

      return NextResponse.json({ error: "فشل إرسال البريد الإلكتروني" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "إذا كان البريد صالحًا، سيتم إرسال رمز التحقق.",
    });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
