"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { HiOutlineLocationMarker, HiOutlineOfficeBuilding } from "react-icons/hi";
import { MdOutlineLocationCity, MdOutlineStreetview } from "react-icons/md";
import { TbMapSearch } from "react-icons/tb";
import { PiMapPinAreaBold } from "react-icons/pi";
import { AddressData } from "../../lib/geocoding";
import { checkShipping } from "../../lib/shippingZones";

interface Suggestion {
  place_id: string;
  main_text: string;
  secondary_text: string;
  description: string;
  types?: string[];
}

interface PlaceResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
  country: string;
  city: string;
  state: string;
  district: string;
  postalCode: string;
  street: string;
  buildingNumber: string;
  additionalNumber: string;
  plusCode: string;
}

interface Props {
  onSelect: (
    data: Partial<AddressData> &
      PlaceResult & { shippingAvailable: boolean; shippingCost: number }
  ) => void;
  externalQuery?: string;
}

function parseAddressComponents(
  components: { long_name: string; short_name: string; types: string[] }[]
) {
  const get = (...types: string[]) =>
    components.find((c) => types.some((t) => c.types.includes(t)))?.long_name ?? "";
  return {
    country: get("country"),
    city: get("locality", "administrative_area_level_2"),
    state: get("administrative_area_level_1"),
    district: get("sublocality", "sublocality_level_1", "neighborhood"),
    postalCode: get("postal_code"),
    street: get("route"),
    buildingNumber: get("street_number"),
    additionalNumber: get("premise", "subpremise"),
  };
}

function getIcon(s: Suggestion) {
  const sec = s.secondary_text ?? "";
  const main = s.main_text ?? "";
  if (!sec || main === s.description) return MdOutlineLocationCity;
  if (sec.includes("شارع") || sec.includes("طريق") || sec.includes("حي")) return MdOutlineStreetview;
  if (main.includes("مبنى") || main.includes("برج") || main.includes("مجمع")) return HiOutlineOfficeBuilding;
  if (main.includes("حي") || main.includes("منطقة")) return PiMapPinAreaBold;
  return HiOutlineLocationMarker;
}

export default function AddressSearch({ onSelect, externalQuery }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // sync when map changes location
  useEffect(() => {
    if (externalQuery) {
      setQuery(externalQuery);
      setOpen(false);
      setSuggestions([]);
    }
  }, [externalQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(async (val: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/places?type=autocomplete&input=${encodeURIComponent(val)}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
        setError("تعذر الاتصال بخدمة البحث");
        setSuggestions([]);
        setOpen(false);
        return;
      }
      const results: Suggestion[] = (data.predictions ?? []).map(
        (p: {
          place_id: string;
          description: string;
          types?: string[];
          structured_formatting?: { main_text: string; secondary_text: string };
        }) => ({
          place_id: p.place_id,
          description: p.description,
          types: p.types ?? [],
          main_text: p.structured_formatting?.main_text ?? p.description,
          secondary_text: p.structured_formatting?.secondary_text ?? "",
        })
      );
      setSuggestions(results);
      setOpen(results.length > 0);
      setActiveIdx(-1);
    } catch {
      setError("تعذر البحث، تحقق من الاتصال");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(val.trim()), 400);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    setError("");
    inputRef.current?.focus();
  };

  const handleSelect = async (s: Suggestion) => {
    setQuery(s.description);
    setOpen(false);
    setSuggestions([]);
    setActiveIdx(-1);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/places?type=details&place_id=${encodeURIComponent(s.place_id)}`);
      const data = await res.json();
      const result = data.result;
      const loc = result?.geometry?.location;
      if (!loc) { setError("تعذر الحصول على موقع هذا العنوان"); return; }
      const lat = loc.lat as number;
      const lng = loc.lng as number;
      const parsed = parseAddressComponents(result.address_components ?? []);
      const shipping = checkShipping(parsed.city, parsed.state);
      onSelect({
        lat, lng, latitude: lat, longitude: lng,
        formattedAddress: result.formatted_address ?? s.description,
        address: result.formatted_address ?? s.description,
        placeId: s.place_id,
        plusCode: result.plus_code?.global_code ?? "",
        shippingAvailable: shipping.available,
        shippingCost: shipping.cost,
        ...parsed,
      });
    } catch {
      setError("تعذر تحميل تفاصيل العنوان");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]); }
    else if (e.key === "Escape") { setOpen(false); setActiveIdx(-1); }
  };

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.children[activeIdx] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  return (
    <div ref={wrapperRef} className="relative" dir="rtl">

      {/* Card */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
          <div className="w-7 h-7 bg-[#47A557]/10 flex items-center justify-center shrink-0">
            <TbMapSearch size={15} className="text-[#47A557]" />
          </div>
          <div>
            <p className="text-xs font-black text-[#1A2E44]">ابحث عن عنوانك</p>
            <p className="text-[10px] text-gray-400 mt-0.5">اكتب اسم الشارع أو الحي أو المدينة</p>
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-3.5">
          <div className="relative">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none z-10">
              {loading
                ? <Loader2 size={15} className="animate-spin text-[#47A557]" />
                : <Search size={15} className="text-gray-300" />
              }
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="مثال: حي النزهة، الرياض..."
              dir="rtl"
              aria-label="ابحث عن عنوان"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls="address-suggestions"
              role="combobox"
              className="w-full pr-10 pl-8 py-3 text-sm border border-gray-200 focus:border-[#47A557] focus:ring-2 focus:ring-[#47A557]/10 focus:outline-none transition placeholder:text-gray-300 bg-gray-50/80"
            />
            {query && (
              <button
                onMouseDown={handleClear}
                className="absolute inset-y-0 left-2.5 flex items-center z-10 text-gray-300 hover:text-gray-500 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-[11px] font-medium mt-2 flex items-center gap-1">
              ⚠ {error}
            </p>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          id="address-suggestions"
          ref={listRef}
          role="listbox"
          className="absolute z-[1100] w-full bg-white border border-gray-200 shadow-lg mt-1 max-h-72 overflow-y-auto"
          style={{ top: "100%" }}
        >
          {suggestions.map((s, i) => {
            const active = i === activeIdx;
            const parts = s.secondary_text
              ? s.secondary_text.split(",").map((p) => p.trim()).filter(Boolean)
              : [];
            const location = parts.slice(0, 2).join("، ");
            return (
              <li
                key={s.place_id}
                role="option"
                aria-selected={active}
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`px-3 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 ${
                  active ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <HiOutlineLocationMarker size={13} className="text-gray-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A2E44] truncate">{s.main_text}</p>
                    {location && (
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{location}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
