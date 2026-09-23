import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  let fetchUrl = url.replace(/\/fl_attachment:[^/]+\//, "/");
  if (!fetchUrl.startsWith("http://") && !fetchUrl.startsWith("https://")) {
    fetchUrl = `https://${fetchUrl}`;
  }

  const res = await fetch(fetchUrl);
  if (!res.ok) return new NextResponse("failed", { status: res.status });

  const body = await res.arrayBuffer();
  let contentType = res.headers.get("content-type") || "application/pdf";
  if (url.toLowerCase().endsWith(".pdf") || fetchUrl.toLowerCase().endsWith(".pdf")) {
    contentType = "application/pdf";
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
