import { NextRequest } from "next/server";

const BACKEND = "https://lamsa-simicard-backend-production.up.railway.app";

export function getBackend(): string {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || BACKEND;
}

export function forwardCookies(req: NextRequest, init: RequestInit): RequestInit {
  const cookie = req.headers.get("cookie") || "";
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>), cookie, origin };
  if (init.body instanceof FormData) {
    delete headers["content-type"];
    delete headers["Content-Type"];
  }
  return { ...init, headers };
}
