export interface ShippingZone {
  names: string[];
  available: boolean;
  cost: number;
  label: string;
}

export const SHIPPING_ZONES: ShippingZone[] = [
  { names: ["riyadh", "الرياض", "ar riyad", "ar-riyad"], available: true, cost: 25, label: "الرياض" },
  { names: ["jeddah", "جدة", "jiddah"], available: true, cost: 30, label: "جدة" },
  { names: ["mecca", "مكة", "makkah", "makkah al-mukarramah"], available: true, cost: 30, label: "مكة المكرمة" },
  { names: ["medina", "المدينة", "al madinah", "al-madinah"], available: true, cost: 30, label: "المدينة المنورة" },
  { names: ["dammam", "الدمام"], available: true, cost: 35, label: "الدمام" },
  { names: ["khobar", "الخبر", "al khobar"], available: true, cost: 35, label: "الخبر" },
  { names: ["dhahran", "الظهران"], available: true, cost: 35, label: "الظهران" },
  { names: ["tabuk", "تبوك"], available: true, cost: 40, label: "تبوك" },
  { names: ["abha", "أبها"], available: true, cost: 40, label: "أبها" },
  { names: ["taif", "الطائف", "at ta'if"], available: true, cost: 35, label: "الطائف" },
  { names: ["hail", "حائل"], available: true, cost: 40, label: "حائل" },
  { names: ["najran", "نجران"], available: true, cost: 45, label: "نجران" },
  { names: ["jizan", "جازان", "jazan"], available: true, cost: 45, label: "جازان" },
  { names: ["al qassim", "القصيم", "buraydah", "بريدة"], available: true, cost: 35, label: "القصيم" },
];

export function checkShipping(city: string, state: string): { available: boolean; cost: number; label: string } {
  const search = [city, state].join(" ").toLowerCase();
  for (const zone of SHIPPING_ZONES) {
    if (zone.names.some(n => search.includes(n.toLowerCase()))) {
      return { available: zone.available, cost: zone.cost, label: zone.label };
    }
  }
  return { available: false, cost: 0, label: "" };
}
