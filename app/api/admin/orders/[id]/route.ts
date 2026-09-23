import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

async function safeJson(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { ok: res.ok }; }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/checkout/${id}`, forwardCookies(req, {}));
  return NextResponse.json(await safeJson(res), { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const endpoint = body.financials ? "financials" : "status";
  const res = await fetch(`${getBackend()}/api/checkout/${id}/${endpoint}`,
    forwardCookies(req, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
  return NextResponse.json(await safeJson(res), { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/checkout/${id}`,
    forwardCookies(req, { method: "DELETE" })
  );
  return NextResponse.json(await safeJson(res), { status: res.status });
}

