import { Suspense } from "react";
import AllProductsClient from "./AllProductsClient";
import type { Product } from "../components/products/types";
import { sortProducts } from "../lib/sortProducts";

export const metadata = {
  title: "جميع الشرائح والمنتجات | لمسة الثابتة",
  description: "تصفح جميع شرائح الاتصال وباقات الإنترنت والراوترات بأفضل الأسعار من لمسة الثابتة",
};

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alshareehasim-backend.vercel.app";

async function getProducts(brand?: string): Promise<Product[]> {
  try {
    const url = brand
      ? `${BACKEND}/api/products?brand=${encodeURIComponent(brand)}`
      : `${BACKEND}/api/products`;
    const res = await fetch(url, {
      next: { revalidate: 300, tags: ["products"] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw: Product[] = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
    return sortProducts(raw, !!brand);
  } catch {
    return [];
  }
}

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const products = await getProducts(brand);

  return (
    <Suspense>
      <AllProductsClient initialProducts={products} initialBrand={brand || ""} />
    </Suspense>
  );
}
