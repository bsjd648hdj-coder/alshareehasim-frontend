import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${getBackend()}/api/admin/banks/${id}`, forwardCookies(req, { method: "DELETE" }));
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("DELETE bank error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${getBackend()}/api/admin/banks/${id}`, {
    method: "PUT",
    headers: { cookie },
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
