"use client";
import { useRef, useState, useEffect, ReactNode, ReactElement, useCallback } from "react";

function FadeUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
  </svg>
);
const IconWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

interface ContactSectionProps {
  title?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  fadeDelay?: number;
}

export default function ContactSection({ title = "وسائل التواصل", phone, whatsapp, email, fadeDelay = 300 }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyPhone = useCallback(() => {
    if (!phone) return;
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [phone]);

  const items = [
    phone    && { label: copied ? "✅ تم نسخ الرقم" : "جوال — اضغط للنسخ", value: phone, href: "#", onClick: copyPhone, iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",  hoverBorder: "hover:border-blue-200",    Icon: IconPhone },
    whatsapp && { label: "واتساب",            value: whatsapp, href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`, iconBg: "bg-gradient-to-br from-emerald-500 to-green-600", hoverBorder: "hover:border-emerald-200", Icon: IconWhatsapp },
    email    && { label: "البريد الإلكتروني", value: email,    href: `mailto:${email}`,                            iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",    hoverBorder: "hover:border-rose-200",    Icon: IconMail },
  ].filter(Boolean) as { label: string; value: string; href: string; onClick?: () => void; iconBg: string; hoverBorder: string; Icon: () => ReactElement }[];

  if (!items.length) return null;

  return (
    <FadeUp delay={fadeDelay}>
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="h-1 w-full bg-linear-to-l from-orange-400 via-pink-500 to-rose-500" />
        <div className="p-4 sm:p-7 lg:p-9">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white shadow-md shrink-0">
              <IconPhone />
            </div>
            <div>
              <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold text-gray-800">{title}</h2>
              <div className="h-0.5 w-8 sm:w-10 mt-1 sm:mt-1.5 rounded-full bg-linear-to-l from-orange-400 to-rose-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            {items.map((item, i) => (
              <FadeUp key={item.label} delay={i * 80}>
                <a
                  href={item.onClick ? undefined : item.href}
                  onClick={item.onClick ? (e) => { e.preventDefault(); item.onClick!(); } : undefined}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={`group/card flex items-center gap-3 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50/60 ${item.hoverBorder} hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl ${item.iconBg} flex items-center justify-center text-white shrink-0 shadow-sm group-hover/card:scale-110 transition-transform duration-300`}>
                    <item.Icon />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">{item.label}</p>
                    <p dir="ltr" className="text-xs sm:text-sm font-bold text-gray-700 group-hover/card:text-blue-600 transition-colors break-all leading-snug">
                      {item.value}
                    </p>
                  </div>
                </a>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
