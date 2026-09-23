"use client";
import { useEffect, useRef, useState } from "react";
import ContactSection from "../components/ContactSection";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.98)",
      transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconHeadset = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M3 18v-6a9 9 0 0118 0v6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPercent = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <line x1="19" y1="5" x2="5" y2="19" strokeLinecap="round"/>
    <circle cx="6.5" cy="6.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <rect x="1" y="3" width="15" height="13" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 8h4l3 5v4h-7V8z" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.8}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const stats = [
  { value: "١٠٠٪", label: "ضمان الجودة",  Icon: IconShield,  accent: "#053132", gradient: "from-[#053132] to-[#092C32]" },
  { value: "٢٤/٧",  label: "دعم فني",      Icon: IconHeadset, accent: "#082D32", gradient: "from-[#082D32] to-[#0A2931]" },
  { value: "٠٪",    label: "بدون فوائد",   Icon: IconPercent, accent: "#0A2931", gradient: "from-[#0A2931] to-[#0B2631]" },
  { value: "سريع",  label: "توصيل",        Icon: IconTruck,   accent: "#0B2631", gradient: "from-[#0B2631] to-[#053132]" },
];

const sections = [
  {
    Icon: IconStore,
    title: "من نحن",
    accent: "#053132",
    content: [
      "مؤسسة مدار الاجهزة الالكترونية هو متجر إلكتروني متخصص في تقديم المنتجات والخدمات بجودة عالية وتجربة شراء سهلة وآمنة تناسب احتياجات العملاء.",
      "نحن نحرص على توفير أفضل الحلول والعروض مع الاهتمام بالتفاصيل التي تمنح العميل تجربة احترافية بداية من تصفح المنتجات وحتى إتمام الطلب.",
      "مؤسسة مدار الاجهزة الالكترونية هو اختيارك الأول لشراء أحدث الأجهزة الإلكترونية بأقساط سهلة وبدون فوائد، وتلقى عندنا تجربة مختلفة تبدأ من جودة الخدمة وسرعة التوصيل إلى اهتمام كبير بخدمة ما بعد البيع.",
    ],
  },
  {
    Icon: IconTarget,
    title: "رؤيتنا",
    accent: "#0A2931",
    content: [
      "تقديم تجربة تسوق إلكترونية موثوقة وسريعة ومريحة، مع الحفاظ على أعلى معايير الجودة وخدمة العملاء.",
    ],
  },
  {
    Icon: IconStar,
    title: "رسالتنا",
    accent: "#082D32",
    content: [
      "نسعى إلى بناء ثقة طويلة الأمد مع عملائنا من خلال منتجات مميزة، دعم سريع، وشفافية كاملة في التعامل.",
    ],
  },
];

export default function AboutClient() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [company, setCompany] = useState<{ phone?: string; whatsapp?: string; email?: string; addressAr?: string } | null>(null);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    fetch("/api/admin/company/public").then((r) => r.json()).then((d) => setCompany(d)).catch(() => {});
  }, []);

  const anim = (delay: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f9fc] overflow-x-hidden">

      {/* ══ HERO ══ */}
      <section className="relative w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #053132 0%, #092C32 40%, #0A2931 70%, #0B2631 100%)" }}>

        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-[80px]" />
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-[60px]" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="absolute bottom-0 left-1/2 w-[600px] h-40 -translate-x-1/2 blur-[50px]" style={{ background: "rgba(5,49,50,0.4)" }} />
        </div>

        {/* grid pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-10 py-20 sm:py-32 text-center text-white">
          <div {...anim(80)} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6" style={{ color: "#a7f3d0" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            تعرف علينا
          </div>

          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-5 leading-tight tracking-tight">
            عن مدار
            <span className="block text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to left, #a7f3d0, #ffffff)" }}>
              الاجهزة الالكترونية
            </span>
          </h1>

          <p {...anim(340)} className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(167,243,208,0.85)" }}>
            تعرف على نشاط المتجر ورؤيتنا والخدمات التي نقدمها لعملائنا
          </p>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 70" className="w-full h-12 sm:h-16" preserveAspectRatio="none">
            <path d="M0,35 C240,70 480,0 720,35 C960,70 1200,0 1440,35 L1440,70 L0,70 Z" fill="#f8f9fc" />
          </svg>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 90}>
              <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-5 text-center overflow-hidden hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-l ${s.gradient}`} />
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mx-auto mb-2 sm:mb-3 text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <s.Icon />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold mb-0.5" style={{ color: s.accent }}>{s.value}</p>
                <p className="text-[11px] sm:text-xs text-gray-500 font-semibold tracking-wide">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══ SECTIONS ══ */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-10 space-y-4 sm:space-y-5">
        {sections.map((s, i) => (
          <FadeUp key={s.title} delay={i * 100}>
            <div className="group bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full h-1.5 sm:w-1.5 sm:h-auto shrink-0" style={{ background: s.accent }} />
                <div className="flex-1 p-4 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"
                      style={{ background: `${s.accent}18`, color: s.accent }}>
                      <s.Icon />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold text-gray-800">{s.title}</h2>
                      <div className="h-0.5 w-8 mt-1 rounded-full" style={{ background: s.accent }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {s.content.map((p, j) => (
                      <p key={j} className="text-gray-600 leading-relaxed text-sm sm:text-base">{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        ))}

        <ContactSection
          title="وسائل التواصل"
          phone={company?.phone}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={300}
        />
      </section>

      <div className="h-16" />
    </main>
  );
}
