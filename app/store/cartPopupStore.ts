import { create } from "zustand";

export interface PopupProduct {
  id: string;
  name: string;
  image: string | null;
  price: number;
  hasDiscount: boolean;
}

interface CartPopupState {
  visible: boolean;
  product: PopupProduct | null;
  triggerKey: number;
  show: (product: PopupProduct) => void;
  hide: () => void;
}

export const useCartPopupStore = create<CartPopupState>((set) => ({
  visible: false,
  product: null,
  triggerKey: 0,
  show: (product) =>
    set((s) => ({ visible: true, product, triggerKey: s.triggerKey + 1 })),
  hide: () => set({ visible: false }),
}));
