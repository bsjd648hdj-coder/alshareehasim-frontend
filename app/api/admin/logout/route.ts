import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export async function POST(req: NextRequest) {
  const backendUrl = getBackend();
  await fetch(`${backendUrl}/api/admin/logout`, forwardCookies(req, { method: "POST" })).catch(() => {});

  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  return response;
}
