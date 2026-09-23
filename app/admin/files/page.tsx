"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiUpload, FiLink, FiExternalLink, FiTrash2 } from "react-icons/fi";

type FooterItem = { _id?: string; image: string; linkType: string; link: string; file: string };
type Data = { qrImage: string; qrLink: string; qrLinkType: string; qrFile: string; img1: string; link1: string; linkType1: string; file1: string; img2: string; link2: string; linkType2: string; file2: string; footerItems: FooterItem[] };

export default function FilesPage() {
  const [data, setData] = useState<Data>({ qrImage: "", qrLink: "", qrLinkType: "link", qrFile: "", img1: "", link1: "", linkType1: "link", file1: "", img2: "", link2: "", linkType2: "link", file2: "", footerItems: [] });
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, string>>({});

  function showMsg(section: string, text: string) {
    setMsgs((p) => ({ ...p, [section]: text }));
    setTimeout(() => setMsgs((p) => ({ ...p, [section]: "" })), 3000);
  }

  // Set-based uploading state — supports concurrent uploads without race condition
  const [uploadingSet, setUploadingSet] = useState<Set<string>>(new Set());
  function startUploading(key: string) { setUploadingSet((p) => new Set(p).add(key)); }
  function stopUploading(key: string) { setUploadingSet((p) => { const n = new Set(p); n.delete(key); return n; }); }
  function isUploading(key: string) { return uploadingSet.has(key); }

  function openFile(url: string) {
    const rawUrl = url.replace("/image/upload/", "/raw/upload/").replace(/\/fl_attachment:[^/]+\//, "/");
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=false`;
    window.open(viewerUrl, "_blank", "noopener,noreferrer");
  }
  const [imgKeys, setImgKeys] = useState<Record<string, number>>({});
  const qrRef = useRef<HTMLInputElement>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);
  const img1Ref = useRef<HTMLInputElement>(null);
  const img2Ref = useRef<HTMLInputElement>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const imgRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function bumpKey(k: string) { setImgKeys((p) => ({ ...p, [k]: Date.now() })); }

  useEffect(() => {
    fetch(`/api/admin/company`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const normalize = (item: Partial<FooterItem>): FooterItem => ({ _id: (item as FooterItem & { _id?: string })._id, image: item.image || "", linkType: item.linkType || (item.file ? "file" : "link"), link: item.link || "", file: item.file || "" });
        const items = (d.footerItems && d.footerItems.length > 0
          ? d.footerItems
          : [{}, {}, {}]).map(normalize);
        setData({ qrImage: d.qrImage || "", qrLink: d.qrLink || "", qrLinkType: d.qrLinkType || (d.qrFile ? "file" : "link"), qrFile: d.qrFile || "", img1: d.img1 || "", link1: d.link1 || "", linkType1: d.link1Type || (d.file1 ? "file" : "link"), file1: d.file1 || "", img2: d.img2 || "", link2: d.link2 || "", linkType2: d.link2Type || (d.file2 ? "file" : "link"), file2: d.file2 || "", footerItems: items });
      })
      .catch(() => showMsg("load", "❌ فشل تحميل البيانات"));
  }, []);

  async function uploadQr(file: File) {
    startUploading("qr");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`/api/admin/company/footer-image/qrImage`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("qr", `❌ ${json.error || "فشل الرفع"}`); return; }
      if (json.url) { setData((p) => ({ ...p, qrImage: json.url })); bumpKey("qr"); }
    } catch { showMsg("qr", "❌ خطأ في الشبكة"); }
    finally { stopUploading("qr"); }
  }

  async function uploadImg1(file: File) {
    startUploading("img1");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`/api/admin/company/footer-image/img1`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("s1", `❌ ${json.error || "فشل الرفع"}`); return; }
      if (json.url) { setData((p) => ({ ...p, img1: json.url })); bumpKey("img1"); }
    } catch { showMsg("s1", "❌ خطأ في الشبكة"); }
    finally { stopUploading("img1"); }
  }

  async function uploadImg2(file: File) {
    startUploading("img2");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`/api/admin/company/footer-image/img2`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("s2", `❌ ${json.error || "فشل الرفع"}`); return; }
      if (json.url) { setData((p) => ({ ...p, img2: json.url })); bumpKey("img2"); }
    } catch { showMsg("s2", "❌ خطأ في الشبكة"); }
    finally { stopUploading("img2"); }
  }

  async function uploadQrFile(file: File) {
    startUploading("qrFile");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/admin/company/footer-file/qrFile`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("qr", `❌ ${json.error || "فشل الرفع"}`); return; }
      if (json.url) setData((p) => ({ ...p, qrFile: json.url }));
    } catch { showMsg("qr", "❌ خطأ في الشبكة"); }
    finally { stopUploading("qrFile"); }
  }

  async function uploadFile1(file: File) {
    startUploading("file1");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/admin/company/footer-file/file1`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("s1", `❌ ${json.error || "فشل الرفع"}`); return; }
      if (json.url) setData((p) => ({ ...p, file1: json.url }));
    } catch { showMsg("s1", "❌ خطأ في الشبكة"); }
    finally { stopUploading("file1"); }
  }

  async function uploadFile2(file: File) {
    startUploading("file2");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/admin/company/footer-file/file2`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("s2", `❌ ${json.error || "فشل الرفع"}`); return; }
      if (json.url) setData((p) => ({ ...p, file2: json.url }));
    } catch { showMsg("s2", "❌ خطأ في الشبكة"); }
    finally { stopUploading("file2"); }
  }

  async function uploadItemImg(index: number, file: File) {
    const key = `img-${index}`;
    startUploading(key);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`/api/admin/company/footer-items/image/${index}`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("items", `❌ ${json.error || "فشل الرفع"}`); return; }
      if (json.url) {
        setData((p) => {
          const items = [...p.footerItems];
          items[index] = { ...items[index], image: json.url };
          return { ...p, footerItems: items };
        });
        bumpKey(key);
      }
    } catch { showMsg("items", "❌ خطأ في الشبكة"); }
    finally { stopUploading(key); }
  }

  async function uploadItemFile(index: number, file: File) {
    const key = `file-${index}`;
    startUploading(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/admin/company/footer-items/file/${index}`, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("items", `❌ ${json.error || "فشل الرفع"}`); return; }
      if (json.url) setData((p) => {
        const items = [...p.footerItems];
        items[index] = { ...items[index], file: json.url };
        return { ...p, footerItems: items };
      });
    } catch { showMsg("items", "❌ خطأ في الشبكة"); }
    finally { stopUploading(key); }
  }

  function updateItem(index: number, field: keyof FooterItem, value: string) {
    setData((p) => {
      const items = [...p.footerItems];
      items[index] = { ...items[index], [field]: value };
      return { ...p, footerItems: items };
    });
  }

  async function deleteFile(field: "qrFile" | "file1" | "file2", section: string) {
    try {
      const r = await fetch(`/api/admin/company/footer-file-delete/${field}`, { method: "DELETE", credentials: "include" });
      const json = await r.json();
      if (!r.ok) { showMsg(section, `❌ ${json.error || "فشل الحذف"}`); return; }
      setData((p) => ({ ...p, [field]: "" }));
    } catch { showMsg(section, "❌ خطأ في الشبكة"); }
  }

  async function deleteImage(field: "qrImage" | "img1" | "img2", section: string) {
    try {
      const r = await fetch(`/api/admin/company/image/${field}`, { method: "DELETE", credentials: "include" });
      const json = await r.json();
      if (!r.ok) { showMsg(section, `❌ ${json.error || "فشل الحذف"}`); return; }
      setData((p) => ({ ...p, [field]: "" }));
    } catch { showMsg(section, "❌ خطأ في الشبكة"); }
  }

  async function saveSection(section: string, body: object) {
    setSavingSection(section);
    try {
      const r = await fetch(`/api/admin/company`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      showMsg(section, r.ok ? "✅ تم الحفظ" : `❌ ${json.error || "حدث خطأ"}`);
    } catch { showMsg(section, "❌ خطأ في الشبكة"); }
    finally { setSavingSection(null); }
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">الملفات والصور</h1>
      </div>

      {/* QR */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">الكيو آر</h2>
          <div className="flex items-center gap-2">
            {msgs["qr"] && <span className={`text-xs px-2 py-1 rounded-lg font-medium ${msgs["qr"].includes("✅") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{msgs["qr"]}</span>}
            <button onClick={() => saveSection("qr", { qrLink: data.qrLink, qrLinkType: data.qrLinkType, qrFile: data.qrFile })} disabled={savingSection === "qr"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {savingSection === "qr" ? "جاري..." : "حفظ"}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
          {/* صورة QR */}
          <div className="relative shrink-0">
            <div onClick={() => qrRef.current?.click()}
              className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden">
              {isUploading("qr") ? (
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : data.qrImage ? (
                <>
                  <Image key={imgKeys["qr"] || data.qrImage} src={data.qrImage} alt="qr" fill sizes="80px" className="object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={16} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FiUpload size={20} />
                  <span className="text-[10px]">رفع صورة</span>
                </div>
              )}
              <input ref={qrRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadQr(e.target.files[0])} />
            </div>
            {data.qrImage && (
              <button onClick={() => deleteImage("qrImage", "qr")}
                className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow">
                <FiTrash2 size={10} />
              </button>
            )}
          </div>
          {/* رابط أو ملف QR */}
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex gap-4">
              {["link", "file"].map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                  <input type="radio" name="type-qr" value={t}
                    checked={(data.qrLinkType || "link") === t}
                    onChange={() => setData((p) => ({ ...p, qrLinkType: t }))}
                    className="accent-blue-600" />
                  {t === "link" ? "رابط" : "ملف"}
                </label>
              ))}
            </div>
            <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
              <span className="shrink-0">⚠️</span>
              <span>مسموح برابط واحد أو ملف واحد فقط — لا يمكن الجمع بينهما</span>
            </div>

            {(data.qrLinkType || "link") === "link" ? (
              <div key="qr-link" className="flex items-center gap-2 w-full">
                <FiLink className="text-gray-400 shrink-0" size={15} />
                <input type="text" value={data.qrLink ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, qrLink: e.target.value }))}
                  placeholder="رابط عند الضغط على الكيو آر..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
              </div>
            ) : (
              <div key="qr-file" className="flex flex-wrap items-center gap-2">
                <button onClick={() => qrFileRef.current?.click()}
                  disabled={isUploading("qrFile")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0">
                  {isUploading("qrFile")
                    ? <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    : <FiUpload size={13} />}
                  رفع ملف
                </button>
                <input type="file" className="hidden" ref={qrFileRef}
                  onChange={(e) => e.target.files?.[0] && uploadQrFile(e.target.files[0])} />
                {data.qrFile && (
                  <>
                    <button onClick={() => openFile(data.qrFile)}
                      className="flex items-center gap-1 text-emerald-600 text-sm hover:underline">
                      <FiExternalLink size={13} />
                      عرض الملف
                    </button>
                    <button onClick={() => deleteFile("qrFile", "qr")}
                      className="text-red-400 hover:text-red-600 text-xs hover:underline">
                      حذف
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">معروف</h2>
          <div className="flex items-center gap-2">
            {msgs["items"] && <span className={`text-xs px-2 py-1 rounded-lg font-medium ${msgs["items"].includes("✅") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{msgs["items"]}</span>}
            <button onClick={() => saveSection("items", { footerItems: data.footerItems })} disabled={savingSection === "items"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {savingSection === "items" ? "جاري..." : "حفظ"}
            </button>
          </div>
        </div>

        {data.footerItems.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            لا توجد صور — اضغط &quot;إضافة صورة&quot; لإضافة أول صورة
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.footerItems.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">

                {/* صورة */}
                <div className="relative shrink-0">
                  <div onClick={() => imgRefs.current[i]?.click()}
                    className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden">
                    {isUploading(`img-${i}`) ? (
                      <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : item.image ? (
                      <>
                        <Image key={imgKeys[`img-${i}`] || item.image} src={item.image} alt="preview" fill sizes="80px" className="object-contain p-1" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FiUpload className="text-white" size={16} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <FiUpload size={20} />
                        <span className="text-[10px]">رفع صورة</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden"
                      ref={(el) => { imgRefs.current[i] = el; }}
                      onChange={(e) => e.target.files?.[0] && uploadItemImg(i, e.target.files[0])} />
                  </div>
                  {item.image && (
                    <button onClick={() => updateItem(i, "image", "")}
                      className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow">
                      <FiTrash2 size={10} />
                    </button>
                  )}
                </div>

                {/* رابط أو ملف */}
                <div className="flex-1 min-w-0 w-full space-y-2">
                  <div className="flex gap-4">
                    {["link", "file"].map((t) => (
                      <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                        <input type="radio" name={`type-${i}`} value={t}
                          checked={(item.linkType ?? "link") === t}
                          onChange={() => updateItem(i, "linkType", t)}
                          className="accent-blue-600" />
                        {t === "link" ? "رابط" : "ملف"}
                      </label>
                    ))}
                  </div>

                  <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
                    <span className="shrink-0">⚠️</span>
                    <span>مسموح برابط واحد أو ملف واحد فقط — لا يمكن الجمع بينهما</span>
                  </div>

                  {(item.linkType ?? "link") === "link" ? (
                    <div key={`link-input-${i}`} className="flex items-center gap-2 w-full">
                      <FiLink className="text-gray-400 shrink-0" size={15} />
                      <input type="text" value={item.link ?? ""}
                        onChange={(e) => updateItem(i, "link", e.target.value)}
                        placeholder="https://..."
                        className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                    </div>
                  ) : (
                    <div key={`file-input-${i}`} className="flex flex-wrap items-center gap-2">
                      <button onClick={() => fileRefs.current[i]?.click()}
                        disabled={isUploading(`file-${i}`)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0">
                        {isUploading(`file-${i}`)
                          ? <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          : <FiUpload size={13} />}
                        رفع ملف
                      </button>
                      <input type="file" className="hidden"
                        ref={(el) => { fileRefs.current[i] = el; }}
                        onChange={(e) => e.target.files?.[0] && uploadItemFile(i, e.target.files[0])} />
                      {item.file && (
                        <>
                          <button onClick={() => openFile(item.file)}
                            className="flex items-center gap-1 text-emerald-600 text-sm hover:underline">
                            <FiExternalLink size={13} />
                            عرض الملف
                          </button>
                          <button onClick={() => updateItem(i, "file", "")}
                            className="text-red-400 hover:text-red-600 text-xs hover:underline">
                            حذف
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

              

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 1 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600"> مركز الاعمال السعودي</h2>
          <div className="flex items-center gap-2">
            {msgs["s1"] && <span className={`text-xs px-2 py-1 rounded-lg font-medium ${msgs["s1"].includes("✅") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{msgs["s1"]}</span>}
            <button onClick={() => saveSection("s1", { link1: data.link1, link1Type: data.linkType1, file1: data.file1 })} disabled={savingSection === "s1"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {savingSection === "s1" ? "جاري..." : "حفظ"}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
          <div className="relative shrink-0">
            <div onClick={() => img1Ref.current?.click()}
              className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden">
              {isUploading("img1") ? (
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : data.img1 ? (
                <>
                  <Image key={imgKeys["img1"] || data.img1} src={data.img1} alt="img1" fill sizes="80px" className="object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={16} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FiUpload size={20} />
                  <span className="text-[10px]">رفع صورة</span>
                </div>
              )}
              <input ref={img1Ref} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImg1(e.target.files[0])} />
            </div>
            {data.img1 && (
              <button onClick={() => deleteImage("img1", "s1")}
                className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow">
                <FiTrash2 size={10} />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex gap-4">
              {["link", "file"].map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                  <input type="radio" name="type-1" value={t}
                    checked={(data.linkType1 || "link") === t}
                    onChange={() => setData((p) => ({ ...p, linkType1: t }))}
                    className="accent-blue-600" />
                  {t === "link" ? "رابط" : "ملف"}
                </label>
              ))}
            </div>
            <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
              <span className="shrink-0">⚠️</span>
              <span>مسموح برابط واحد أو ملف واحد فقط — لا يمكن الجمع بينهما</span>
            </div>

            {(data.linkType1 || "link") === "link" ? (
              <div key="s1-link" className="flex items-center gap-2 w-full">
                <FiLink className="text-gray-400 shrink-0" size={15} />
                <input type="text" value={data.link1 ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, link1: e.target.value }))}
                  placeholder="رابط سكشن 1..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
              </div>
            ) : (
              <div key="s1-file" className="flex flex-wrap items-center gap-2">
                <button onClick={() => fileRef1.current?.click()}
                  disabled={isUploading("file1")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0">
                  {isUploading("file1")
                    ? <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    : <FiUpload size={13} />}
                  رفع ملف
                </button>
                <input type="file" className="hidden" ref={fileRef1}
                  onChange={(e) => e.target.files?.[0] && uploadFile1(e.target.files[0])} />
                {data.file1 && (
                  <>
                    <button onClick={() => openFile(data.file1)}
                      className="flex items-center gap-1 text-emerald-600 text-sm hover:underline">
                      <FiExternalLink size={13} />
                      عرض الملف
                    </button>
                    <button onClick={() => deleteFile("file1", "s1")}
                      className="text-red-400 hover:text-red-600 text-xs hover:underline">
                      حذف
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600"> ضريبه القيمه المضافه</h2>
          <div className="flex items-center gap-2">
            {msgs["s2"] && <span className={`text-xs px-2 py-1 rounded-lg font-medium ${msgs["s2"].includes("✅") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{msgs["s2"]}</span>}
            <button onClick={() => saveSection("s2", { link2: data.link2, link2Type: data.linkType2, file2: data.file2 })} disabled={savingSection === "s2"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {savingSection === "s2" ? "جاري..." : "حفظ"}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
          <div className="relative shrink-0">
            <div onClick={() => img2Ref.current?.click()}
              className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden">
              {isUploading("img2") ? (
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : data.img2 ? (
                <>
                  <Image key={imgKeys["img2"] || data.img2} src={data.img2} alt="img2" fill sizes="80px" className="object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={16} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FiUpload size={20} />
                  <span className="text-[10px]">رفع صورة</span>
                </div>
              )}
              <input ref={img2Ref} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImg2(e.target.files[0])} />
            </div>
            {data.img2 && (
              <button onClick={() => deleteImage("img2", "s2")}
                className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow">
                <FiTrash2 size={10} />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex gap-4">
              {["link", "file"].map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                  <input type="radio" name="type-2" value={t}
                    checked={(data.linkType2 || "link") === t}
                    onChange={() => setData((p) => ({ ...p, linkType2: t }))}
                    className="accent-blue-600" />
                  {t === "link" ? "رابط" : "ملف"}
                </label>
              ))}
            </div>
            <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
              <span className="shrink-0">⚠️</span>
              <span>مسموح برابط واحد أو ملف واحد فقط — لا يمكن الجمع بينهما</span>
            </div>

            {(data.linkType2 || "link") === "link" ? (
              <div key="s2-link" className="flex items-center gap-2 w-full">
                <FiLink className="text-gray-400 shrink-0" size={15} />
                <input type="text" value={data.link2 ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, link2: e.target.value }))}
                  placeholder="رابط سكشن 2..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
              </div>
            ) : (
              <div key="s2-file" className="flex flex-wrap items-center gap-2">
                <button onClick={() => fileRef2.current?.click()}
                  disabled={isUploading("file2")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0">
                  {isUploading("file2")
                    ? <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    : <FiUpload size={13} />}
                  رفع ملف
                </button>
                <input type="file" className="hidden" ref={fileRef2}
                  onChange={(e) => e.target.files?.[0] && uploadFile2(e.target.files[0])} />
                {data.file2 && (
                  <>
                    <button onClick={() => openFile(data.file2)}
                      className="flex items-center gap-1 text-emerald-600 text-sm hover:underline">
                      <FiExternalLink size={13} />
                      عرض الملف
                    </button>
                    <button onClick={() => deleteFile("file2", "s2")}
                      className="text-red-400 hover:text-red-600 text-xs hover:underline">
                      حذف
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
