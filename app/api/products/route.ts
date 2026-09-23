import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") || "";
  const brand = searchParams.get("brand") || "";
  const category = searchParams.get("category") || "";
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (brand) params.set("brand", brand);
  if (category) params.set("category", category);
  try {
    const res = await fetch(`${getBackend()}/api/products?${params.toString()}`, {
      next: { revalidate: 180, tags: ["products"] },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json([], { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=360",
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
