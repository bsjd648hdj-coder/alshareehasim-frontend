"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoGridOutline, IoSparkles } from "react-icons/io5";
import type { Product } from "../components/products/types";
import { useProductFilters } from "../(categories)/[slug]/components/useProductFilters";
import ProductsGrid from "../(categories)/[slug]/components/ProductsGrid";
import AnimatedBackground from "../components/AnimatedBackground";

const OPERATORS = [
  {
    name: "STC",
    nameAr: "اس تي سي",
    gradient: "from-[#6B21A8] to-[#9333EA]",
    glow: "shadow-purple-500/30",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    dot: "bg-purple-400",
  },
  {
    name: "Mobily",
    nameAr: "موبايلي",
    gradient: "from-[#065F46] to-[#10B981]",
    glow: "shadow-emerald-500/30",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
  {
    name: "Zain",
    nameAr: "زين",
    gradient: "from-[#1E3A8A] to-[#3B82F6]",
    glow: "shadow-blue-500/30",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    dot: "bg-blue-400",
  },
  {
    name: "Virgin",
    nameAr: "فيرجن",
    gradient: "from-[#9F1239] to-[#F43F5E]",
    glow: "shadow-rose-500/30",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    dot: "bg-rose-400",
  },
];

interface SimCardsClientProps {
  initialProducts: Product[];
}

export default function SimCardsClient({ initialProducts }: SimCardsClientProps) {
  const [page, setPage] = useState(1);
  const { filters, filtered } = useProductFilters(initialProducts);

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
              alt="الشرائح الإلكترونية"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              quality={75}
            />
          </div>

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950/60 via-transparent to-cyan-950/40" />

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 w-fit mb-2 sm:mb-5"
            >
              <span className="flex items-center gap-2 bg-teal-400/10 border border-teal-400/25 text-teal-300 text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
                <IoSparkles size={12} />
                شرائح الاتصال السعودية
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] mb-2 sm:mb-4"
            >
              الشرائح
              <br />
              <span className="bg-gradient-to-l from-teal-300 via-cyan-200 to-teal-400 bg-clip-text text-transparent">
                الإلكترونية
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-white/65 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed mb-4 sm:mb-7"
            >
              اختار الشريحه المناسبه لك من جميع شركات الاتصالات السعوديه
              وتمتع باتصال سريع وتغطيه قويه في كل مكان
            </motion.p>

            {/* Operator pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-wrap gap-2 sm:gap-3"
            >
              {OPERATORS.map((op, i) => (
                <motion.div
                  key={op.name}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.38 + i * 0.07, type: "spring", stiffness: 200 }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border backdrop-blur-sm text-white text-xs sm:text-sm font-bold shadow-lg ${op.bg} ${op.border} ${op.glow}`}
                >
                  <span className={`w-2 h-2 rounded-full ${op.dot} shrink-0`} />
                  {op.nameAr}
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          </div>

          {/* Divider */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>

        {/* ═══════════════ PRODUCTS SECTION ═══════════════ */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center mb-5 sm:mb-7"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <IoGridOutline size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white leading-tight">جميع الشرائح</h2>
                <p className="text-[11px] text-white/50 flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-teal-400">{filtered.length}</span>
                  <span>منتج متاح</span>
                </p>
              </div>
            </div>
          </motion.div>

          <ProductsGrid
            products={filtered}
            loading={false}
            page={page}
            onPageChange={setPage}
            emoji="📶"
          />
        </div>
      </main>
    </>
  );
}
