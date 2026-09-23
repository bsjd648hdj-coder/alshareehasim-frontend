"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoGridOutline, IoSparkles } from "react-icons/io5";
import type { Product } from "../components/products/types";
import { sortProducts } from "../lib/sortProducts";
import { useProductFilters } from "../(categories)/[slug]/components/useProductFilters";
import ProductsGrid from "../(categories)/[slug]/components/ProductsGrid";

const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

interface AllProductsClientProps {
  initialProducts?: Product[];
  initialBrand?: string;
}

export default function AllProductsClient({
  initialProducts = [],
  initialBrand = "",
}: AllProductsClientProps) {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") ?? "";

  const isInitialMatch = brand === initialBrand && initialProducts.length > 0;
  const [rawProducts, setRawProducts] = useState<Product[]>(isInitialMatch ? initialProducts : []);
  const [loading, setLoading] = useState(!isInitialMatch);
  const [page, setPage] = useState(1);

  const { filters, filtered } = useProductFilters(rawProducts);

  useEffect(() => {
    if (brand === initialBrand && initialProducts.length > 0) {
      setRawProducts(initialProducts);
      setLoading(false);
      return;
    }

    setLoading(true);
    const url = brand
      ? `/api/products?brand=${encodeURIComponent(brand)}`
      : `/api/products`;
    fetch(url)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const raw = Array.isArray(data) ? data : Array.isArray((data as { products?: Product[] })?.products) ? (data as { products: Product[] }).products : [];
        setRawProducts(sortProducts(raw, !!brand));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [brand, initialBrand, initialProducts]);

  const [prevFilters, setPrevFilters] = useState(filters);
  if (prevFilters !== filters) { setPrevFilters(filters); if (page !== 1) setPage(1); }

  return (
    <main className="min-h-screen bg-white" dir="rtl">

      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative h-[240px] sm:h-[320px] md:h-[380px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/hero1.webp" alt={brand ? `منتجات ${brand}` : "جميع المنتجات"} fill className="object-cover object-center" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

        <div className="relative z-10 h-full flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 w-fit mb-2 sm:mb-5"
          >
            <span className="flex items-center gap-2 bg-[#C8A375]/20 border border-[#C8A375]/40 text-[#C8A375] text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
              <IoSparkles size={12} />
              تسوق الآن
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] mb-2 sm:mb-4"
          >
            {brand ? "منتجات" : "جميع"}
            <br />
            <span className="text-[#C8A375]">
              {brand || "المنتجات"}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="text-white/70 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed mb-4 sm:mb-7"
          >
            {brand
              ? `تصفح جميع منتجات ${brand} بأفضل الأسعار وأعلى جودة`
              : "تصفح جميع منتجاتنا من شرائح اتصال وراوترات وأجهزة إنترنت بأفضل الأسعار وأعلى جودة"}
          </motion.p>

          {!loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
              className="flex items-center gap-2 w-fit"
            >
              <span className="flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="text-[#C8A375] font-black text-base sm:text-lg">{rawProducts.length}</span>
                منتج متاح
              </span>
            </motion.div>
          )}
        </div>

        {/* Bottom wave → white */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-8 sm:h-14 md:h-20 block">
            <path
              d="M0,80 L0,40 Q180,80 360,40 Q540,0 720,40 Q900,80 1080,40 Q1260,0 1440,40 L1440,80 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* ═══════════════ PRODUCTS SECTION ═══════════════ */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center mb-5 sm:mb-7"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B5854A] flex items-center justify-center shadow-lg shadow-[#B5854A]/20">
              <IoGridOutline size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-black leading-tight">{brand ? `منتجات ${brand}` : "جميع المنتجات"}</h2>
              {!loading && (
                <p className="text-[11px] text-black/40 flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-[#B5854A]">{filtered.length}</span>
                  <span>منتج متاح</span>
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <ProductsGrid
          products={filtered}
          loading={loading}
          page={page}
          onPageChange={setPage}
          emoji="🛍️"
        />
      </div>
    </main>
  );
}
