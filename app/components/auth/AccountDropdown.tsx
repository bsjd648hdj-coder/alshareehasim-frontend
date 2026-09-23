"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ShoppingBag, Settings } from "lucide-react";
import { useAuthStore, AuthUser } from "../../store/authStore";

interface AccountDropdownProps {
  user: AuthUser;
  onClose: () => void;
}

export default function AccountDropdown({ user, onClose }: AccountDropdownProps) {
  const { logout } = useAuthStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const displayName = user.firstName
    ? `مرحبًا، ${user.firstName}`
    : "حسابي";

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div
      ref={ref}
      dir="rtl"
      className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-sm font-bold text-[#0f2744] truncate">{displayName}</p>
        <p className="text-xs text-gray-400 truncate" dir="ltr">{user.email}</p>
      </div>

      {/* Links */}
      <div className="py-1">
        <Link
          href="/account"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0f2744] transition"
        >
          <User className="w-4 h-4 text-gray-400" />
          بيانات الحساب
        </Link>
        <Link
          href="/account/orders"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0f2744] transition"
        >
          <ShoppingBag className="w-4 h-4 text-gray-400" />
          طلباتي
        </Link>
      </div>

      <div className="border-t border-gray-100 py-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
