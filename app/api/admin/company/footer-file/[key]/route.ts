import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const body = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/company/footer-file/${key}`, forwardCookies(req, { method: "POST", body }));
  const data = await res.json();
  revalidatePath("/");
  return NextResponse.json(data, { status: res.status });
}
