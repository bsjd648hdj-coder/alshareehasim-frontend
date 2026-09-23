import type { Metadata } from "next";
// leaflet CSS مطلوب فقط في checkout (AddressMap) — تم نقله هنا من root layout
import "leaflet/dist/leaflet.css";

const SITE_URL = "https://alshareehasim.com";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "إتمام الطلب - أكمل عملية الشراء بأمان وسهولة | لمسة الثابتة",
    description: "أكمل عملية الشراء بأمان تام. دفع مشفر وآمن مع خيارات تقسيط مريحة بدون فوائد.",
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/checkout` },
  };
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
