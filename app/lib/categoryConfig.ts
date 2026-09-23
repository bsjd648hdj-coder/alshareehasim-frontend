export interface SlugConfig {
  label: string;
  parentLabel: string;
  parentHref: string;
  filters: {
    brand?: string;
    category?: string;
    nameIncludes?: string[];
    nameExcludes?: string[];
  };
}

// فقط slugs المتعلقة بشرائح الاتصال والراوترات
export const slugConfigs: Record<string, SlugConfig> = {
  // ─── شرائح الاتصال ─────────────────────────────────────────────────────────
  stc: {
    label: "STC",
    parentLabel: "شرائح الاتصال",
    parentHref: "/sim-cards",
    filters: { brand: "STC" },
  },
  mobily: {
    label: "موبايلي",
    parentLabel: "شرائح الاتصال",
    parentHref: "/sim-cards",
    filters: { brand: "موبايلي" },
  },
  zain: {
    label: "زين",
    parentLabel: "شرائح الاتصال",
    parentHref: "/sim-cards",
    filters: { brand: "زين" },
  },
  virgin: {
    label: "فيرجن",
    parentLabel: "شرائح الاتصال",
    parentHref: "/sim-cards",
    filters: { brand: "فيرجن" },
  },
  salam: {
    label: "سلام",
    parentLabel: "شرائح الاتصال",
    parentHref: "/sim-cards",
    filters: { brand: "سلام" },
  },
  "sim-cards": {
    label: "جميع الشرائح",
    parentLabel: "شرائح الاتصال",
    parentHref: "/sim-cards",
    filters: { category: "sim-cards" },
  },
  // ─── راوترات وأجهزة إنترنت ─────────────────────────────────────────────────
  routers: {
    label: "راوترات",
    parentLabel: "أجهزة الإنترنت",
    parentHref: "/routers",
    filters: { category: "routers" },
  },
  "internet-devices": {
    label: "أجهزة الإنترنت",
    parentLabel: "أجهزة الإنترنت",
    parentHref: "/routers",
    filters: { category: "internet-devices" },
  },
};
