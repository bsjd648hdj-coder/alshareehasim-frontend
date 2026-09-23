"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const slides = ["/hero.webp", "/hero2.webp"];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="w-full">
      <div className="mx-1 sm:mx-8 lg:mx-16 my-4">
        <div className="relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: "2/1" }}>
          {slides.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt="hero"
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              quality={75}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) calc(100vw - 64px), calc(100vw - 128px)"
              className={`object-cover object-center transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
