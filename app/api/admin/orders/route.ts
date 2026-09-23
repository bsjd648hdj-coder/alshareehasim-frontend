import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  const res = await fetch(`${getBackend()}/api/checkout${qs ? `?${qs}` : ""}`, forwardCookies(req, {}));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
