"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";

type SubCat = { name: string; _id: string };
type SpecItem = { label: string; value: string };
type SpecGroup = { groupName: string; items: SpecItem[] };
type ReviewItem = { _id: string; name: string; rating: number; comment: string };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const fileRef = useRef<HTMLInputElement>(null);
  const imagesGalleryRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageLinkInput, setImageLinkInput] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryLinkInput, setGalleryLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagesGalleryUploading, setImagesGalleryUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<SubCat[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  const [form, setForm] = useState({
    name: "",
    brief: "",
    originalPrice: "",
    salePrice: "",
    category: "",
    subCategory: "",
    brand: "",
    description: "",
    inStock: "true",
    isFeatured: "false",
    sortOrder: "0",
    freeDelivery: "true",
    deliveryTime: "24 ساعة",
    warrantyYears: "1",
    taxIncluded: "true",
    installmentAvailable: "false",
    installmentMonths: "",
  });

  const [specifications, setSpecifications] = useState<SpecGroup[]>([
    { groupName: "", items: [{ label: "", value: "" }] },
  ]);

  const [rating, setRating] = useState({ average: "", count: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/sub-categories", { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ]).then(([product, cats]) => {
      if (cats) setCategories(cats);
      if (product) {
        setForm({
          name: product.name || "",
          brief: product.brief || "",
          originalPrice: (product.originalPrice || product.price || "").toString(),
          salePrice: product.salePrice?.toString() || "",
          category: product.category || "",
          subCategory: product.subCategory || "",
          brand: product.brand || "",
          description: product.description || "",
          inStock: product.inStock === false ? "false" : "true",
          isFeatured: product.isFeatured === true ? "true" : "false",
          sortOrder: product.sortOrder?.toString() || "0",
          freeDelivery: product.freeDelivery === false ? "false" : "true",
          deliveryTime: product.deliveryTime || "24 ساعة",
          warrantyYears: product.warrantyYears?.toString() || "1",
          taxIncluded: product.taxIncluded === false ? "false" : "true",
          installmentAvailable: product.installment?.available === true ? "true" : "false",
          installmentMonths: product.installment?.months?.toString() || "",
        });
        if (product.imageUrl) {
          setImageUrl(product.imageUrl);
          setImagePreview(product.imageUrl);
        }
        if (product.images && Array.isArray(product.images)) {
          const gallery = product.images.filter((img: string) => img !== product.imageUrl);
          setGalleryImages(gallery);
        }
        if (product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0) {
          setSpecifications(product.specifications);
        }
        if (product.rating) {
          setRating({
            average: product.rating.average?.toString() || "",
            count: product.rating.count?.toString() || "",
          });
        }
        if (product.reviews && Array.isArray(product.reviews)) {
          setReviews(product.reviews);
        }
      }
      setLoading(false);
    });
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/admin/products/upload-image", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل الرفع");
    return data.url;
  }

  async function handleMainImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      setImageLinkInput("");
      toast.success("تم رفع الصورة ✅");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الصورة");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  }

  function handleMainImageLink() {
    const link = imageLinkInput.trim();
    if (!link) return;
    setImageUrl(link);
    setImagePreview(link);
    setImageLinkInput("");
    toast.success("تم إضافة رابط الصورة ✅");
  }

  function clearMainImage() {
    setImageUrl("");
    setImagePreview("");
    setImageLinkInput("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImagesGalleryFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagesGalleryUploading(true);
    try {
      const url = await uploadImage(file);
      setGalleryImages((prev) => [...prev, url]);
      toast.success("تم رفع صورة الجاليري ✅");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setImagesGalleryUploading(false);
      if (imagesGalleryRef.current) imagesGalleryRef.current.value = "";
    }
  }

  function handleImagesGalleryLink() {
    const link = galleryLinkInput.trim();
    if (!link) return;
    setGalleryImages((prev) => [...prev, link]);
    setGalleryLinkInput("");
    toast.success("تم إضافة رابط الصورة ✅");
  }

  function removeImagesGalleryItem(index: number) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  }

  function addSpecGroup() {
    setSpecifications((prev) => [...prev, { groupName: "", items: [{ label: "", value: "" }] }]);
  }

  function removeSpecGroup(index: number) {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSpecGroupName(index: number, groupName: string) {
    setSpecifications((prev) => prev.map((g, i) => (i === index ? { ...g, groupName } : g)));
  }

  function addSpecItem(groupIndex: number) {
    setSpecifications((prev) =>
      prev.map((g, i) => (i === groupIndex ? { ...g, items: [...g.items, { label: "", value: "" }] } : g))
    );
  }

  function removeSpecItem(groupIndex: number, itemIndex: number) {
    setSpecifications((prev) =>
      prev.map((g, i) => (i === groupIndex ? { ...g, items: g.items.filter((_, j) => j !== itemIndex) } : g))
    );
  }

  function updateSpecItem(groupIndex: number, itemIndex: number, field: "label" | "value", val: string) {
    setSpecifications((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? { ...g, items: g.items.map((item, j) => (j === itemIndex ? { ...item, [field]: val } : item)) }
          : g
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.originalPrice) return toast.error("الاسم والسعر مطلوبان");
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        brief: form.brief,
        originalPrice: Number(form.originalPrice),
        price: Number(form.salePrice || form.originalPrice),
        category: form.category,
        description: form.description,
        inStock: form.inStock === "true",
        salePrice: form.salePrice ? Number(form.salePrice) : "",
      };
      if (imageUrl) body.imageUrl = imageUrl;
      else body.imageUrl = "";

      const allImages = imageUrl ? [imageUrl, ...galleryImages] : [...galleryImages];
      body.images = allImages;

      const filledSpecs = specifications
        .filter((g) => g.groupName)
        .map((g) => ({ ...g, items: g.items.filter((item) => item.label && item.value) }))
        .filter((g) => g.items.length > 0);
      body.specifications = filledSpecs;

      body.rating = { average: Number(rating.average) || 0, count: Number(rating.count) || 0 };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      toast.success("تم تعديل المنتج بنجاح ✅");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">جاري التحميل...</div>;

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">
          ← رجوع
        </button>
        <h1 className="text-2xl font-bold text-gray-800">تعديل المنتج</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* القسم الأول - البيانات الأساسية */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">البيانات الأساسية</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* الصورة الأساسية */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الأساسية</label>
              <div
                onClick={() => !imagePreview && fileRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center transition-colors h-48 ${!imagePreview ? "cursor-pointer hover:border-blue-400" : ""}`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img src={imagePreview} alt="preview" className="w-full h-full object-contain rounded-xl" />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                        <span className="text-sm text-blue-600 font-medium">جاري الرفع...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <span className="text-4xl text-gray-200 mb-2">📷</span>
                    <span className="text-sm text-gray-500">اضغط لاختيار صورة</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageFile} />
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={imageLinkInput}
                  onChange={(e) => setImageLinkInput(e.target.value)}
                  placeholder="أو الصق رابط الصورة..."
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMainImageLink())}
                />
                <button
                  type="button"
                  onClick={handleMainImageLink}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  إضافة
                </button>
              </div>
              {imagePreview && (
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg text-xs font-medium"
                  >
                    تغيير
                  </button>
                  <button
                    type="button"
                    onClick={clearMainImage}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-xs font-medium"
                  >
                    🗑 مسح
                  </button>
                </div>
              )}

              {/* صور الجاليري */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">صور الجاليري</label>
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {galleryImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square"
                      >
                        <img src={img} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImagesGalleryItem(i)}
                          className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={imagesGalleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagesGalleryFile}
                />
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={galleryLinkInput}
                    onChange={(e) => setGalleryLinkInput(e.target.value)}
                    placeholder="أو الصق رابط صورة..."
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleImagesGalleryLink())}
                  />
                  <button
                    type="button"
                    onClick={handleImagesGalleryLink}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    إضافة
                  </button>
                </div>
                {imagesGalleryUploading && (
                  <p className="text-xs text-blue-500 mt-1">جاري الرفع...</p>
                )}
                <p className="text-xs text-gray-400 mt-1">عدد الصور: {galleryImages.length}</p>
              </div>
            </div>

            {/* البيانات */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="مثال: iPhone 16 Pro Max"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف قصير (Brief)</label>
                <input
                  name="brief"
                  value={form.brief}
                  onChange={handleChange}
                  placeholder="وصف مختصر يظهر تحت اسم المنتج..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأساسي (ر.س) *</label>
                  <input
                    name="originalPrice"
                    type="number"
                    min="0"
                    step="any"
                    value={form.originalPrice}
                    onChange={handleChange}
                    required
                    placeholder="5000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع بعد الخصم</label>
                  <input
                    name="salePrice"
                    type="number"
                    min="0"
                    step="any"
                    value={form.salePrice}
                    onChange={handleChange}
                    placeholder="4500"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                  <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                    <option value="">-- اختر تصنيف --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select name="inStock" value={form.inStock} onChange={handleChange} className={inputClass}>
                    <option value="true">متوفر</option>
                    <option value="false">غير متوفر</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* القسم الثاني - الوصف التفصيلي */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">الوصف التفصيلي</h2>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder="اكتب وصف تفصيلي كبير عن المنتج..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* القسم الثالث - المواصفات */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">المواصفات</h2>
            <button
              type="button"
              onClick={addSpecGroup}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium"
            >
              + إضافة قسم
            </button>
          </div>

          <div className="space-y-4">
            {specifications.map((group, gIndex) => (
              <div key={gIndex} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={group.groupName}
                    onChange={(e) => updateSpecGroupName(gIndex, e.target.value)}
                    placeholder="اسم القسم (مثال: الشاشة، الكاميرا، البطارية...)"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecGroup(gIndex)}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      🗑
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {group.items.map((item, iIndex) => (
                    <div key={iIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateSpecItem(gIndex, iIndex, "label", e.target.value)}
                        placeholder="المواصفة (مثال: الحجم)"
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => updateSpecItem(gIndex, iIndex, "value", e.target.value)}
                        placeholder="القيمة (مثال: 6.7 بوصة)"
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {group.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpecItem(gIndex, iIndex)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addSpecItem(gIndex)}
                  className="mt-2 text-blue-500 hover:text-blue-700 text-xs font-medium"
                >
                  + إضافة مواصفة
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* القسم الرابع - التقييم */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">التقييم والمراجعات</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">متوسط التقييم</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating.average}
                onChange={(e) => setRating((prev) => ({ ...prev, average: e.target.value }))}
                placeholder="4.9"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد التقييمات</label>
              <input
                type="number"
                min="0"
                value={rating.count}
                onChange={(e) => setRating((prev) => ({ ...prev, count: e.target.value }))}
                placeholder="284"
                className={inputClass}
              />
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">المراجعات ({reviews.length})</h3>
              {reviews.map((r) => (
                <div key={r._id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">{r.name}</span>
                    <span className="text-yellow-500 text-xs">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="text-xs text-gray-600">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* زر الحفظ */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
