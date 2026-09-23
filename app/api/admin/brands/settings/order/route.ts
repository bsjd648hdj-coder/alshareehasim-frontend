import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/brands/settings/order`, forwardCookies(req, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  revalidateTag("brands-settings");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
