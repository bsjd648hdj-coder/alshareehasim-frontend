export type OrderItem = { productId: string; name: string; price: number; quantity: number };

export type Order = {
  _id: string;
  orderId: string;
  customer: string;
  whatsapp: string;
  nationalId: string;
  address: string;
  installmentType: "installment" | "full";
  months: number;
  monthlyPayment: number;
  total: number;
  downPayment: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
  items: OrderItem[];
  status: "pending" | "confirmed" | "processing" | "ready_to_ship" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  createdAt: string;
};

export const STATUS = {
  pending:          { label: "قيد الانتظار",    cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  confirmed:        { label: "مؤكد",           cls: "bg-green-100 text-green-700 border-green-200"   },
  processing:       { label: "جاري التجهيز",   cls: "bg-purple-100 text-purple-700 border-purple-200" },
  ready_to_ship:    { label: "جاهز للشحن",   cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  shipped:          { label: "تم الشحن",      cls: "bg-cyan-100 text-cyan-700 border-cyan-200"       },
  out_for_delivery: { label: "خرج للتسليم",  cls: "bg-orange-100 text-orange-700 border-orange-200" },
  delivered:        { label: "تم التسليم",    cls: "bg-green-100 text-green-700 border-green-200"   },
  cancelled:        { label: "ملغي",           cls: "bg-red-100 text-red-700 border-red-200"         },
};
