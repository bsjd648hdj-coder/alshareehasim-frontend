import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/admin/reviews/${id}/toggle`, forwardCookies(req, { method: "PATCH" }));
  revalidateTag("reviews");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
