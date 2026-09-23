import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../components/products/types";

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CustomerInfo {
  name: string;
  nationalId: string;
  whatsapp: string;
  address: string;
  installmentType: "full" | "installment";
  months: number;
  downPayment: number;
}

interface CartState {
  items: CartItem[];
  customer: CustomerInfo | null;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setCustomer: (info: CustomerInfo) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      addItem: (product, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.product._id === product._id);
          if (existing)
            return {
              items: s.items.map((i) =>
                i.product._id === product._id ? { ...i, qty: i.qty + qty } : i
              ),
            };
          return { items: [...s.items, { product, qty }] };
        }),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.product._id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.product._id !== id)
              : s.items.map((i) =>
                  i.product._id === id ? { ...i, qty } : i
                ),
        })),
      setCustomer: (info) => set({ customer: info }),
      clear: () => set({ items: [], customer: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum + (i.product.salePrice ?? i.product.originalPrice ?? i.product.price) * i.qty,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
