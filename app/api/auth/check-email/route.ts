import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";

// GET /api/auth/check-email?email=xxx
export async function GET(req: NextRequest) {
  try {
    const email = (req.nextUrl.searchParams.get("email") || "").toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ exists: false });
    }

    const backendRes = await fetch(
      `${BACKEND}/api/customers/auth/check-email?email=${encodeURIComponent(email)}`,
      { method: "GET", signal: AbortSignal.timeout(3000) }
    );

    if (!backendRes.ok) {
      // If backend errors, don't block the user — fail open
      return NextResponse.json({ exists: false });
    }

    const data = await backendRes.json();
    return NextResponse.json({ exists: !!data.exists });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
