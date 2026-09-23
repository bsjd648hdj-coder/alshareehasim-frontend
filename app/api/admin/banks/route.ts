import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export async function GET(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/banks`, forwardCookies(req, { cache: "no-store" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${getBackend()}/api/admin/banks`, {
    method: "POST",
    headers: { cookie },
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
