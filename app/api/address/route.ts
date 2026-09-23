import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, latitude, longitude, shippingAvailable } = body;

  if (!address || latitude == null || longitude == null) {
    return NextResponse.json({ error: "بيانات العنوان غير مكتملة" }, { status: 400 });
  }
  if (!shippingAvailable) {
    return NextResponse.json({ error: "عذرًا، لا يمكننا التوصيل إلى هذا العنوان حاليًا." }, { status: 422 });
  }

  return NextResponse.json({ success: true, ...body });
}
