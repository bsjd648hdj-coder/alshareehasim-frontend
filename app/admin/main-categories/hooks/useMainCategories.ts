"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { Category } from "../types";

const BASE = "/api/admin/main-categories";

export function useMainCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(() => {
    setFetchLoading(true);
    fetch(`${BASE}/extra`, { credentials: "include" })
      .then(async (res) => {
        const data: Category[] = res.ok ? await res.json() : [];
        setCategories(data);
      })
      .catch(() => toast.error("فشل تحميل التصنيفات"))
      .finally(() => setFetchLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("اسم التصنيف لا يمكن أن يكون فارغاً");
    if (trimmed.length > 100) return setError("الاسم طويل جداً (100 حرف كحد أقصى)");
    setError("");
    setLoading(true);
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: trimmed }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setShowModal(false);
    setName("");
    toast.success(`تم إضافة "${data.name}" بنجاح 🎉`);
    fetchCategories();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) return setEditError("اسم التصنيف لا يمكن أن يكون فارغاً");
    if (trimmed.length > 100) return setEditError("الاسم طويل جداً (100 حرف كحد أقصى)");
    setEditError("");
    setEditLoading(true);
    const res = await fetch(`${BASE}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ oldName: editCat!.name, newName: trimmed }),
    });
    const data = await res.json();
    setEditLoading(false);
    if (!res.ok) return setEditError(data.error);
    setEditCat(null);
    toast.success("تم حفظ التعديلات بنجاح ✅");
    fetchCategories();
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    const catName = confirmDelete;
    setConfirmDelete(null);
    const res = await fetch(`${BASE}/remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: catName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    toast.success(`تم حذف "${catName}" بنجاح ✅`);
    fetchCategories();
  }

  const filtered = useMemo(
    () => categories.filter((c) => c.name.includes(search)),
    [categories, search]
  );

  return {
    categories, filtered, search, setSearch, fetchLoading,
    showModal, setShowModal, name, setName, error, loading, handleAdd,
    editCat, setEditCat, editName, setEditName, editError, editLoading, handleEdit,
    confirmDelete, setConfirmDelete, confirmDeleteAction,
  };
}
