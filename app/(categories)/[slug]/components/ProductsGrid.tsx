"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowForward, IoArrowBack } from "react-icons/io5";
import ProductCard from "../../../components/products/ProductCard";
import type { Product } from "../../../components/products/types";

const ITEMS_PER_PAGE = 12;

interface Props {
  products: Product[];
  loading: boolean;
  page: number;
  onPageChange: (p: number) => void;
  emoji?: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-[20px] overflow-hidden border border-gray-100 bg-gray-50">
      <div className="w-full aspect-[3/2] animate-pulse bg-gray-100" />
      <div className="p-3 space-y-2.5">
        <div className="h-3 animate-pulse rounded-full w-1/2 bg-gray-100" />
        <div className="h-4 animate-pulse rounded-full w-3/4 bg-gray-100" />
      </div>
      <div className="h-10 animate-pulse mx-3 mb-3 rounded-xl bg-[#DCEFE8]" />
    </div>
  );
}

export default function ProductsGrid({ products, loading, page, onPageChange, emoji = "📦" }: Props) {
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginated = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const goTo = (p: number) => {
    onPageChange(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!products.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 gap-5 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-3xl bg-[#DCEFE8] flex items-center justify-center text-5xl border border-[#DCEFE8]"
        >
          {emoji}
        </motion.div>
        <div>
          <p className="text-gray-800 text-lg font-black mb-1.5">لا توجد منتجات مطابقة</p>
          <p className="text-gray-400 text-sm">جرب تغيير الفلاتر أو مسحها</p>
        </div>
        <Link
          href="/"
          className="text-sm font-bold text-[#47A557] hover:text-[#47A557]/80 flex items-center gap-1.5 bg-[#47A557]/10 border border-[#47A557]/20 px-5 py-2.5 rounded-full transition-all"
        >
          <IoArrowForward size={14} />
          العودة للرئيسية
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        <AnimatePresence mode="wait">
          {paginated.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center items-center gap-2 mt-10"
          dir="rtl"
        >
          <button
            onClick={() => goTo(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 bg-[#DCEFE8] border border-[#47A557]/20 text-[#47A557] hover:bg-[#47A557] hover:text-white"
          >
            <IoArrowForward size={13} />
            السابق
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => goTo(n)}
              className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                page === n
                  ? "bg-[#47A557] text-white shadow-md shadow-[#47A557]/30 scale-110"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#47A557]/40 hover:text-[#47A557]"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => goTo(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 bg-[#DCEFE8] border border-[#47A557]/20 text-[#47A557] hover:bg-[#47A557] hover:text-white"
          >
            التالي
            <IoArrowBack size={13} />
          </button>
        </motion.div>
      )}
    </>
  );
}
