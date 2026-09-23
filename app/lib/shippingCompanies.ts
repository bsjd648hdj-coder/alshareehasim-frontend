export interface ShippingCompany {
  id: string;
  nameAr: string;
  logo: string;
  workDays: string;
  price: number;
  coverage: string;
}

export const SHIPPING_COMPANIES: ShippingCompany[] = [
  {
    id: "aramex",
    nameAr: "أرامكس",
    logo: "/aramix.webp",
    workDays: "3 - 7 أيام عمل",
    price: 0,
    coverage: "أي مكان",
  },
  {
    id: "anywhere",
    nameAr: "أي مكان",
    logo: "/aymakan.webp",
    workDays: "3 - 7 أيام",
    price: 0,
    coverage: "أي مكان",
  },
  {
    id: "imile",
    nameAr: "iMile",
    logo: "/imile.webp",
    workDays: "1 - 3 أيام عمل",
    price: 0,
    coverage: "أي مكان",
  },
  {
    id: "smsa",
    nameAr: "سمسا",
    logo: "/sm.webp",
    workDays: "3 - 10 أيام عمل",
    price: 25.65,
    coverage: "أي مكان",
  },
];
