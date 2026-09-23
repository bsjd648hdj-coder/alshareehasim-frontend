import { create } from "zustand";

const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

interface CompanyPublicData {
  logo: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  details: string;
}

interface CompanyStore extends CompanyPublicData {
  fetched: boolean;
  fetchCompany: () => Promise<void>;
  setLogo: (url: string) => void;
  setCompanyData: (data: Partial<CompanyPublicData>) => void;
  resetFetched: () => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  logo: "",
  nameAr: "",
  nameEn: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  details: "",
  fetched: false,

  fetchCompany: async () => {
    if (get().fetched) return;
    try {
      const res = await fetch(`/api/company`);
      if (!res.ok) return;
      const data = await res.json();
      const fullLogo = data.logo
        ? (data.logo.startsWith("http") ? data.logo : `${API}${data.logo}`)
        : "";
      set({
        logo: fullLogo,
        nameAr: data.nameAr || "",
        nameEn: data.nameEn || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        website: data.website || "",
        details: data.details || "",
        fetched: true,
      });
    } catch (e) {
      console.error("[companyStore] fetchCompany failed:", e);
    }
  },

  setLogo: (url) => set({ logo: url }),

  // Update store fields after a successful Save — no extra fetch needed
  setCompanyData: (data) => set((prev) => ({ ...prev, ...data })),

  // Allow re-fetch (e.g. after logout/login)
  resetFetched: () => set({ fetched: false }),
}));

// backward compat alias
export const useCompanyStoreLegacy = useCompanyStore;
