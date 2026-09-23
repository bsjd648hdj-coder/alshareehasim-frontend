"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";
import AddToCartPopup from "./AddToCartPopup";
import AuthProvider from "./auth/AuthProvider";

export default function ClientLayout({
  children,
  footer,
  whatsapp,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  whatsapp?: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isFileView = pathname.startsWith("/file-view");
  const isVerify = pathname === "/checkout/verify";
  const isMaintenance = pathname.startsWith("/maintenance");
  const isAuth = pathname.startsWith("/auth");
  const hideChrome = isAdmin || isFileView || isVerify || isMaintenance;

  return (
    <AuthProvider>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && !isAuth && footer}
      {!hideChrome && !isAuth && <WhatsappButton defaultWhatsapp={whatsapp} />}
      {!hideChrome && !isAuth && <AddToCartPopup />}
    </AuthProvider>
  );
}
