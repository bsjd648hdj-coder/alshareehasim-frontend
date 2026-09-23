import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function GET(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/sub-categories/max`, forwardCookies(req, {}));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/sub-categories/max`, forwardCookies(req, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
