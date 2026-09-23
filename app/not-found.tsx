import type { Metadata } from "next";
import NotFoundClient from "./NotFoundClient";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة | 404",
  description: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundClient />;
}
