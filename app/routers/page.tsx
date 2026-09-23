import RoutersClient from "./RoutersClient";
import type { Product } from "../components/products/types";
import { sortProducts } from "../lib/sortProducts";

export const metadata = {
  title: "الراوترات والمودم | أفضل أجهزة الإنترنت",
  description: "تسوق أفضل الراوترات والمودم بأسرع سرعات الإنترنت وأقوى التغطية لمنزلك ومكتبك",
};

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alshareehasim-backend.vercel.app";

async function getRouters(): Promise<Product[]> {
  try {
    const res = await fetch(`${BACKEND}/api/products?category=routers`, {
      next: { revalidate: 300, tags: ["products"] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw: Product[] = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
    return sortProducts(raw);
  } catch {
    return [];
  }
}

export default async function RoutersPage() {
  const products = await getRouters();
  return <RoutersClient initialProducts={products} />;
}
