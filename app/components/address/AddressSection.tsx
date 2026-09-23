"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Truck,
  MapPin,
  AlertCircle,
  Save,
  PenLine,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { AddressData } from "../../lib/geocoding";
import type { PendingAddr } from "./AddressMap";

import ShippingCompanyPicker from "./ShippingCompanyPicker";

const AddressMap = dynamic(() => import("./AddressMap"), { ssr: false });
import AddressSearch from "./AddressSearch";

export interface ShippingOption {
  companyId: string;
  companyName: string;
  logo: string;
  workDays: string;
}

export interface SelectedAddress extends Partial<AddressData> {
  buildingDescription: string;
  allowCourierCall: boolean;
  shippingAvailable: boolean;
  shippingCost: number;
  // Extended fields
  formattedAddress?: string;
  placeId?: string;
  street?: string;
  buildingNumber?: string;
  additionalNumber?: string;
  plusCode?: string;
}

interface Props {
  onChange: (addr: SelectedAddress) => void;
  onShippingSelect: (option: ShippingOption | null) => void;
  locked?: boolean;
}

export const SHIPPING_COMPANIES: ShippingOption[] = [
  { companyId: "aramex",   companyName: "أرامكس",  logo: "/aramix.webp",  workDays: "3 - 7 أيام عمل" },
  { companyId: "anywhere", companyName: "أي مكان", logo: "/aymakan.webp", workDays: "3 - 7 أيام" },
  { companyId: "imile",    companyName: "iMile",   logo: "/imile.webp",   workDays: "1 - 3 أيام عمل" },
  { companyId: "smsa",     companyName: "سمسا",    logo: "/sm.webp",      workDays: "3 - 10 أيام عمل" },
];

const isSaudi = (country: string) => /saudi|arabia|سعودي|السعودية/i.test(country);

export default function AddressSection({ onChange, onShippingSelect, locked = false }: Props) {
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const pendingAddrRef = useRef<PendingAddr | null>(null);
  const [pendingAddr, setPendingAddr] = useState<PendingAddr | null>(null);
  const [savedAddr, setSavedAddr] = useState<PendingAddr | null>(null);
  const [building, setBuilding] = useState("");

  const [manualMode, setManualMode] = useState(false);
  const [manualStreet, setManualStreet] = useState("");
  const [manualErrors, setManualErrors] = useState<Record<string, string>>();

  const [saveError, setSaveError] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ShippingOption | null>(null);
  const [mapQuery, setMapQuery] = useState("");

  const saved = !!savedAddr;
  const shortAddress = savedAddr
    ? savedAddr.formattedAddress ||
      savedAddr.address ||
      [savedAddr.city || savedAddr.state, savedAddr.district]
        .filter(Boolean)
        .join(" - ") ||
      "تم تحديد الموقع"
    : null;

  // restore from localStorage (map mode only if it had coordinates)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout_address");
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.savedAddr && p.manualMode) {
        setSavedAddr(p.savedAddr);
        setPendingAddr(p.savedAddr);
        pendingAddrRef.current = p.savedAddr;
      }
      if (p.building) setBuilding(p.building);
      if (p.manualMode !== undefined) setManualMode(p.manualMode);
      if (p.manualStreet) setManualStreet(p.manualStreet);
      if (p.selectedCompany) {
        setSelectedCompany(p.selectedCompany);
        onShippingSelect(p.selectedCompany);
      }
    } catch { /* silent */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddressChange = (data: PendingAddr) => {
    setPendingAddr(data);
    const label =
      data.formattedAddress ||
      data.address ||
      [data.street, data.district, data.city, data.state]
        .filter(Boolean)
        .join("، ");
    if (label) setMapQuery(label);
  };

  const handleSearchSelect = (
    data: Partial<AddressData> & {
      shippingAvailable: boolean;
      shippingCost: number;
      lat: number;
      lng: number;
      formattedAddress?: string;
      placeId?: string;
      street?: string;
      buildingNumber?: string;
      additionalNumber?: string;
      plusCode?: string;
    }
  ) => {
    const { lat, lng, ...rest } = data;
    setMarkerPos({ lat, lng });
    const pending: PendingAddr = {
      ...rest,
      latitude: lat,
      longitude: lng,
    };
    pendingAddrRef.current = pending;
    setPendingAddr(pending);
    setSaveError("");
  };

  const handleSaveMap = () => {
    const addr = pendingAddrRef.current ?? pendingAddr;
    if (!addr?.latitude) {
      setSaveError("يرجى تحديد موقعك على الخريطة أولاً");
      return;
    }
    if (geocoding) {
      setSaveError("جارٍ تحديد العنوان، انتظر لحظة...");
      return;
    }
    if (addr.country && !isSaudi(addr.country)) {
      setSaveError("نوفر الشحن داخل المملكة العربية السعودية فقط");
      return;
    }
    const finalAddr: PendingAddr = {
      ...addr,
      address:
        addr.formattedAddress ||
        addr.address ||
        `${addr.latitude?.toFixed(5)}, ${addr.longitude?.toFixed(5)}`,
      formattedAddress:
        addr.formattedAddress ||
        addr.address ||
        `${addr.latitude?.toFixed(5)}, ${addr.longitude?.toFixed(5)}`,
      state: addr.state || "",
      city: addr.city || "",
      district: addr.district || "",
    };
    setSaveError("");
    setSavedAddr(finalAddr);
    try {
      localStorage.setItem(
        "checkout_address",
        JSON.stringify({ savedAddr: finalAddr, building, manualMode: false })
      );
    } catch { /* silent */ }
    onChange({
      ...finalAddr,
      buildingDescription: building,
      allowCourierCall: false,
    });
  };

  const handleSaveManual = () => {
    if (!manualStreet.trim()) { setManualErrors({ street: "مطلوب" }); return; }
    setManualErrors({});
    const data: PendingAddr = {
      address: manualStreet,
      formattedAddress: manualStreet,
      street: manualStreet,
      shippingAvailable: true,
      shippingCost: 0,
    };
    setSavedAddr(data);
    setSaveError("");
    try {
      localStorage.setItem("checkout_address", JSON.stringify({ savedAddr: data, building, manualMode: true, manualStreet }));
    } catch { /* silent */ }
    onChange({ ...data, buildingDescription: building, allowCourierCall: false });
  };

  const handleEdit = () => {
    setSavedAddr(null);
    setPendingAddr(null);
    pendingAddrRef.current = null;
    setMarkerPos(null);
    setSelectedCompany(null);
    setManualMode(false);
    setManualStreet("");
    setBuilding("");
    setSaveError("");
    onShippingSelect(null);
    localStorage.removeItem("checkout_address");
  };

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={15} className="text-gray-500 shrink-0" />
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-gray-400">عنوان التوصيل</p>
            <p className="text-xs sm:text-sm font-bold mt-0.5 flex items-center gap-1 text-[#1A2E44]">
              <MapPin size={11} className="text-[#47A557]" />
              {saved ? (shortAddress ?? "تم تحديد العنوان") : "لم يتم تحديد عنوان"}
            </p>
          </div>
        </div>
        {saved && !locked && (
          <button onClick={handleEdit} className="text-[11px] sm:text-xs font-bold text-gray-400 hover:text-[#1A2E44] transition">
            تعديل
          </button>
        )}
      </div>

      {locked && (
        <p className="text-[11px] sm:text-xs text-gray-400">أكمل بيانات العميل أولاً للمتابعة</p>
      )}

      {!locked && !saved && (
        <>
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setManualMode(false); setSaveError(""); }}
              className={`flex-1 py-2 text-[11px] sm:text-xs font-black border transition flex items-center justify-center gap-1.5 ${
                !manualMode
                  ? "bg-[#1A2E44] text-white border-[#1A2E44]"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
              }`}
            >
              <MapPin size={12} /> الخريطة
            </button>
            <button
              onClick={() => { setManualMode(true); setSaveError(""); }}
              className={`flex-1 py-2 text-[11px] sm:text-xs font-black border transition flex items-center justify-center gap-1.5 ${
                manualMode
                  ? "bg-[#1A2E44] text-white border-[#1A2E44]"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
              }`}
            >
              <PenLine size={12} /> إدخال يدوي
            </button>
          </div>

          {/* MAP MODE */}
          {!manualMode && (
            <>
              <AddressSearch onSelect={handleSearchSelect} externalQuery={mapQuery} />
              <div className="border border-gray-100 shadow-sm overflow-hidden rounded-lg">
                <AddressMap
                  markerPos={markerPos}
                  setMarkerPos={setMarkerPos}
                  onAddressChange={handleAddressChange}
                  pendingRef={pendingAddrRef}
                  onGeocodingChange={setGeocoding}
                  onNewClick={() => setSaveError("")}
                />
              </div>

              {pendingAddr?.latitude && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-2 border text-[11px] font-medium ${
                    geocoding
                      ? "bg-blue-50 border-blue-100 text-blue-600"
                      : pendingAddr.country && !isSaudi(pendingAddr.country)
                      ? "bg-red-50 border-red-100 text-red-600"
                      : "bg-green-50 border-green-100 text-green-700"
                  }`}
                >
                  <CheckCircle2 size={12} className="shrink-0" />
                  {geocoding
                    ? "جارٍ تحديد العنوان..."
                    : pendingAddr.country && !isSaudi(pendingAddr.country)
                    ? `هذا الموقع خارج المملكة (${pendingAddr.country})`
                    : [pendingAddr.state, pendingAddr.city, pendingAddr.district]
                        .filter(Boolean)
                        .join(" - ") ||
                      pendingAddr.formattedAddress ||
                      pendingAddr.address}
                </div>
              )}

            </>
          )}

          {/* MANUAL MODE */}
          {manualMode && (
            <div className="space-y-3">
              <MField label="العنوان بالتفصيل" error={manualErrors?.street ?? ""} required>
                <input
                  value={manualStreet}
                  onChange={(e) => {
                    setManualStreet(e.target.value);
                    setManualErrors({});
                  }}
                  placeholder="المدينة، الحي، الشارع، رقم المبنى..."
                  className={inp(manualErrors?.street)}
                />
              </MField>
            </div>
          )}

          {saveError && (
            <p className="text-red-500 text-[11px] font-bold flex items-center gap-1">
              <AlertCircle size={11} /> {saveError}
            </p>
          )}

          <button
            onClick={manualMode ? handleSaveManual : handleSaveMap}
            disabled={geocoding && !manualMode}
            className="w-full py-2.5 text-white text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 hover:opacity-90 transition disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#47A557,#129928)" }}
          >
            {geocoding && !manualMode ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {geocoding && !manualMode ? "جارٍ تحديد العنوان..." : "حفظ العنوان"}
          </button>
        </>
      )}

      {/* Shipping */}
      <div className="space-y-2 pt-1">
        <div className="border-t border-gray-100" />
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-gray-500" />
            <p className="text-xs sm:text-sm font-black text-[#1A2E44]">شركة الشحن</p>
          </div>
          {selectedCompany && (
            <button
              onClick={() => {
                setSelectedCompany(null);
                onShippingSelect(null);
                try {
                  const raw = localStorage.getItem("checkout_address");
                  if (raw) {
                    const p = JSON.parse(raw);
                    delete p.selectedCompany;
                    localStorage.setItem("checkout_address", JSON.stringify(p));
                  }
                } catch { /* silent */ }
              }}
              className="text-[11px] sm:text-xs font-bold text-gray-400 hover:text-[#1A2E44] transition"
            >
              تعديل
            </button>
          )}
        </div>

        {!saved && (
          <p className="text-[11px] sm:text-xs text-gray-400">
            أكمل تحديد العنوان أولاً لاختيار شركة الشحن
          </p>
        )}

        {saved && !selectedCompany && (
          <ShippingCompanyPicker
            options={SHIPPING_COMPANIES}
            selected={null}
            onSelect={(opt) => {
              setSelectedCompany(opt);
              onShippingSelect(opt);
              try {
                const raw = localStorage.getItem("checkout_address");
                if (raw) {
                  const p = JSON.parse(raw);
                  localStorage.setItem(
                    "checkout_address",
                    JSON.stringify({ ...p, selectedCompany: opt })
                  );
                }
              } catch { /* silent */ }
            }}
          />
        )}

        {selectedCompany && (
          <div className="flex items-center gap-3 px-4 py-3 border border-gray-100 bg-gray-50">
            <div className="w-10 h-10 rounded border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={selectedCompany.logo}
                alt={selectedCompany.companyName}
                className="object-contain w-full h-full p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#1A2E44]">
                {selectedCompany.companyName}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                {selectedCompany.workDays}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                24{" "}
                <img
                  src="/money-icon.webp"
                  alt="ر.س"
                  className="inline w-6 h-6 object-contain align-middle"
                />
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-black text-white px-1.5 py-0.5 rounded-md"
                style={{ background: "#47A557" }}
              >
                مجاني
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function sel(error?: string) {
  return `w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition bg-white ${
    error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#47A557]"
  }`;
}
function inp(error?: string) {
  return `w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition placeholder:text-gray-200 ${
    error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#47A557]"
  }`;
}
function MField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] sm:text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
        {error && (
          <span className="text-red-500 mr-auto text-[10px] sm:text-[11px]">⚠ {error}</span>
        )}
      </label>
      {children}
    </div>
  );
}
