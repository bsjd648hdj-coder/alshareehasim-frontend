import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";
const FRONTEND = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").split(",")[0].trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const otp = String(body.otp || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "أدخل بريدًا إلكترونيًا صحيحًا" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "رمز التحقق يجب أن يكون 6 أرقام" }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND}/api/customers/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": FRONTEND },
      body: JSON.stringify({ email, otp }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Forward the session cookie from backend to browser
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
