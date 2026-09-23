import Link from "next/link";

export interface HeroSlideData {
  /** اسم ملف الصورة في /public مثال: "hero1.webp" */
  image: string;
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryBtn: { label: string; href: string };
  secondaryBtn: { label: string; href: string };
}

export default function HeroSlide({ slide }: { slide: HeroSlideData }) {
  return (
    <section
      dir="rtl"
      className="relative min-h-[85vh] flex items-center overflow-hidden"
      style={{
        backgroundImage: `url('/${slide.image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* Decorative circles */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full border-2 border-[#FC0]/20 pointer-events-none"
        style={{ top: "50%", right: "5%", transform: "translateY(-50%)" }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full border border-[#FC0]/10 pointer-events-none"
        style={{ top: "50%", right: "10%", transform: "translateY(-50%)" }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-xl">

          <div className="inline-block px-5 py-2.5 rounded-full border border-[#FC0]/50 text-[#FC0] text-sm font-semibold mb-6">
            {slide.badge}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-white mb-5">
            {slide.title}
            <br />
            <span className="text-[#FC0]">{slide.titleHighlight}</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10">
            {slide.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href={slide.primaryBtn.href}
              className="px-8 py-4 rounded-2xl bg-[#FC0] text-black font-bold text-lg hover:-translate-y-1 transition-transform duration-200 shadow-lg shadow-[#FC0]/20"
            >
              {slide.primaryBtn.label}
            </Link>
            <Link
              href={slide.secondaryBtn.href}
              className="px-8 py-4 rounded-2xl border border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-colors duration-200"
            >
              {slide.secondaryBtn.label}
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
