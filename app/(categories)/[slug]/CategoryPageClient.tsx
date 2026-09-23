"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { IoOptions, IoGridOutline } from "react-icons/io5";
import type { Product } from "../../components/products/types";
import { slugConfigs } from "../../lib/categoryConfig";
import { sortProducts } from "../../lib/sortProducts";
import { useProductFilters } from "./components/useProductFilters";
import CategoryHero from "./components/CategoryHero";
import FiltersSidebar from "./components/FiltersSidebar";
import ProductsGrid from "./components/ProductsGrid";

const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

function filterProducts(products: Product[], slug: string): Product[] {
  const config = slugConfigs[slug];
  if (!config) return products;
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  return products.filter((p) => {
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category ? p.category === category : true;
    const matchName = nameIncludes?.length
      ? nameIncludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    const matchExclude = nameExcludes?.length
      ? !nameExcludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : true;
    return matchBrand && matchCategory && matchName && matchExclude;
  });
}

export default function CategoryPageClient({
  slug,
  initialProducts = [],
}: {
  slug: string;
  initialProducts?: Product[];
}) {
  const config = slugConfigs[slug];
  if (!config) notFound();

  const [rawProducts, setRawProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { filters, filtered, storageOptions, maxProductPrice, activeCount, toggle, toggleStorage, reset } =
    useProductFilters(rawProducts);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    const brand = config?.filters.brand ?? "";
    const query = brand ? `?brand=${encodeURIComponent(brand)}` : "";
    fetch(`/api/products${query}`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const raw = Array.isArray(data) ? data : Array.isArray((data as { products?: Product[] })?.products) ? (data as { products: Product[] }).products : [];
        setRawProducts(sortProducts(filterProducts(raw, slug)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, config?.filters.brand, initialProducts.length]);

  const [prevFilters, setPrevFilters] = useState(filters);
  if (prevFilters !== filters) {
    setPrevFilters(filters);
    if (page !== 1) setPage(1);
  }

  const label = config?.label ?? slug;
  const parentLabel = config?.parentLabel ?? "";
  const parentHref = config?.parentHref ?? "/";

  return (
    <main className="min-h-screen bg-white" dir="rtl">
      <CategoryHero
        label={label}
        parentLabel={parentLabel}
        parentHref={parentHref}
        productCount={filtered.length}
        loading={loading}
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-5 sm:mb-7"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#47A557] flex items-center justify-center shadow-lg shadow-[#47A557]/20">
              <IoGridOutline size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-black leading-tight">جميع المنتجات</h2>
              {!loading && (
                <p className="text-[11px] text-black/40 flex items-center gap-1">
                  <span className="font-bold text-[#47A557]">{filtered.length}</span> منتج
                  {activeCount > 0 && (
                    <span className="bg-[#80C78D]/20 text-[#47A557] border border-[#80C78D]/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full">مفلتر</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Mobile filter button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#80C78D]/10 border border-[#80C78D]/25 text-xs font-bold text-black hover:border-[#47A557] hover:text-[#47A557] transition-all relative"
          >
            <IoOptions size={15} />
            فلترة وترتيب
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#47A557] text-white text-[9px] font-black flex items-center justify-center shadow-md"
              >
                {activeCount}
              </motion.span>
            )}
          </motion.button>
        </motion.div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-5 lg:gap-7 items-start">
          <FiltersSidebar
            filters={filters}
            storageOptions={storageOptions}
            maxProductPrice={maxProductPrice}
            activeCount={activeCount}
            onToggle={toggle}
            onToggleStorage={toggleStorage}
            onReset={reset}
            mobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          <div className="flex-1 min-w-0">
            <ProductsGrid
              products={filtered}
              loading={loading}
              page={page}
              onPageChange={setPage}
              emoji="📱"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
