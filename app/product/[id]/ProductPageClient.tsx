"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IoArrowForward, IoShareSocial, IoHomeOutline, IoChevronBack, IoCartOutline } from "react-icons/io5";
import Link from "next/link";
import type { Product } from "../../components/products/types";
import { useCartStore } from "../../store/cartStore";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import ProductDetails from "./components/ProductDetails";

const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

export default function ProductPageClient({ id, initialProduct }: { id: string; initialProduct: Product | null }) {
  const router = useRouter();
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const product = initialProduct;

  if (!product)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">المنتج غير موجود</p>
      </div>
    );

  const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src}`;
  // API still used for image resolution only (not for fetching)
  const merged = [...(product.images || []), ...(product.image ? [product.image] : [])];
  const allImages = [...new Set(merged)].map(resolveImg);

  const handleShare = async () => {
    try { await navigator.share({ title: product.name, url: window.location.href }); } catch {}
  };

  const finalPrice = product.salePrice ?? product.originalPrice ?? 0;

  return (
    <main className="min-h-screen bg-white pb-28 lg:pb-16" dir="rtl">

      {/* Top Bar */}
      <header
        className="sticky top-0 z-50 border-b border-gray-200 backdrop-blur-xl bg-white/90"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-[#B5854A] hover:text-[#B5854A] transition bg-gray-50"
            >
              <IoArrowForward size={17} />
            </button>
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <Link href="/" className="hover:text-[#B5854A] transition flex items-center gap-1">
                <IoHomeOutline size={12} />
                الرئيسية
              </Link>
              <IoChevronBack size={10} />
              {product.category && (
                <>
                  <span>{product.category}</span>
                  <IoChevronBack size={10} />
                </>
              )}
              <span className="text-[#B5854A] font-bold truncate max-w-[180px]">{product.name}</span>
            </nav>
          </div>
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-[#B5854A] hover:text-[#B5854A] transition bg-gray-50"
          >
            <IoShareSocial size={15} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-8 lg:gap-12">
          <ProductImages images={allImages} name={product.name} discountPercent={product.discountPercent} />
          <ProductInfo
            product={product}
            addedToCart={addedToCart}
            onAddToCart={(qty) => { addItem(product, qty); setAddedToCart(true); }}
            onBuyNow={(qty) => { addItem(product, qty); router.push("/cart"); }}
          />
        </div>
        <ProductDetails
          description={product.description}
          specs={product.specs}
          gallery={product.gallery}
          specifications={product.specifications}
          rating={product.rating}
          reviews={product.reviews}
        />
      </div>

      {/* Mobile Floating CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl"
      >
        <div className="px-4 py-3" dir="rtl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 truncate flex-1 ml-3">{product.name}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#B5854A]">{finalPrice.toLocaleString("en-US")}</span>
              <span className="text-xs text-gray-400"><img src="/money-icon.webp" alt="ر.س" className="inline w-6 h-6 object-contain align-middle" /></span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (addedToCart) router.push("/cart");
              else { addItem(product, 1); setAddedToCart(true); }
            }}
            className="cart-btn w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-black"
          >
            <IoCartOutline size={20} />
            {addedToCart ? "عرض السلة ✓" : "أضف للسلة"}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
