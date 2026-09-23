import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";

    // If guest user has no customer_token cookie, resolve instantly without hitting backend
    if (!cookie || (!cookie.includes("customer_token") && !cookie.includes("token"))) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const backendRes = await fetch(`${BACKEND}/api/customers/auth/me`, {
      headers: { cookie },
      signal: AbortSignal.timeout(4000),
    });

    if (!backendRes.ok) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
