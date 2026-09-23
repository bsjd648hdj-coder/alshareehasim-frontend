"use client";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const load = () =>
      fetch("/api/admin/orders/count", { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => setOrdersCount(typeof d.count === "number" ? d.count : 0))
        .catch((err) => { if (err.name !== "AbortError") console.error(err); });

    load();
    const interval = setInterval(load, 60000);
    return () => { controller.abort(); clearInterval(interval); };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50" dir="rtl">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
          <Menu size={22} />
        </button>
        <Image
            src="/logo.webp"
            alt="Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-14 w-auto"
            priority
          />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/admin/orders")}
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <Bell size={20} />
          {ordersCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {ordersCount > 99 ? "99+" : ordersCount}
            </span>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-2 rounded-xl transition-colors text-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">تسجيل خروج</span>
        </button>
      </div>
    </nav>
  );
}
