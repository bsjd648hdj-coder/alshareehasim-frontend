import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";

// Cache for 1 hour with ISR; revalidates on-demand when product is updated
export const revalidate = 3600;
export const dynamicParams = true;

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alshareehasim-backend.vercel.app";
const SITE_URL = "https://alshareehasim.com";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${BACKEND}/api/products?limit=100`, {
      next: { revalidate: 3600, tags: ["products"] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
    return list.slice(0, 100).map((p: { _id: string }) => ({ id: String(p._id) }));
  } catch {
    return [];
  }
}

async function getProduct(id: string) {
  try {
    const r = await fetch(`${BACKEND}/api/products/${id}`, {
      next: { revalidate: 3600, tags: ["products", `product-${id}`] },
      signal: AbortSignal.timeout(4000),
    });
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "المنتج غير موجود",
      robots: { index: false, follow: false },
    };
  }

  const siteName = "لمسة الثابتة";
  const title = product.name;

  const parts: string[] = [];
  if (product.brand) parts.push(product.brand);
  if (product.storage) parts.push(product.storage);
  if (product.color) parts.push(product.color);
  if (product.salePrice || product.price) {
    const price = product.salePrice || product.price;
    parts.push(`${price} ريال`);
  }
  if (product.installment?.available) parts.push("بالأقساط");

  const description = product.description
    ? product.description.slice(0, 160)
    : `اشتري ${title}${parts.length ? " - " + parts.join(" | ") : ""} من ${siteName} بأفضل سعر مع تقسيط مريح بدون فوائد وشحن سريع لجميع مناطق المملكة`;

  const rawImg = product.images?.[0] || product.image || "";
  const imageUrl = rawImg.startsWith("http") ? rawImg : rawImg ? `${BACKEND}${rawImg}` : "";

  return {
    title: `${title} - اشتري الآن بأفضل سعر وتقسيط مريح`,
    description,
    keywords: [
      product.name,
      product.brand || "",
      product.category || "",
      "شرائح اتصال", "باقات إنترنت", siteName,
    ].filter(Boolean),
    openGraph: {
      type: "website",
      url: `${SITE_URL}/product/${id}`,
      title: `${title} | ${siteName}`,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: title }] : [],
      siteName,
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/product/${id}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const siteName = "لمسة الثابتة";
  const price = product?.salePrice || product?.price || 0;
  const rawImg = product?.images?.[0] || product?.image || "";
  const imageUrl = rawImg.startsWith("http") ? rawImg : rawImg ? `${BACKEND}${rawImg}` : "";

  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: imageUrl,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${id}`,
      priceCurrency: "SAR",
      price: price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: siteName },
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient id={id} initialProduct={product} />
    </>
  );
}
