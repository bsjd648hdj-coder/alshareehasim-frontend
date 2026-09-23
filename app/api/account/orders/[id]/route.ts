import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookie = req.headers.get("cookie") || "";
  if (!cookie || (!cookie.includes("customer_token") && !cookie.includes("token"))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND}/api/customers/orders/${id}`, {
      headers: { cookie },
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بالخادم" }, { status: 503 });
  }
}
