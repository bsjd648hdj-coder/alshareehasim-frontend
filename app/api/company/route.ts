import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

// Uses the dedicated public endpoint — returns only storefront fields,
// no auth required, no sensitive data (taxNumber, stamps, etc.)
export async function GET() {
  try {
    const res = await fetch(`${getBackend()}/api/admin/company/public`, {
      next: { revalidate: 300, tags: ["company"] },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return NextResponse.json({}, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({});
  }
}
