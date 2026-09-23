import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/users/${id}`, forwardCookies(req, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/admin/users/${id}`, forwardCookies(req, {
    method: "DELETE",
  }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
