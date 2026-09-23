"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoCartOutline,
  IoCheckmarkCircle,
  IoWifiOutline,
} from "react-icons/io5";
import type { Product } from "./types";
import { useCartStore } from "../../store/cartStore";
import { useCartPopupStore } from "../../store/cartPopupStore";

const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";
const resolveImgUrl = (src: string) => {
  if (src.startsWith("http")) return encodeURI(decodeURI(src));
  const path = src.startsWith("/") ? src : "/" + src;
  return `${API}${encodeURI(decodeURI(path))}`;
};

const fmt = (n: number) => n.toLocaleString("en-US");

export default function ProductCard({
  product,
  priority = false,
  rank,
}: {
  product: Product;
  priority?: boolean;
  rank?: number;
}) {
  const {
    name,
    discountPercent = 0,
    brand,
    inStock,
    installment,
    network,
  } = product;

  const image = product.images?.[0] || product.image;
  const resolvedImage = image ? resolveImgUrl(image) : undefined;
  const originalPrice = product.originalPrice || product.price || 0;
  const salePrice =
    product.salePrice && product.salePrice > 0 ? product.salePrice : undefined;
  const hasDiscount = salePrice != null && salePrice < originalPrice;
  const displayPrice = hasDiscount ? salePrice : originalPrice;
  const savings = hasDiscount ? originalPrice - salePrice : 0;

  const addItem = useCartStore((s) => s.addItem);
  const showPopup = useCartPopupStore((s) => s.show);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    // addItem is synchronous (Zustand local store)
    addItem(product);

    setLoading(false);
    setAdded(true);

    showPopup({
      id: product._id,
      name: product.name,
      image: resolvedImage ?? null,
      price: displayPrice ?? 0,
      hasDiscount,
    });

    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="relative h-full animate-fade-in-down">
        <Link
          href={`/product/${product._id}`}
          dir="rtl"
          className="group relative flex flex-col h-full rounded-[20px] overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {/* Glow on hover */}


          {/* ══ IMAGE ZONE ══ */}
          <div className="relative w-full overflow-hidden">
            {/* Rank badge */}
            {rank != null && (
              <div
                className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
                style={
                  rank === 1
                    ? {
                        background: "linear-gradient(135deg, #B5854A 0%, #C8A375 100%)",
                        color: "#ffffff",
                        boxShadow: "0 2px 10px rgba(181,133,74,0.4)",
                      }
                    : {
                        background: "rgba(181,133,74,0.1)",
                        color: "#B5854A",
                        border: "1px solid rgba(181,133,74,0.35)",
                      }
                }
              >
                {rank}
              </div>
            )}

            {/* Product image */}
            {resolvedImage ? (
              <Image
                src={resolvedImage}
                alt={name}
                width={600}
                height={600}
                className="w-full h-auto object-contain block transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            ) : (
              <div className="flex items-center justify-center h-28 sm:h-40 text-4xl sm:text-5xl">📱</div>
            )}
          </div>

          {/* ══ CONTENT ZONE ══ */}
          <div className="flex flex-col flex-1 px-2.5 sm:px-3.5 pt-2 sm:pt-3 pb-2.5 sm:pb-3.5 gap-1.5 sm:gap-2">

            {/* Brand + network row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {brand && (
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none"
                  style={{
                    background: "rgba(181,133,74,0.1)",
                    border: "1px solid rgba(181,133,74,0.3)",
                    color: "#B5854A",
                  }}
                >
                  {brand}
                </span>
              )}
              {network && (
                <span
                  className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none"
                  style={{
                    background: "rgba(181,133,74,0.08)",
                    border: "1px solid rgba(181,133,74,0.2)",
                    color: "#B5854A",
                  }}
                >
                  <IoWifiOutline size={8} />
                  {network}
                </span>
              )}
            </div>

            {/* Product name */}
            <h3 className="text-[11px] sm:text-[14px] font-bold text-gray-900 leading-[1.4] line-clamp-2 flex-1">
              {name}
            </h3>

            {/* Divider */}
            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(90deg, rgba(181,133,74,0.25), rgba(181,133,74,0.06) 60%, transparent)",
              }}
            />

            {/* Price block */}
            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                {hasDiscount && (
                  <span className="text-[11px] line-through leading-none text-gray-400">
                    {fmt(originalPrice)} <img src="/money-icon.webp" alt="ر.س" className="inline w-3 h-3 object-contain align-middle" />
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-[16px] sm:text-[26px] font-black leading-none tracking-tight"
                    style={{ color: hasDiscount ? "#B5854A" : "#111827" }}
                  >
                    {fmt(displayPrice!)}
                  </span>
                  <img src="/money-icon.webp" alt="ر.س" className="w-6 sm:w-8 h-6 sm:h-8 object-contain mb-0.5" />
                </div>
              </div>

              {hasDiscount && savings > 0 && (
                <div className="shrink-0 text-center animate-fade-in-down">
                  <div className="text-[8px] text-gray-400 leading-none mb-0.5">وفّرت</div>
                  <div
                    className="text-[10px] font-black px-2 py-0.5 rounded-lg leading-none whitespace-nowrap"
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#fca5a5",
                    }}
                  >
                    {fmt(savings)} <img src="/money-icon.webp" alt="ر.س" className="inline w-3 h-3 object-contain align-middle" />
                  </div>
                </div>
              )}
            </div>

            {/* Cart button */}
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              aria-label="أضف إلى السلة"
              className={`cart-btn ${added ? "added" : ""}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </motion.span>
                ) : added ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <IoCheckmarkCircle size={16} />
                    تمت الإضافة
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <IoCartOutline size={16} />
                    أضف للسلة
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </Link>
      </div>
    </>
  );
}
