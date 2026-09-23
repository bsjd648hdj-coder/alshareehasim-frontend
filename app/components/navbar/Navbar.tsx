"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "./data";
import { Menu, X, User } from "lucide-react";
import { IoBagHandleOutline } from "react-icons/io5";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const cartTotal = useCartStore((s) => s.totalPrice());
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close dropdown on route change
  useEffect(() => {}, [pathname]);

  const handleAccountClick = () => {
    if (user) {
      router.push("/account");
    } else {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  };

  const initials = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : null;

  return (
    <>
      <nav
        dir="rtl"
        className={`sticky top-0 z-[9997] w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-shadow duration-300 ${
          scrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-2 sm:gap-4">

            {/* ── Right: Hamburger + Logo ── */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                aria-label="القائمة"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-[#B5854A] hover:bg-[#FEFEFE] transition-colors"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              <Link href="/" className="flex items-center gap-2 shrink-0">
                <Image
                  src="/logo.webp"
                  alt="logo"
                  width={180}
                  height={72}
                  className="object-contain h-12 w-auto sm:h-10 lg:h-14"
                />
              </Link>
            </div>

            {/* ── Center: Desktop Nav ── */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      isActive
                        ? "text-[#B5854A] bg-[#FEFEFE]"
                        : "text-gray-600 hover:text-[#B5854A] hover:bg-[#FEFEFE]"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-1 right-4 left-4 h-0.5 rounded-full bg-[#B5854A] transition-all duration-200 ${
                        isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* ── Left: Icons ── */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">

              {/* Account */}
              <div className="relative">
                <button
                  aria-label={user ? "حسابي" : "تسجيل الدخول"}
                  onClick={handleAccountClick}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#B5854A] hover:bg-[#FEFEFE] transition-colors relative"
                >
                  {mounted && user && initials ? (
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0f2744] text-white text-xs font-bold flex items-center justify-center">
                      {initials}
                    </span>
                  ) : (
                    <User className={`w-5 h-5 sm:w-6 sm:h-6 ${mounted && user ? "text-[#B5854A]" : ""}`} />
                  )}
                </button>
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label="السلة"
                className="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-500 hover:text-[#B5854A] hover:bg-[#FEFEFE] transition-colors"
              >
                <div className="relative">
                  <IoBagHandleOutline className="w-5 h-5 sm:w-6 sm:h-6" />
                  {mounted && itemCount > 0 && (
                    <span className="absolute -top-1 -left-1 bg-[#B5854A] text-white text-[9px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full px-0.5">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-0.5 text-sm font-bold text-gray-800">
                  {mounted ? cartTotal.toLocaleString("ar-SA") : "0"}
                  <img src="/money-icon.webp" alt="ر.س" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                </span>
              </Link>

            </div>
          </div>
        </div>

        <MobileMenu items={navItems} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />
      </nav>

    </>
  );
}
