import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  if (!cookie || (!cookie.includes("customer_token") && !cookie.includes("token"))) {
    return NextResponse.json({ orders: [], total: 0 }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  try {
    const res = await fetch(`${BACKEND}/api/customers/orders?page=${page}&limit=${limit}`, {
      headers: { cookie },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بالخادم" }, { status: 503 });
  }
}
