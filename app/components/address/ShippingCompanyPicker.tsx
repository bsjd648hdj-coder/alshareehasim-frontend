"use client";

import Image from "next/image";
import type { ShippingOption } from "./AddressSection";

interface Props {
  options: ShippingOption[];
  selected: string | null;
  onSelect: (option: ShippingOption) => void;
}

export default function ShippingCompanyPicker({ options, selected, onSelect }: Props) {
  return (
    <div className="border border-gray-100" dir="rtl">
      {options.map(opt => {
        const isSelected = selected === opt.companyId;
        return (
          <button
            key={opt.companyId}
            onClick={() => onSelect(opt)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 text-right transition border-b border-gray-100 last:border-b-0 ${isSelected ? "bg-gray-50" : "bg-white hover:bg-gray-50"}`}
          >
            {/* Radio */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${isSelected ? "border-[#1A2E44]" : "border-gray-300"}`}>
              {isSelected && <div className="w-2 h-2 rounded-full bg-[#1A2E44]" />}
            </div>

            {/* Logo */}
            <div className="w-10 h-10 rounded border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src={opt.logo}
                alt={opt.companyName}
                width={40}
                height={40}
                className="object-contain w-full h-full p-1"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#1A2E44]">{opt.companyName}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">{opt.workDays}</p>
            </div>

            {/* Price — always free, 24 crossed out */}
            <div className="shrink-0 flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">24 <img src="/money-icon.webp" alt="ر.س" className="inline w-6 h-6 object-contain align-middle" /></span>
              <span className="text-[9px] sm:text-[10px] font-black text-white px-1.5 py-0.5 rounded-md" style={{ background: "#47A557" }}>مجاني</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
