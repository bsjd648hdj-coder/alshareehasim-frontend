import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";
const FRONTEND = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").split(",")[0].trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const otp = String(body.otp || "").trim();
    const firstName = (body.firstName || "").trim();
    const lastName = (body.lastName || "").trim();
    const phone = (body.phone || "").trim();
    const password = body.password || "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "بريد إلكتروني غير صحيح" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "رمز التحقق يجب أن يكون 6 أرقام" }, { status: 400 });
    }
    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND}/api/customers/auth/register/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": FRONTEND },
      body: JSON.stringify({ email, otp, firstName, lastName, phone, password }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Forward the session cookie set by the backend to the browser
    const res = NextResponse.json(data);
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) {
      res.headers.set("set-cookie", setCookie);
    }
    return res;
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
