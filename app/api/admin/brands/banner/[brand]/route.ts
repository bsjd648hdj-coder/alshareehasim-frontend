import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const formData = await req.formData();
  const res = await fetch(
    `${getBackend()}/api/admin/brands/banner/${encodeURIComponent(brand)}`,
    forwardCookies(req, { method: "POST", body: formData })
  );
  revalidateTag("brands-settings");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const body = await req.text();
  const res = await fetch(
    `${getBackend()}/api/admin/brands/banner/${encodeURIComponent(brand)}`,
    forwardCookies(req, { method: "DELETE", body, headers: { "Content-Type": "application/json" } })
  );
  revalidateTag("brands-settings");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
