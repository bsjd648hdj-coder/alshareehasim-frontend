"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, FolderOpen, Landmark,
  MessageSquare, Grid2X2, Layers, ListTree, Package, ShoppingCart, X,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/users", label: "إدارة المستخدمين", icon: Users },
  { href: "/admin/company", label: "بيانات الشركة", icon: Building2 },
  { href: "/admin/files", label: "الملفات", icon: FolderOpen },

  // { href: "/admin/banks", label: "البنوك", icon: Landmark },
  { href: "/admin/reviews", label: "آراء العملاء", icon: MessageSquare },
  { href: "/admin/main-categories", label: "التصنيفات الرئيسية", icon: Grid2X2 },
  { href: "/admin/sub-categories", label: "التصنيفات الفرعية", icon: Layers },
  // { href: "/admin/category-items", label: "التصنيفات في الرئيسية", icon: ListTree },
  { href: "/admin/products", label: "الأصناف", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },

];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-white border-l border-gray-200 overflow-y-auto z-40 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
      dir="rtl"
    >
      <div className="flex items-center justify-between px-4 pt-3 md:hidden">
        <span className="text-sm font-semibold text-gray-500">القائمة</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
          <X size={18} />
        </button>
      </div>
      <nav className="p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
