import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../../admin/_lib";

// GET /api/products/batch?ids=id1,id2,id3
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (ids.length === 0) return NextResponse.json([]);

  const results = await Promise.all(
    ids.map((id) =>
      fetch(`${getBackend()}/api/products/${id}`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(3000),
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  );

  return NextResponse.json(results.filter(Boolean));
}
