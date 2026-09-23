import Image from "next/image";
import { FaWhatsapp, FaMobileAlt, FaEnvelope } from "react-icons/fa";

import { getCompanyData, type CompanyData } from "../lib/company";

export default async function Footer({ company }: { company?: CompanyData }) {
  const c = company || (await getCompanyData());

  function ensureAbsolute(url: string) {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  }

  function toInlineUrl(url: string) {
    if (!url) return "";
    const absUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    return `/file-view?url=${encodeURIComponent(absUrl)}`;
  }

  const qrSrc: string = c.qrImage || "";
  const qrLinkType: string = c.qrFile ? "file" : (c.qrLinkType || "link");
  const qrLink: string = qrLinkType === "file" ? toInlineUrl(c.qrFile || "") : ensureAbsolute(c.qrLink || "");

  const footerItems: { image: string; linkType: string; link: string; file: string }[] =
    (c.footerItems || []).filter((item: { image: string }) => item.image);

  const img1: string = c.img1 || "";
  const linkType1: string = c.file1 ? "file" : (c.link1Type || c.linkType1 || "link");
  const link1: string = linkType1 === "file" ? toInlineUrl(c.file1 || "") : ensureAbsolute(c.link1 || "");
  const img2: string = c.img2 || "";
  const linkType2: string = c.file2 ? "file" : (c.link2Type || c.linkType2 || "link");
  const link2: string = linkType2 === "file" ? toInlineUrl(c.file2 || "") : ensureAbsolute(c.link2 || "");

  function getHref(item: { linkType: string; link: string; file: string }) {
    if (item.file) return toInlineUrl(item.file);
    if (item.linkType === "link" && item.link) return ensureAbsolute(item.link);
    return "";
  }

  const hasImages = qrSrc || footerItems.length > 0 || img1 || img2;

  return (
    <footer dir="rtl" className="mt-16 border-t border-gray-200" style={{ background: "#F3F4F6" }}>

      <div className="max-w-6xl mx-auto px-5 pt-12 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Image src="/logo.webp" alt="لمسة الثابتة" width={72} height={72} className="object-contain" />
            <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
              لمسة الثابتة — شرائح اتصال وإنترنت بأسعار منافسة وباقات تناسب احتياجك، مع خدمة سريعة وآمنة وتجربة شراء بكل سهولة وثقة.
            </p>
            <div className="flex flex-col gap-2">
              <a href="https://qr.saudibusiness.gov.sa/viewcr?nCrNumber=qkDdLTB2Uy+Be+pn809n2w==" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 group">
                <Image src="/commerce.webp" alt="سجل تجاري" width={36} height={36} className="object-contain rounded-md shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-black group-hover:underline">السجل التجاري</span>
                  <span className="text-xs text-gray-500 font-mono">7054930313</span>
                </div>
              </a>
              <a href="https://eauthenticate.saudibusiness.gov.sa/inquiry" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 group">
                <Image src="/work.webp" alt="شهادة توثيق" width={36} height={36} className="object-contain rounded-md shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-black group-hover:underline">شهادة توثيق</span>
                  <span className="text-xs text-gray-500">مركز الاعمال</span>
                  <span className="text-xs text-gray-500 font-mono">0000325383</span>
                </div>
              </a>
            </div>
          </div>

          {/* Contact details */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-black">تواصل معنا</h3>

            <ul className="flex flex-col gap-3">
              {c.whatsapp && (
                <li>
                  <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 shrink-0">
                      <FaWhatsapp size={14} className="text-black" />
                    </span>
                    <span dir="ltr">{c.whatsapp}</span>
                  </a>
                </li>
              )}
              {c.phone && (
                <li>
                  <a href={`tel:${c.phone}`}
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 shrink-0">
                      <FaMobileAlt size={14} className="text-black" />
                    </span>
                    <span dir="ltr">{c.phone}</span>
                  </a>
                </li>
              )}
              {c.email && (
                <li>
                  <a href={`mailto:${c.email}`}
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 shrink-0">
                      <FaEnvelope size={14} className="text-black" />
                    </span>
                    <span dir="ltr">{c.email}</span>
                  </a>
                </li>
              )}
            </ul>

            {hasImages && (
              <div className="flex gap-2 items-center flex-wrap mt-1">
                {qrSrc && (
                  qrLink
                    ? <a href={qrLink} target="_blank" rel="noreferrer" className="shrink-0">
                        <Image src={qrSrc} alt="qr" width={200} height={200} className="rounded-lg bg-white p-1 h-auto w-auto max-h-20 md:max-h-24 border border-gray-200" />
                      </a>
                    : <Image src={qrSrc} alt="qr" width={200} height={200} className="rounded-lg bg-white p-1 shrink-0 h-auto w-auto max-h-20 md:max-h-24 border border-gray-200" />
                )}
                {footerItems.map((item, i) => {
                  const href = getHref(item);
                  const el = <Image key={i} src={item.image} alt={`footer-item-${i}`} width={200} height={200} className="rounded-lg h-auto w-auto max-h-20 md:max-h-24" />;
                  return href
                    ? <a key={i} href={href} target="_blank" rel="noreferrer" className="shrink-0">{el}</a>
                    : <span key={i} className="shrink-0">{el}</span>;
                })}
                {img1 && (link1
                  ? <a href={link1} target="_blank" rel="noreferrer" className="shrink-0"><Image src={img1} alt="img1" width={200} height={200} className="rounded-lg h-auto w-auto max-h-20 md:max-h-24" /></a>
                  : <Image src={img1} alt="img1" width={200} height={200} className="rounded-lg shrink-0 h-auto w-auto max-h-20 md:max-h-24" />
                )}
                {img2 && (link2
                  ? <a href={link2} target="_blank" rel="noreferrer" className="shrink-0"><Image src={img2} alt="img2" width={200} height={200} className="rounded-lg h-auto w-auto max-h-20 md:max-h-24" /></a>
                  : <Image src={img2} alt="img2" width={200} height={200} className="rounded-lg shrink-0 h-auto w-auto max-h-20 md:max-h-24" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-200 mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">
              © 2026 <span className="font-semibold text-gray-500">لمسة الثابتة</span> — جميع الحقوق محفوظة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/mada.svg" alt="mada" width={36} height={24} className="object-contain" style={{ height: "24px", width: "36px" }} />
            <Image src="/visa.webp" alt="visa" width={36} height={24} className="object-contain" style={{ height: "24px", width: "36px" }} />
            <Image src="/Apple-Pay-01.png" alt="apple pay" width={56} height={36} className="object-contain" style={{ height: "36px", width: "auto" }} />
            <Image src="/work.webp" alt="salla" width={36} height={24} className="object-contain" style={{ height: "24px", width: "auto" }} />
            <Image src="/commerce.webp" alt="salla" width={36} height={24} className="object-contain" style={{ height: "24px", width: "auto" }} />

          </div>
        </div>
      </div>
    </footer>
  );
}
