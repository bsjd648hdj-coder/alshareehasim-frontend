"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCompanyStore } from "../../../store/companyStore";
import { API, defaultData, toFullUrl } from "../constants";
import type { CompanyData } from "../types";

export function useCompany() {
  const { setLogo, setCompanyData } = useCompanyStore();
  const [data, setData] = useState<CompanyData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request if component unmounts
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    fetch(`/api/admin/company`, { credentials: "include", signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        const imageKeys = ["logo", "header", "footer", "stamp", "cancelStamp"];
        const merged: CompanyData = { ...defaultData };
        for (const k of Object.keys(defaultData)) {
          if (res[k] !== undefined && res[k] !== "") {
            merged[k] = imageKeys.includes(k) ? toFullUrl(res[k]) : res[k];
          }
        }
        setData(merged);
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // unmount — ignore
        toast.error("فشل تحميل بيانات الشركة");
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleChange = useCallback((key: string, value: string) =>
    setData((prev) => ({ ...prev, [key]: value })), []);

  const handleImageChange = useCallback(async (key: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`/api/admin/company/upload/${key}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "فشل رفع الصورة"); return; }
      const fullUrl = json.url.startsWith("http") ? json.url : `${API}${json.url}`;
      setData((prev) => ({ ...prev, [key]: fullUrl }));
      if (key === "logo") setLogo(fullUrl);
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
    }
  }, [setLogo]);

  const handleImageDelete = useCallback(async (key: string): Promise<void> => {
    try {
      const res = await fetch(`/api/admin/company/image/${key}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) { toast.error("فشل حذف الصورة"); return; }
      setData((prev) => ({ ...prev, [key]: "" }));
      if (key === "logo") setLogo("");
      toast.success("تم حذف الصورة");
    } catch {
      toast.error("فشل حذف الصورة");
    }
  }, [setLogo]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const IMAGE_KEYS = ["logo", "header", "footer", "stamp", "cancelStamp"];
      const textPayload = Object.fromEntries(
        Object.entries(data).filter(([k]) => !IMAGE_KEYS.includes(k))
      );
      const res = await fetch(`/api/admin/company`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(textPayload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || "فشل الحفظ");
        return;
      }

      // Update the global store so Navbar logo/name stay in sync — no extra fetch
      setCompanyData({
        nameAr: data.nameAr || "",
        nameEn: data.nameEn || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        website: data.website || "",
        details: data.details || "",
      });

      // Revalidate Next.js cache tag so Server Components re-fetch on next request
      fetch("/api/revalidate?tag=company", { method: "POST" }).catch(() => {});

      toast.success("تم حفظ بيانات الشركة");
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }, [data, setCompanyData]);

  return { data, loading, saving, handleChange, handleImageChange, handleImageDelete, handleSave };
}
