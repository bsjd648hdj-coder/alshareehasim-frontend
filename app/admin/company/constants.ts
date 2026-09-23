export const API = process.env.NEXT_PUBLIC_API_URL || "https://alshareehasim-backend.vercel.app";

export const fields = [
  { key: "nameAr", label: "الاسم بالعربية" },
  { key: "nameEn", label: "الاسم بالانجليزية" },
  { key: "addressAr", label: "العنوان بالعربية" },
  { key: "addressEn", label: "العنوان بالانجليزية" },
  { key: "phone", label: "رقم الهاتف" },
  { key: "whatsapp", label: "رقم الواتساب" },
  { key: "website", label: "الرابط" },
  { key: "email", label: "الايميل" },
  { key: "currencyAr", label: "عملة البيع عربي" },
  { key: "currencyEn", label: "عملة البيع انجليزي" },
  { key: "taxNumber", label: "الرقم الضريبي" },
  { key: "shippingCompany", label: "اسم شركة الشحن" },
  { key: "paymentMethod", label: "طريقة الدفع" },
];

export const imageFields = [
  { key: "logo", label: "الشعار" },
  { key: "header", label: "الترويسة" },
  { key: "footer", label: "التذييل" },
  { key: "stamp", label: "الختم" },
  { key: "cancelStamp", label: "ختم الإلغاء" },
];

export const defaultData = {
  nameAr: "",
  nameEn: "",
  addressAr: "",
  addressEn: "",
  phone: "",
  whatsapp: "",
  website: "",
  email: "",
  currencyAr: "",
  currencyEn: "",
  taxNumber: "",
  shippingCompany: "",
  paymentMethod: "",
  details: "",
  logo: "",
  header: "",
  footer: "",
  stamp: "",
  cancelStamp: "",
};

export const toFullUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `${API}${url}`;
};

