"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ProductImagesProps {
  images: string[];
  name: string;
  discountPercent?: number;
}

export default function ProductImages({ images: rawImages, name, discountPercent = 0 }: ProductImagesProps) {
  const images = rawImages.filter((img) => {
    try { return !!img && !!new URL(img); } catch { return false; }
  });
  const [selected, setSelected] = useState(0);
  const touchStart = useRef(0);
  const goTo = (i: number) => setSelected((i + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-[80px]">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden border border-[#003160]">


        <div
          className="relative w-full min-h-[200px] sm:min-h-[300px]"
          style={{}}
          onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStart.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50 && images.length > 1) goTo(selected + (diff > 0 ? 1 : -1));
          }}
        >
          <AnimatePresence mode="wait">
            {images.length > 0 ? (
              <motion.div
                key={selected}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Image
                  src={images[selected]}
                  alt={name}
                  width={800}
                  height={800}
                  className="w-full object-cover block min-h-[200px] sm:min-h-[300px]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-white/20 text-sm">لا توجد صورة</div>
            )}
          </AnimatePresence>
        </div>


      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                i === selected ? "border-[#FC0]" : "border-[#003160] opacity-50 hover:opacity-80"
              }`}

            >
              <Image src={img} alt="" fill className="object-contain p-1.5" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
