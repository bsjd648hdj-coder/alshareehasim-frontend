const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alshareehasim-backend.vercel.app";

export interface CompanyData {
  logo?: string;
  nameAr?: string;
  nameEn?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  addressAr?: string;
  details?: string;
  qrImage?: string;
  qrFile?: string;
  qrLinkType?: string;
  qrLink?: string;
  footerItems?: { image: string; linkType: string; link: string; file: string }[];
  img1?: string;
  file1?: string;
  link1Type?: string;
  linkType1?: string;
  link1?: string;
  img2?: string;
  file2?: string;
  link2Type?: string;
  linkType2?: string;
  link2?: string;
}

export async function getCompanyData(): Promise<CompanyData> {
  try {
    const res = await fetch(`${BACKEND}/api/admin/company/public`, {
      next: { revalidate: 300, tags: ["company"] },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}
