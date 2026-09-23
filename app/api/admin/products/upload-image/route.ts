import { NextRequest, NextResponse } from "next/server";
import { forwardCookies, getBackend } from "../../_lib";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "لم يتم رفع صورة" }, { status: 400 });

  const body = new FormData();
  body.append("image", file, file.name);

  const res = await fetch(`${getBackend()}/api/admin/products/upload-image`, {
    ...forwardCookies(req, { method: "POST" }),
    body,
  });

  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    console.error("Backend upload error:", text);
    return NextResponse.json(
      { error: "فشل رفع الصورة", details: text || `status ${res.status}` },
      { status: res.status || 500 }
    );
  }
}
