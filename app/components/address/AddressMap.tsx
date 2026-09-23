"use client";

import { useEffect, useRef, useState } from "react";
import { Locate, Loader2 } from "lucide-react";
import { reverseGeocode, AddressData } from "../../lib/geocoding";
import { checkShipping } from "../../lib/shippingZones";

export type PendingAddr = Partial<AddressData> & {
  shippingAvailable: boolean;
  shippingCost: number;
  formattedAddress?: string;
  placeId?: string;
  street?: string;
  buildingNumber?: string;
  additionalNumber?: string;
  plusCode?: string;
};

interface Props {
  markerPos: { lat: number; lng: number } | null;
  setMarkerPos: (pos: { lat: number; lng: number }) => void;
  onAddressChange: (data: PendingAddr) => void;
  pendingRef: React.MutableRefObject<PendingAddr | null>;
  onGeocodingChange?: (loading: boolean) => void;
  onNewClick?: () => void;
}

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initGoogleMap?: () => void;
  }
}

export default function AddressMap({
  markerPos,
  setMarkerPos,
  onAddressChange,
  pendingRef,
  onGeocodingChange,
  onNewClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");
  const [geocodeError, setGeocodeError] = useState("");

  // keep latest callbacks in ref to avoid stale closures
  const propsRef = useRef({ setMarkerPos, onAddressChange, pendingRef, onGeocodingChange, onNewClick });
  useEffect(() => {
    propsRef.current = { setMarkerPos, onAddressChange, pendingRef, onGeocodingChange, onNewClick };
  });

  const placeMarker = (lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      if (typeof markerRef.current.setPosition === "function") {
        markerRef.current.setPosition({ lat, lng });
      } else {
        markerRef.current.position = { lat, lng };
      }
    } else {
      const G = window.google.maps;
      // Use AdvancedMarkerElement if mapId is configured, otherwise legacy Marker
      const hasMapId = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
      if (hasMapId && G.marker?.AdvancedMarkerElement) {
        const pin = new G.marker.PinElement({
          background: "#47A557",
          borderColor: "#1A2E44",
          glyphColor: "#ffffff",
          scale: 1.2,
        });
        markerRef.current = new G.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map,
          gmpDraggable: true,
          content: pin.element,
        });
        markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current.position;
          const newLat = typeof pos.lat === "function" ? pos.lat() : pos.lat;
          const newLng = typeof pos.lng === "function" ? pos.lng() : pos.lng;
          handleLatLngRef.current(newLat, newLng);
        });
      } else {
        // Legacy Marker (works without mapId)
        markerRef.current = new G.Marker({
          position: { lat, lng },
          map,
          draggable: true,
          animation: G.Animation?.DROP,
        });
        markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current.getPosition();
          handleLatLngRef.current(pos.lat(), pos.lng());
        });
      }
    }
    map.panTo({ lat, lng });
  };

  const handleLatLng = async (lat: number, lng: number) => {
    propsRef.current.onNewClick?.();
    propsRef.current.setMarkerPos({ lat, lng });
    placeMarker(lat, lng);
    setGeocodeError("");
    propsRef.current.onGeocodingChange?.(true);
    try {
      const parsed = await reverseGeocode(lat, lng);
      if (!parsed) {
        setGeocodeError("تعذر تحديد العنوان لهذا الموقع، جرب مكاناً آخر أو استخدم البحث.");
        propsRef.current.onGeocodingChange?.(false);
        return;
      }
      const shipping = checkShipping(parsed.city, parsed.state);
      const data: PendingAddr = {
        ...parsed,
        address: parsed.address,
        formattedAddress: parsed.formattedAddress || parsed.address,
        latitude: lat,
        longitude: lng,
        shippingAvailable: shipping.available,
        shippingCost: shipping.cost,
      };
      propsRef.current.pendingRef.current = data;
      propsRef.current.onAddressChange(data);
    } finally {
      propsRef.current.onGeocodingChange?.(false);
    }
  };

  const handleLatLngRef = useRef(handleLatLng);
  useEffect(() => {
    handleLatLngRef.current = handleLatLng;
  });

  const placeMarkerRef = useRef(placeMarker);
  useEffect(() => {
    placeMarkerRef.current = placeMarker;
  });

  useEffect(() => {
    if (!KEY) {
      setMapError("مفتاح Google Maps غير موجود");
      setMapLoading(false);
      return;
    }

    const initMap = () => {
      if (!containerRef.current || mapRef.current) return;
      try {
        const map = new window.google.maps.Map(containerRef.current, {
          center: { lat: 24.7136, lng: 46.6753 },
          zoom: 6,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          // mapId required for AdvancedMarkerElement — use env var or fallback to legacy marker
          ...(process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
            ? { mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID }
            : {}),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.addListener("click", (e: any) => {
          if (!e.latLng) return;
          handleLatLngRef.current(e.latLng.lat(), e.latLng.lng());
        });
        mapRef.current = map;
        setMapLoading(false);
      } catch {
        setMapError("تعذر تحميل الخريطة");
        setMapLoading(false);
      }
    };

    if (window.google?.maps) {
      initMap();
    } else {
      window.initGoogleMap = () => {
        initMap();
      };
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        const hasMapId = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&callback=initGoogleMap&language=ar${hasMapId ? "&libraries=marker" : ""}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          setMapError("تعذر تحميل خدمة الخرائط");
          setMapLoading(false);
        };
        document.head.appendChild(script);
      } else {
        // Script already added but map not ready yet — wait
        const interval = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(interval);
            initMap();
          }
        }, 200);
        return () => clearInterval(interval);
      }
    }

    return () => {
      // cleanup marker on unmount
      if (markerRef.current) {
        if (typeof markerRef.current.setMap === "function") {
          markerRef.current.setMap(null);
        } else {
          markerRef.current.map = null;
        }
        markerRef.current = null;
      }
    };
  }, []);

  // sync external markerPos changes (e.g. from search)
  useEffect(() => {
    if (!markerPos || !mapRef.current) return;
    mapRef.current.setZoom(15);
    placeMarkerRef.current(markerPos.lat, markerPos.lng);
  }, [markerPos]);

  const handleCurrentLocation = () => {
    setLocError("");
    setGeocodeError("");
    if (!navigator.geolocation) {
      setLocError("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        await handleLatLngRef.current(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocError(
            "تعذر الوصول إلى موقعك الحالي. يرجى السماح بالوصول إلى الموقع أو تحديده يدويًا من الخريطة."
          );
        } else {
          setLocError("تعذر تحديد موقعك الحالي، حاول مرة أخرى.");
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full" dir="rtl">
      {mapLoading && !mapError && (
        <div className="w-full h-[300px] md:h-[420px] flex items-center justify-center bg-gray-50 border border-gray-100">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Loader2 size={24} className="animate-spin text-[#47A557]" />
            <p className="text-xs font-medium">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="w-full h-[300px] md:h-[420px] flex items-center justify-center bg-red-50 border border-red-100">
          <p className="text-xs text-red-500 font-medium text-center px-4">⚠ {mapError}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-[300px] md:h-[420px]"
        style={{ display: mapLoading || mapError ? "none" : "block" }}
      />

      {!mapLoading && !mapError && (
        <button
          onClick={handleCurrentLocation}
          disabled={locating}
          aria-label="استخدم موقعي الحالي"
          className="absolute bottom-4 left-4 z-[1000] flex items-center gap-1.5 bg-white border border-gray-200 shadow-md px-3 py-2 text-xs font-bold text-[#1A2E44] hover:bg-gray-50 transition disabled:opacity-60"
        >
          {locating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Locate size={13} />
          )}
          موقعي الحالي
        </button>
      )}

      {locError && (
        <p className="text-[11px] text-red-500 font-medium mt-2 px-1 leading-relaxed">
          {locError}
        </p>
      )}

      {geocodeError && (
        <p className="text-[11px] text-red-500 font-medium mt-2 px-1 leading-relaxed">
          ⚠ {geocodeError}
        </p>
      )}
    </div>
  );
}
