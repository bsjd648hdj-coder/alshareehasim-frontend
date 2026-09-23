"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IoHomeOutline, IoChevronBack, IoFlash, IoShieldCheckmarkOutline, IoRocketOutline, IoSparkles } from "react-icons/io5";

const features = [
  { icon: IoRocketOutline, text: "شحن سريع" },
  { icon: IoShieldCheckmarkOutline, text: "ضمان معتمد" },
  { icon: IoFlash, text: "تقسيط مريح" },
];

interface Props {
  label: string;
  parentLabel: string;
  parentHref: string;
  productCount: number;
  loading: boolean;
}

export default function CategoryHero({ label, parentLabel, parentHref, productCount, loading }: Props) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#f5e6d3]/60 to-white border-b border-[#C8A375]/20">
      {/* Animated blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-[#C8A375]/25 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#B5854A]/15 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-14 sm:pb-18">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 text-[11px] sm:text-xs text-black/40 mb-8"
        >
          <Link href="/" className="hover:text-black transition flex items-center gap-1">
            <IoHomeOutline size={12} />
            الرئيسية
          </Link>
          <IoChevronBack size={10} />
          <Link href={parentHref} className="hover:text-black transition">{parentLabel}</Link>
          <IoChevronBack size={10} />
          <span className="text-[#B5854A] font-semibold">{label}</span>
        </motion.nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Title block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 bg-[#C8A375]/20 border border-[#C8A375]/40 text-[#B5854A] text-[11px] font-bold px-3 py-1 rounded-full mb-3"
            >
              <IoSparkles size={11} />
              تسوق الآن
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black leading-tight">
              {label}
            </h1>
            <p className="mt-1.5 text-lg sm:text-xl font-bold text-[#C8A375]">
              {parentLabel}
            </p>
          </motion.div>

          {/* Right side: counter + features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex items-center gap-4"
          >
            {/* Product count */}
            {!loading && productCount > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-[#C8A375]/30 bg-[#C8A375]/10 shrink-0"
              >
                <span className="text-xl sm:text-2xl font-black text-[#B5854A]">{productCount}</span>
                <span className="text-[10px] text-black/40">منتج</span>
              </motion.div>
            )}

            {/* Feature pills */}
            <div className="flex flex-row flex-wrap sm:flex-col gap-2">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-2 bg-white/70 border border-[#C8A375]/25 px-3 py-1.5 rounded-full"
                >
                  <div className="w-4 h-4 rounded-full bg-[#B5854A] flex items-center justify-center shrink-0">
                    <f.icon size={9} className="text-white" />
                  </div>
                  <span className="text-black/70 text-[11px] font-medium">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
