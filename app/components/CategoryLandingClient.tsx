"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IoHomeOutline,
  IoChevronBack,
  IoArrowForward,
  IoArrowBack,
  IoGridOutline,
  IoFlash,
  IoShieldCheckmarkOutline,
  IoRocketOutline,
  IoSparkles,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./products/ProductCard";
import type { Product } from "./products/types";
import { sortProducts } from "../lib/sortProducts";

const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

export interface SubCategoryCard {
  slug: string;
  label: string;
  emoji: string;
  href: string;
}

interface Props {
  title: string;
  emoji: string;
  subCategories: SubCategoryCard[];
  filterFn: (p: Product) => boolean;
}

const features = [
  { icon: IoRocketOutline, text: "شحن سريع" },
  { icon: IoShieldCheckmarkOutline, text: "ضمان معتمد" },
  { icon: IoFlash, text: "تقسيط مريح" },
];

function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* blobs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,.25) 0%, transparent 65%)", top: "-30%", right: "-15%" }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,.18) 0%, transparent 65%)", bottom: "-20%", left: "-10%" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* grid lines */}
      <div
        className="absolute inset-0 opacity-[.07]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />
    </div>
  );
}

export default function CategoryLandingClient({ title, emoji, subCategories, filterFn }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(sortProducts(data.filter(filterFn))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterFn]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  return (
    <>
      <main className="min-h-screen bg-[#f8f9fb]" dir="rtl">
        {/* ═══════════ HERO ═══════════ */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0d1f2d 0%, #0a3d3a 40%, #0d4f45 70%, #0a3d3a 100%)" }}
        >
          <HeroBg />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-10 sm:pb-14">

            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/50 mb-8 sm:mb-10"
            >
              <Link href="/" className="hover:text-white/90 transition flex items-center gap-1">
                <IoHomeOutline size={13} />
                الرئيسية
              </Link>
              <IoChevronBack size={11} />
              <span className="text-white/80 font-medium">{title}</span>
            </motion.nav>

            {/* Main content */}
            <div className="flex flex-col gap-6">

              {/* Title row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1 }}
                >
                  <p className="text-teal-300/80 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
                    {emoji} تسوق الآن
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                    {title}
                  </h1>
                </motion.div>

                {!loading && products.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-white/10 bg-white/[.07] backdrop-blur-sm"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-white">{products.length}</span>
                    <span className="text-[10px] sm:text-xs text-white/60 font-medium">منتج</span>
                  </motion.div>
                )}
              </div>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex gap-2 flex-wrap"
              >
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/[.08] border border-white/[.1] backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-[11px] sm:text-xs font-medium"
                  >
                    <f.icon size={13} className="text-teal-300" />
                    {f.text}
                  </div>
                ))}
              </motion.div>

            </div>
          </div>

          {/* bottom wave */}
          <div className="relative z-10">
            <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-8 sm:h-12 block">
              <path d="M0,48 L0,20 Q360,48 720,20 Q1080,-8 1440,20 L1440,48 Z" fill="#f8f9fb" />
            </svg>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
          {/* ═══════════ SUB-CATEGORIES GRID ═══════════ */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200/50">
              <IoGridOutline size={18} className="text-white" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">الأقسام الفرعية</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 mb-10 sm:mb-14">
            {subCategories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Link
                  href={cat.href}
                  className="group relative flex flex-col items-center gap-3 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-100/40 transition-all duration-300"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-2xl sm:text-3xl group-hover:from-teal-100 group-hover:to-emerald-100 transition-all shadow-sm group-hover:scale-110 group-hover:shadow-md duration-300">
                    {cat.emoji}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-teal-700 transition text-center leading-relaxed">
                    {cat.label}
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/[.03] to-emerald-500/[.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ═══════════ ALL PRODUCTS ═══════════ */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-6 sm:mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200/50">
              <IoSparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">جميع المنتجات</h2>
              {!loading && products.length > 0 && (
                <p className="text-[11px] text-gray-400">صفحة {page} من {totalPages || 1}</p>
              )}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse" />
                  <div className="p-3 sm:p-4 space-y-2.5">
                    <div className="h-3.5 bg-gray-100 animate-pulse rounded-full w-3/4" />
                    <div className="h-3.5 bg-gray-100 animate-pulse rounded-full w-1/2" />
                  </div>
                  <div className="h-11 bg-gray-50 animate-pulse mx-3 mb-3 rounded-xl" />
                </div>
              ))}
            </div>
          ) : !products.length ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-5 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-5xl shadow-lg shadow-teal-100/50 border border-teal-100/50"
              >
                {emoji}
              </motion.div>
              <div>
                <p className="text-gray-800 text-lg font-black mb-1.5">المنتجات ستُضاف قريباً</p>
                <p className="text-gray-400 text-sm">هذا القسم قيد التحضير، تابعنا للمزيد</p>
              </div>
              <Link
                href="/"
                className="mt-2 text-sm font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1.5 bg-teal-50 px-5 py-2.5 rounded-full transition-all hover:shadow-md hover:shadow-teal-100"
              >
                <IoArrowForward size={14} />
                العودة إلى الرئيسية
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                <AnimatePresence mode="wait">
                  {products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center items-center gap-1.5 sm:gap-2 mt-12"
                >
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-bold disabled:opacity-30 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm hover:shadow-md"
                  >
                    <IoArrowForward size={14} />
                    السابق
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-xs sm:text-sm font-black transition-all ${
                        page === n
                          ? "bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-200/60 scale-110"
                          : "bg-white border border-gray-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 shadow-sm"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-bold disabled:opacity-30 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm hover:shadow-md"
                  >
                    التالي
                    <IoArrowBack size={14} />
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
