"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  IoGridOutline, IoWifi, IoHome,
  IoSpeedometer, IoSparkles, IoCheckmarkCircle,
} from "react-icons/io5";
import type { Product } from "../components/products/types";
import { sortProducts } from "../lib/sortProducts";
import { useProductFilters } from "../(categories)/[slug]/components/useProductFilters";
import ProductsGrid from "../(categories)/[slug]/components/ProductsGrid";
import AnimatedBackground from "../components/AnimatedBackground";

const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

const BRANDS = [
  { name: "TP-Link",  border: "border-orange-500/30", bg: "bg-orange-500/10", dot: "bg-orange-400" },
  { name: "Huawei",   border: "border-red-500/30",    bg: "bg-red-500/10",    dot: "bg-red-400"    },
  { name: "Cisco",    border: "border-blue-500/30",   bg: "bg-blue-500/10",   dot: "bg-blue-400"   },
  { name: "Netgear",  border: "border-teal-500/30",   bg: "bg-teal-500/10",   dot: "bg-teal-400"   },
];



export default function RoutersClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const [rawProducts, setRawProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [page, setPage] = useState(1);

  const { filters, filtered } = useProductFilters(rawProducts);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    fetch(`/api/products?category=routers`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const raw = Array.isArray(data) ? data : Array.isArray((data as { products?: Product[] })?.products) ? (data as { products: Product[] }).products : [];
        setRawProducts(sortProducts(raw));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initialProducts.length]);

  const [prevFilters, setPrevFilters] = useState(filters);
  if (prevFilters !== filters) { setPrevFilters(filters); if (page !== 1) setPage(1); }

  return (
    <>
      <AnimatedBackground />
      <main className="min-h-screen" dir="rtl">

        {/* ═══════════════ HERO ═══════════════ */}
        <div className="relative h-[240px] sm:h-[320px] md:h-[380px] overflow-hidden">

          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/hero2.webp"
              alt="الراوترات والمودم"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/60 via-transparent to-teal-950/40" />

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 w-fit mb-2 sm:mb-5"
            >
              <span className="flex items-center gap-2 bg-blue-400/10 border border-blue-400/25 text-blue-300 text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
                <IoSparkles size={12} />
                أجهزة الشبكات والإنترنت
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] mb-2 sm:mb-4"
            >
              الراوترات
              <br />
              <span className="bg-gradient-to-l from-blue-300 via-cyan-200 to-teal-400 bg-clip-text text-transparent">
                والمودم
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-white/65 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed mb-4 sm:mb-7"
            >
              اختار الراوتر المناسب لمنزلك أو مكتبك وتمتع بإنترنت سريع
              وتغطية قوية في كل زاوية
            </motion.p>

            {/* Brand pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-wrap gap-2 sm:gap-3"
            >
              {BRANDS.map((b, i) => (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.38 + i * 0.07, type: "spring", stiffness: 200 }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border backdrop-blur-sm text-white text-xs sm:text-sm font-bold shadow-lg ${b.bg} ${b.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${b.dot} shrink-0`} />
                  {b.name}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-8 sm:h-14 md:h-20 block">
              <path
                d="M0,80 L0,40 Q180,80 360,40 Q540,0 720,40 Q900,80 1080,40 Q1260,0 1440,40 L1440,80 Z"
                fill="#001331"
              />
            </svg>
          </div>
        </div>

        {/* ═══════════════ FEATURES STRIP ═══════════════ */}
        <div className="relative z-10 -mt-1 bg-[#001331]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <IoGridOutline size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white leading-tight">جميع الراوترات</h2>
                {!loading && (
                  <p className="text-[11px] text-white/50 flex items-center gap-1.5 mt-0.5">
                    <span className="font-bold text-blue-400">{filtered.length}</span>
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
            emoji="📡"
          />
        </div>
      </main>
    </>
  );
}
