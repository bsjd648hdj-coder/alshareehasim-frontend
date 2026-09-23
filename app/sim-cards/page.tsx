import SimCardsClient from "./SimCardsClient";
import type { Product } from "../components/products/types";
import { sortProducts } from "../lib/sortProducts";

export const metadata = {
  title: "شرائح الاتصال | لمسة الثابتة",
  description: "اختر شريحتك المناسبة من جميع شركات الاتصالات السعودية من لمسة الثابتة وتمتع باتصال سريع وتغطية قوية في كل مكان",
};

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alshareehasim-backend.vercel.app";

async function getSimCards(): Promise<Product[]> {
  try {
    const res = await fetch(`${BACKEND}/api/products?category=sim-cards`, {
      next: { revalidate: 300, tags: ["products"] },
      signal: AbortSignal.timeout(4000),
    });
    
    if (!res.ok) {
      console.error("Failed to fetch sim cards");
      return [];
    }
    
    const data = await res.json();
    return sortProducts(data);
  } catch (error) {
    console.error("Error fetching sim cards:", error);
    return [];
  }
}

export default async function SimCardsPage() {
  const products = await getSimCards();
  
  return <SimCardsClient initialProducts={products} />;
}
