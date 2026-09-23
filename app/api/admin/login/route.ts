import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.BACKEND_URL || "https://alshareehasim-backend.vercel.app";

  const frontendUrl = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").split(",")[0].trim();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": frontendUrl },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بالخادم" }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 502 });
  }

  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });

  if (res.ok) {
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      // Extract token value from set-cookie header
      const tokenMatch = setCookie.match(/admin_token=([^;]+)/);
      if (tokenMatch) {
        response.cookies.set("admin_token", tokenMatch[1], {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 8 * 60 * 60,
          path: "/",
        });
      }
    }
  }

  return response;
}
