"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFoundClient() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="text-[120px] font-extrabold leading-none select-none"
        style={{ color: "#7c3aed" }}
      >
        404
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mt-4 flex flex-col items-center gap-3"
      >
        <h1 className="text-2xl font-bold text-gray-800">الصفحة غير موجودة</h1>
        <p className="text-gray-500 max-w-sm">
          يبدو أن الصفحة التي تبحث عنها لا توجد أو تم نقلها.
        </p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="mt-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-full text-white font-semibold text-sm shadow-lg"
            style={{ background: "#7c3aed" }}
          >
            العودة للرئيسية
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute top-20 right-16 w-16 h-16 rounded-full opacity-20"
        style={{ background: "#7c3aed" }}
      />
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute bottom-24 left-16 w-10 h-10 rounded-full opacity-15"
        style={{ background: "#7c3aed" }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute bottom-40 right-32 w-6 h-6 rounded-full opacity-25"
        style={{ background: "#7c3aed" }}
      />
    </main>
  );
}
