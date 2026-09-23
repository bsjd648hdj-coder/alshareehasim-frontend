import type { Product } from "../components/products/types";

// ترتيب أولويات الـ brands لشرائح الاتصال والراوترات
const BRAND_ORDER: string[] = ["stc", "STC", "موبايلي", "زين", "سلام", "فيرجن"];

function brandPriority(brand?: string): number {
  if (!brand) return BRAND_ORDER.length;
  const idx = BRAND_ORDER.findIndex(
    (b) =>
      brand.toLowerCase().includes(b.toLowerCase()) ||
      b.toLowerCase().includes(brand.toLowerCase())
  );
  return idx !== -1 ? idx : BRAND_ORDER.length;
}

function parseDurationDays(name?: string): number {
  if (!name) return 0;
  if (/سنتين/.test(name)) return 730;
  const years = name.match(/(\d+)\s*(سنة|سنوات)/);
  if (years) return parseInt(years[1]) * 365;
  if (/سنة/.test(name)) return 365;
  if (/شهرين/.test(name)) return 60;
  const months = name.match(/(\d+)\s*(شهر|شهور|أشهر)/);
  if (months) return parseInt(months[1]) * 30;
  if (/شهر/.test(name)) return 30;
  const weeks = name.match(/(\d+)\s*أسبوع/);
  if (weeks) return parseInt(weeks[1]) * 7;
  const days = name.match(/(\d+)\s*يوم/);
  if (days) return parseInt(days[1]);
  return 0;
}

export function sortProducts(products: Product[], byDuration = false): Product[] {
  return [...products].sort((a, b) => {
    // ترتيب حسب مدة الباقة أولاً (للشرائح)
    if (byDuration) {
      const durationDiff = parseDurationDays(b.name) - parseDurationDays(a.name);
      if (durationDiff !== 0) return durationDiff;
    }

    // ترتيب يدوي (sortOrder)
    const aOrder = a.sortOrder ?? 0;
    const bOrder = b.sortOrder ?? 0;
    if (aOrder !== bOrder) return aOrder - bOrder;

    // ترتيب حسب البراند
    const brandDiff = brandPriority(a.brand) - brandPriority(b.brand);
    if (brandDiff !== 0) return brandDiff;

    // ترتيب حسب السعر تنازلياً
    const priceA = a.salePrice ?? a.originalPrice ?? 0;
    const priceB = b.salePrice ?? b.originalPrice ?? 0;
    return priceB - priceA;
  });
}
