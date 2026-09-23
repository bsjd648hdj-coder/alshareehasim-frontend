import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.GOOGLE_MAPS_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export async function GET(req: NextRequest) {
  if (!KEY) return NextResponse.json({ error: "API key missing" }, { status: 500 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");

  let url = "";
  // Fix 11: revalidate بدل no-store
  // autocomplete: مدن السعودية شبه ثابتة — نخزّن ساعة
  // details: بيانات مكان محدد — نخزّن يوم كامل
  let revalidateSeconds = 3600;

  if (type === "autocomplete") {
    const input = searchParams.get("input") ?? "";
    url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&language=ar&components=country:sa&key=${KEY}`;
    revalidateSeconds = 3600; // ساعة — الأماكن لا تتغير بسرعة
  } else if (type === "details") {
    const place_id = searchParams.get("place_id") ?? "";
    url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=geometry,formatted_address,address_components,plus_code&language=ar&key=${KEY}`;
    revalidateSeconds = 86400; // يوم — تفاصيل المكان ثابتة جداً
  } else {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: revalidateSeconds },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "upstream error" }, { status: 502 });
  }
}
