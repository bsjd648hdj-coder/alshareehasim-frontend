import { TrendingUp } from "lucide-react";
import type { Product } from "./products/types";
import ProductCard from "./products/ProductCard";

const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

function effectivePrice(p: Product): number {
  return p.salePrice ?? p.originalPrice ?? 0;
}

function topByBrand(products: Product[], brandPattern: RegExp, count: number): Product[] {
  return products
    .filter((p) => brandPattern.test(p.brand ?? ""))
    .sort((a, b) => effectivePrice(b) - effectivePrice(a))
    .slice(0, count);
}

async function getMostDemanded(): Promise<Product[]> {
  try {
    const res = await fetch(`${BACKEND}/api/products`, {
      next: { revalidate: 300, tags: ["products"] },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const all: Product[] = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];

    // 1. أعلى سعر STC
    const stcSorted = topByBrand(all, /stc/i, 2);
    const stcTop    = stcSorted[0];   // أعلى سعر STC
    const stcSecond = stcSorted[1];   // ثاني أعلى سعر STC

    // 2. أعلى سعر موبايلي
    const mobilyTop = topByBrand(all, /موبايلي/i, 1)[0];

    // 3. أعلى سعر زين
    const zainTop = topByBrand(all, /زين/i, 1)[0];

    // الترتيب المطلوب: STC أعلى → موبايلي → زين → STC ثاني أعلى
    return [stcTop, mobilyTop, zainTop, stcSecond].filter(Boolean) as Product[];
  } catch {
    return [];
  }
}

export default async function MostDemandedSection() {
  const products = await getMostDemanded();
  if (products.length === 0) return null;

  return (
    <section dir="rtl" className="w-full px-2 sm:px-6 lg:px-8 py-8 sm:py-14">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-[#B5854A]" />
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-gray-900">الأكثر طلباً</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">منتجات يختارها عملاؤنا باستمرار</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(181,133,74,0.1)", border: "1px solid rgba(181,133,74,0.25)" }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#B5854A]" />
            <span className="text-[#B5854A] text-xs font-bold">الأعلى مبيعاً</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} priority={i < 2} />
          ))}
        </div>

      </div>
    </section>
  );
}
