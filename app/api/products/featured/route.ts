import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../admin/_lib";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}/api/products/featured`, forwardCookies(req, { method: "GET" }));
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const data: unknown[] = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
