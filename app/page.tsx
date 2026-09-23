import HeroSection from "./components/HeroSection";
import MostDemandedSection from "./components/MostDemandedSection";
import HomeCategorySections from "./components/HomeCategorySections";
import CustomerReviews, { type Review } from "./components/CustomerReviews";
import { getCompanyData } from "./lib/company";

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alshareehasim-backend.vercel.app";
const SITE_URL = "https://alshareehasim.com";

async function getReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${BACKEND}/api/admin/reviews`, {
      next: { revalidate: 300, tags: ["reviews"] },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [c, reviews] = await Promise.all([getCompanyData(), getReviews()]);
  const siteName = "لمسة الثابتة";
  const logoUrl = c.logo
    ? (c.logo.startsWith("http") ? c.logo : `${BACKEND}${c.logo}`)
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: c.nameEn || "alshareehasim",
    url: SITE_URL,
    logo: logoUrl,
    contactPoint: [
      c.phone && {
        "@type": "ContactPoint",
        telephone: c.phone,
        contactType: "customer service",
        areaServed: "SA",
        availableLanguage: "Arabic",
      },
      c.whatsapp && {
        "@type": "ContactPoint",
        telephone: c.whatsapp,
        contactType: "sales",
        areaServed: "SA",
        availableLanguage: "Arabic",
      },
    ].filter(Boolean),
    address: c.addressAr ? {
      "@type": "PostalAddress",
      addressLocality: c.addressAr,
      addressCountry: "SA",
    } : undefined,
    email: c.email || undefined,
    sameAs: c.website ? [c.website] : [],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <main className="min-h-screen">
        <HeroSection />
        <MostDemandedSection />
        <HomeCategorySections />
        <CustomerReviews initialReviews={reviews} />
      </main>
    </>
  );
}
