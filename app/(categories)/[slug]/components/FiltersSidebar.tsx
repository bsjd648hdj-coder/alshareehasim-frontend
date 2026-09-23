"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoOptions, IoRefresh, IoSwapVertical, IoCheckmark, IoStorefront, IoPricetag, IoFlash } from "react-icons/io5";
import type { Filters, SortKey } from "./useProductFilters";

interface Props {
  filters: Filters;
  storageOptions: string[];
  maxProductPrice: number;
  activeCount: number;
  onToggle: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onToggleStorage: (s: string) => void;
  onReset: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const SORT_OPTIONS: { value: SortKey; label: string; icon: string }[] = [
  { value: "default", label: "الافتراضي", icon: "✦" },
  { value: "price-asc", label: "الأقل سعراً", icon: "↑" },
  { value: "price-desc", label: "الأعلى سعراً", icon: "↓" },
  { value: "discount", label: "أعلى خصم", icon: "%" },
];

const fmt = (n: number) => n.toLocaleString("en-US");

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-[#B5854A] flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <span className="text-xs font-black text-gray-700 tracking-wide">{title}</span>
    </div>
  );
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${active ? "bg-[#B5854A] shadow-md shadow-[#B5854A]/30" : "bg-gray-200"}`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm ${active ? "right-1" : "left-1"}`}
      />
    </button>
  );
}

function FiltersContent({ filters, storageOptions, maxProductPrice, activeCount, onToggle, onToggleStorage, onReset }: Omit<Props, "mobileOpen" | "onMobileClose">) {
  const priceMax = maxProductPrice || 10000;
  const priceVal = filters.maxPrice ?? priceMax;
  const pct = (priceVal / priceMax) * 100;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B5854A] flex items-center justify-center shadow-md shadow-[#B5854A]/20">
            <IoOptions size={15} className="text-white" />
          </div>
          <div>
            <span className="font-black text-gray-900 text-sm block leading-tight">الفلاتر</span>
            {activeCount > 0 && (
              <span className="text-[10px] text-[#B5854A] font-bold">{activeCount} فلتر نشط</span>
            )}
          </div>
        </div>
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onReset}
              className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <IoRefresh size={12} />
              مسح الكل
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Sort */}
      <div>
        <SectionTitle icon={<IoSwapVertical size={12} className="text-white" />} title="الترتيب" />
        <div className="grid grid-cols-2 gap-1.5">
          {SORT_OPTIONS.map((opt) => {
            const active = filters.sort === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.96 }}
                onClick={() => onToggle("sort", opt.value)}
                className={`relative text-right text-[11px] font-bold px-2.5 py-2 rounded-xl transition-all ${
                  active
                    ? "bg-[#B5854A] text-white shadow-md shadow-[#B5854A]/20"
                    : "bg-gray-50 text-gray-600 hover:bg-[#f5e6d3] hover:text-[#B5854A] border border-gray-100"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`text-base leading-none ${active ? "text-white/80" : "text-gray-300"}`}>{opt.icon}</span>
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Availability */}
      <div>
        <SectionTitle icon={<IoStorefront size={12} className="text-white" />} title="الحالة" />
        <div className="flex flex-col gap-3">
          {[
            { key: "inStockOnly" as const, label: "متوفر فقط", sub: "إخفاء المنتجات المنتهية" },
            { key: "installmentOnly" as const, label: "تقسيط متاح", sub: "منتجات بخيار التقسيط" },
          ].map(({ key, label, sub }) => (
            <div key={key} className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${filters[key] ? "bg-[#B5854A]/10 border border-[#B5854A]/20" : "bg-gray-50 border border-transparent"}`}>
              <div>
                <p className="text-xs font-bold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-400">{sub}</p>
              </div>
              <Toggle active={!!filters[key]} onClick={() => onToggle(key, !filters[key])} />
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Price range */}
      <div>
        <SectionTitle icon={<IoPricetag size={12} className="text-white" />} title="نطاق السعر" />
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-gray-400">من 0</span>
            <motion.span
              key={priceVal}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-xs font-black text-[#B5854A] bg-[#B5854A]/10 border border-[#B5854A]/20 px-2 py-0.5 rounded-lg flex items-center gap-1"
            >
              {filters.maxPrice !== null ? (
                <>{fmt(filters.maxPrice)} <img src="/money-icon.webp" alt="ر.س" className="w-6 h-6 object-contain" /></>
              ) : "الكل"}
            </motion.span>
          </div>
          <div className="relative h-5 flex items-center">
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200" />
            <div
              className="absolute right-0 h-1.5 rounded-full bg-[#B5854A] transition-all"
              style={{ width: `${pct}%` }}
            />
            <input
              type="range"
              min={0}
              max={priceMax}
              step={100}
              value={priceVal}
              onChange={(e) => {
                const v = Number(e.target.value);
                onToggle("maxPrice", v >= priceMax ? null : v);
              }}
              className="absolute inset-x-0 w-full opacity-0 cursor-pointer h-5"
            />
            <div
              className="absolute w-5 h-5 rounded-full bg-white border-2 border-[#B5854A] shadow-md shadow-[#B5854A]/20 transition-all pointer-events-none"
              style={{ right: `calc(${pct}% - 10px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2">
            <span>0 <img src="/money-icon.webp" alt="ر.س" className="inline w-6 h-6 object-contain align-middle" /></span>
            <span>{fmt(priceMax)} <img src="/money-icon.webp" alt="ر.س" className="inline w-6 h-6 object-contain align-middle" /></span>
          </div>
        </div>
      </div>

      {/* Storage */}
      {storageOptions.length > 0 && (
        <>
          <div className="h-px bg-gray-100" />
          <div>
            <SectionTitle icon={<IoFlash size={12} className="text-white" />} title="سعة التخزين" />
            <div className="flex flex-wrap gap-1.5">
              {storageOptions.map((s) => {
                const active = filters.storages.includes(s);
                return (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => onToggleStorage(s)}
                    className={`relative text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      active
                        ? "bg-[#B5854A] text-white border-transparent shadow-md shadow-[#B5854A]/20"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#B5854A]/50 hover:text-[#B5854A]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1"
                      >
                        <IoCheckmark size={10} />
                      </motion.span>
                    )}
                    {s}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function FiltersSidebar(props: Props) {
  const { mobileOpen, onMobileClose, ...rest } = props;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
        >
          <FiltersContent {...rest} />
        </motion.div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 right-0 left-0 bg-white rounded-t-3xl p-5 max-h-[88vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <span className="font-black text-gray-900 text-base">الفلاتر والترتيب</span>
                <button
                  onClick={onMobileClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <IoClose size={16} />
                </button>
              </div>
              <FiltersContent {...rest} />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onMobileClose}
                className="mt-6 w-full py-3.5 rounded-2xl bg-[#B5854A] text-white font-black text-sm shadow-lg shadow-[#B5854A]/20"
              >
                عرض النتائج {props.activeCount > 0 ? `(${props.activeCount} فلتر)` : ""}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
