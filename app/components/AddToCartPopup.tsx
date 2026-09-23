"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IoCartOutline, IoCheckmarkCircle } from "react-icons/io5";
import { useCartPopupStore } from "../store/cartPopupStore";

const DURATION = 3800; // ms

const fmt = (n: number) => n.toLocaleString("en-US");

export default function AddToCartPopup() {
  const { visible, product, triggerKey, hide } = useCartPopupStore();
  const router = useRouter();

  // progress: 1 → 0
  const [progress, setProgress] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const clearAll = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  // Every time triggerKey changes (new product added), restart timer + progress
  useEffect(() => {
    if (!visible) return;
    clearAll();
    setProgress(1);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const remaining = Math.max(0, 1 - elapsed / DURATION);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      hide();
    }, DURATION);

    return clearAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey, visible]);

  // Cleanup on unmount
  useEffect(() => () => clearAll(), [clearAll]);

  const handleCheckout = () => { hide(); router.push("/checkout"); };
  const handleCart = () => { hide(); router.push("/cart"); };

  return (
    <AnimatePresence>
      {visible && product && (
        <motion.div
          key="cart-popup"
          role="dialog"
          aria-label="تمت إضافة المنتج إلى السلة"
          aria-live="polite"
          initial={{ opacity: 0, x: -40, y: -8, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed top-[72px] left-3 z-[9999] w-[calc(100vw-24px)] max-w-[340px] bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {/* ── Progress bar ── */}
          <div className="h-1 w-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full origin-left"
              style={{
                background: "linear-gradient(90deg,#B5854A,#C8A375)",
                scaleX: progress,
                transformOrigin: "left",
              }}
              transition={{ duration: 0 }}
            />
          </div>

          {/* ── Header ── */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2" dir="rtl">
            <IoCheckmarkCircle size={18} className="text-[#B5854A] shrink-0" />
            <span className="text-sm font-black text-gray-900">تمّت الإضافة إلى سلة التسوق</span>
          </div>

          {/* ── Divider ── */}
          <div className="h-px bg-gray-100 mx-4" />

          {/* ── Product row ── */}
          <div className="flex items-center gap-3 px-4 py-3" dir="rtl">
            {/* Flying image container */}
            <motion.div
              key={product.id + "-img"}
              initial={{ scale: 1.18, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.05 }}
              className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center"
            >
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={56}
                  height={56}
                  className="object-contain w-full h-full p-1"
                  unoptimized
                />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </motion.div>

            <motion.div
              key={product.id + "-info"}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.22 }}
              className="flex flex-col gap-0.5 min-w-0"
            >
              <p className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-snug">
                {product.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className="text-[15px] font-black leading-none"
                  style={{ color: product.hasDiscount ? "#B5854A" : "#111827" }}
                >
                  {fmt(product.price)}
                </span>
                <img
                  src="/money-icon.webp"
                  alt="ر.س"
                  className="w-5 h-5 object-contain"
                />
              </div>
            </motion.div>
          </div>

          {/* ── Buttons ── */}
          <div className="flex gap-2 px-4 pb-4" dir="rtl">
            {/* Primary: Checkout */}
            <button
              onClick={handleCheckout}
              aria-label="إتمام الطلب"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-[13px] font-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5854A]"
              style={{ background: "linear-gradient(135deg,#B5854A,#C8A375)" }}
            >
              <IoCheckmarkCircle size={15} />
              إتمام الطلب
            </button>

            {/* Secondary: Cart */}
            <button
              onClick={handleCart}
              aria-label="عرض السلة"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-gray-800 text-[13px] font-black bg-gray-100 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              <IoCartOutline size={15} />
              عرض السلة
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
