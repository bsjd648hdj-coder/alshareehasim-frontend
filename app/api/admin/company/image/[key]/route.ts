import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend } from "../../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const cookie = req.headers.get("cookie") || "";
  try {
    const res = await fetch(`${getBackend()}/api/admin/company/image/${key}`, {
      method: "DELETE",
      headers: { cookie },
    });
    const text = await res.text();
    revalidateTag("company");
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
      return NextResponse.json({ message: text || "deleted" }, { status: res.status });
    }
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
