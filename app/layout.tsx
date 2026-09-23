import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import TikTokPixel from "./components/TikTokPixel";
import SnapPixel from "./components/SnapPixel";
import "./globals.css";
// leaflet/dist/leaflet.css نُقل إلى checkout/layout.tsx — لا علاقة له بباقي الصفحات
import ClientLayout from "./components/ClientLayout";
import Footer from "./components/Footer";
import { getCompanyData } from "./lib/company";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://alshareehasim.com";

export const viewport: Viewport = {
  themeColor: "#04454A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCompanyData();

  // الاسم التجاري ثابت بغض النظر عن قيمة DB
  const siteName = "لمسة الثابتة";
  const titleDefault = `${siteName} | أفضل متجر لبيع شرائح الاتصال في السعودية`;
  const description = c.details?.replace(/الشريح[ةه] الموثوق[ةه]/g, "لمسة الثابتة") || "لمسة الثابتة - تسوق أفضل شرائح الاتصال وباقات الإنترنت من فيرجن وSTC وزين وموبايلي بأسعار مميزة. توصيل سريع لجميع مناطق المملكة العربية السعودية.";
  // og:image بنسبة 1.91:1 (1200×630) — لا تستخدم الشعار المربع
  const ogImage = `${SITE_URL}/og-image.webp`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: titleDefault,
      template: `%s | ${siteName} - متجر إلكتروني معتمد`,
    },
    description,
    keywords: [
      "لمسة الثابتة", "لمسه الثابته", "بيع شرائح الاتصال",
      "شرائح اتصال", "باقات إنترنت", "شريحة SIM", "شريحة بيانات",
      "فيرجن موبايل", "Virgin Mobile", "STC", "زين", "موبايلي",
      "إنترنت مفتوح", "باقة شهرية", "باقة سنوية", "5G", "4G",
      "شريحة إنترنت", "باقة بيانات", "سوشيال مفتوح",
      "السعودية", "الرياض", "جدة", "مكة", "المدينة", "الدمام", "الخبر",
      "أرخص باقات الإنترنت", "عروض شرائح الاتصال",
    ],
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: SITE_URL,
      siteName,
      title: titleDefault,
      description,
      images: [
        { url: ogImage, width: 1200, height: 630, alt: siteName, type: "image/webp" },
        { url: `${SITE_URL}/web-app-manifest-512x512.png`, width: 512, height: 512, alt: siteName, type: "image/png" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: [ogImage],
      creator: "@alshareehasim",
      site: "@alshareehasim",
    },
    alternates: {
      canonical: SITE_URL,
      languages: { "ar-SA": SITE_URL },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "",
    },
    category: "electronics",
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const company = await getCompanyData();
  return (
    <html lang="ar" dir="rtl">
      <head>
        <TikTokPixel />
        <SnapPixel />
      </head>
      <body className={`${cairo.className} antialiased`} suppressHydrationWarning>
        <ClientLayout footer={<Footer company={company} />} whatsapp={company.whatsapp}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
