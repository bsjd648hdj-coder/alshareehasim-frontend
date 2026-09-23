import { MetadataRoute } from "next";

const BASE_URL = "https://alshareehasim.com";
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

const staticRoutes = [
  { path: "",            priority: 1,   changeFrequency: "daily"   as const },
  { path: "/sim-cards",  priority: 0.9, changeFrequency: "daily"   as const },
  { path: "/routers",    priority: 0.9, changeFrequency: "daily"   as const },
  { path: "/all-products", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/about",      priority: 0.4, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_urls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: new Date(),
  }));

  // Fix 11: نجلب فقط الحقول الضرورية (_id, updatedAt) بدل كل المنتج
  // وأضفنا limit=500 لمنع جلب آلاف المنتجات دفعة واحدة
  let product_urls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/products?limit=500`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const products: { _id: string; updatedAt?: string }[] = await res.json();
      product_urls = products.map((p) => ({
        url: `${BASE_URL}/product/${p._id}`,
        changeFrequency: "weekly",
        priority: 0.6,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      }));
    }
  } catch {
    // skip if backend unavailable
  }

  return [...static_urls, ...product_urls];
}
