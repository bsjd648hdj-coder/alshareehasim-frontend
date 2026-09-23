import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orderRes, companyRes] = await Promise.all([
    fetch(`${getBackend()}/api/checkout/${id}`, forwardCookies(req, {})),
    fetch(`${getBackend()}/api/admin/company`, forwardCookies(req, {})),
  ]);
  const order = await orderRes.json();
  const company = await companyRes.json();

  // جلب صور المنتجات في الـ backend بدلاً من N+1 في الـ frontend
  const itemsWithImages = await Promise.all(
    (order.items || []).map(async (item: { productId?: string; name: string; price: number; quantity: number }) => {
      if (!item.productId) return item;
      try {
        const pRes = await fetch(`${getBackend()}/api/admin/products/${item.productId}`, forwardCookies(req, {}));
        if (!pRes.ok) return item;
        const p = await pRes.json();
        return { ...item, image: p.image || p.images?.[0] || "" };
      } catch {
        return item;
      }
    })
  );

  return NextResponse.json({ order: { ...order, items: itemsWithImages }, company });
}
