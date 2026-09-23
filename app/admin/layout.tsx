"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";

function VerifyingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse" dir="rtl">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50" />
      {/* Sidebar skeleton */}
      <div className="hidden md:block fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-white border-l border-gray-200" />
      {/* Content skeleton */}
      <div className="md:mr-64 pt-20 min-h-screen">
        <div className="px-3 pb-4 sm:px-5 md:px-6 space-y-4 pt-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-white rounded-xl shadow" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLogin = pathname === "/admin/login";
  const isPrint =
    pathname.endsWith("/print") ||
    pathname.endsWith("/receipt") ||
    pathname.endsWith("/invoice") ||
    pathname.endsWith("/contract") ||
    pathname.endsWith("/cancellation");
  const [verified, setVerified] = useState(isLogin);

  useEffect(() => {
    if (isLogin) return;
    const controller = new AbortController();
    fetch("/api/admin/verify", { credentials: "include", signal: controller.signal })
      .then((r) => {
        if (!r.ok) router.replace("/admin/login");
        else setVerified(true);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        router.replace("/admin/login");
      });
    return () => controller.abort();
  // Fix 12: إزالة pathname من dependencies — التحقق يحدث مرة واحدة عند mount فقط
  // انتهاء الـ session يُكتشف عبر HTTP 401 من أي admin API call لاحق
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  if (isLogin || isPrint) return <>{children}</>;

  // Show skeleton instead of blank screen while verifying
  if (!verified) return <VerifyingSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: "14px", padding: "12px 16px", maxWidth: "320px", fontWeight: "600" },
        }}
      />
      <main className="md:mr-64 pt-20 min-h-screen overflow-x-hidden">
        <div className="px-3 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6">{children}</div>
      </main>
    </div>
  );
}
