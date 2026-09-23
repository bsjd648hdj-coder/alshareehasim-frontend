"use client";

import { useMemo, useState } from "react";
import type { Product } from "../../../components/products/types";

export type SortKey = "default" | "price-asc" | "price-desc" | "discount";

export interface Filters {
  sort: SortKey;
  inStockOnly: boolean;
  installmentOnly: boolean;
  storages: string[];
  maxPrice: number | null;
}

export const DEFAULT_FILTERS: Filters = {
  sort: "default",
  inStockOnly: false,
  installmentOnly: false,
  storages: [],
  maxPrice: null,
};

export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const storageOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.storage) set.add(p.storage); });
    return Array.from(set).sort();
  }, [products]);

  const maxProductPrice = useMemo(
    () => Math.max(...products.map((p) => p.originalPrice || p.price || 0), 0),
    [products]
  );

  const filtered = useMemo(() => {
    let list = [...products];

    if (filters.inStockOnly) list = list.filter((p) => p.inStock);
    if (filters.installmentOnly) list = list.filter((p) => p.installment?.available);
    if (filters.storages.length) list = list.filter((p) => p.storage && filters.storages.includes(p.storage));
    if (filters.maxPrice !== null) {
      list = list.filter((p) => {
        const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.originalPrice || p.price || 0;
        return price <= filters.maxPrice!;
      });
    }

    switch (filters.sort) {
      case "price-asc":
        list.sort((a, b) => {
          const pa = a.salePrice && a.salePrice > 0 ? a.salePrice : a.originalPrice || a.price || 0;
          const pb = b.salePrice && b.salePrice > 0 ? b.salePrice : b.originalPrice || b.price || 0;
          return pa - pb;
        });
        break;
      case "price-desc":
        list.sort((a, b) => {
          const pa = a.salePrice && a.salePrice > 0 ? a.salePrice : a.originalPrice || a.price || 0;
          const pb = b.salePrice && b.salePrice > 0 ? b.salePrice : b.originalPrice || b.price || 0;
          return pb - pa;
        });
        break;
      case "discount":
        list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
    }

    return list;
  }, [products, filters]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.inStockOnly) n++;
    if (filters.installmentOnly) n++;
    if (filters.storages.length) n++;
    if (filters.maxPrice !== null) n++;
    if (filters.sort !== "default") n++;
    return n;
  }, [filters]);

  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const toggleStorage = (s: string) =>
    setFilters((f) => ({
      ...f,
      storages: f.storages.includes(s) ? f.storages.filter((x) => x !== s) : [...f.storages, s],
    }));

  const reset = () => setFilters(DEFAULT_FILTERS);

  return { filters, filtered, storageOptions, maxProductPrice, activeCount, toggle, toggleStorage, reset };
}
