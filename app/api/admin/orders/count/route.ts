import { NextResponse } from "next/server";
import { getBackend } from "../../_lib";

export async function GET() {
  const res = await fetch(`${getBackend()}/api/admin/orders/count`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
