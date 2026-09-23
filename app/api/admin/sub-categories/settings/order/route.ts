import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/sub-categories/settings/order`, forwardCookies(req, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
