import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (REVALIDATE_SECRET && secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tag = req.nextUrl.searchParams.get("tag");
  if (tag) revalidateTag(tag);
  return NextResponse.json({ revalidated: true });
}
