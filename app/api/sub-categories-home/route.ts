import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

export async function GET() {
  const [settingsRes, maxRes] = await Promise.all([
    fetch(`${getBackend()}/api/admin/sub-categories/home-settings`),
    fetch(`${getBackend()}/api/admin/sub-categories/max`),
  ]);
  const settings = settingsRes.ok ? await settingsRes.json() : [];
  const maxData = maxRes.ok ? await maxRes.json() : { max: 4 };
  return NextResponse.json({ settings, max: maxData.max ?? 4 });
}
