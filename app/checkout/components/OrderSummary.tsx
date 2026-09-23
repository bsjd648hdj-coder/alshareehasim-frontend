// import { Truck, ShieldCheck, Zap } from "lucide-react";
// import { IoWalletOutline } from "react-icons/io5";

// const fmt = (n: number) => n.toLocaleString("en-US");

// interface OrderSummaryProps {
//   total: number;
// }

// export default function OrderSummary({ total }: OrderSummaryProps) {
//   return (
//     <div className="space-y-4">
//       {/* Summary Box */}
//       <div className="rounded-2xl border border-[#80C78D]/40 overflow-hidden" style={{ background: "#ffffff" }}>
//         <div className="px-5 py-4 border-b border-[#80C78D]/30" style={{ background: "#DCEFE8" }}>
//           <h3 className="text-sm font-black text-[#1A2E44]">ملخص الطلب</h3>
//         </div>
//         <div className="p-5 space-y-3">
//           <div className="flex justify-between items-center text-xs sm:text-sm">
//             <span className="text-[#1A2E44]/50">مجموع السلة</span>
//             <span className="font-bold text-[#1A2E44]">{fmt(total)} <img src="/money-icon.webp" alt="ر.س" className="inline w-7 h-7 object-contain align-middle" /></span>
//           </div>
//           <div className="flex justify-between items-center text-xs sm:text-sm">
//             <span className="text-[#1A2E44]/50 flex items-center gap-1.5"><Truck size={12} /> التوصيل</span>
//             <span className="font-bold text-[#47A557]">مجاني ✓</span>
//           </div>
//           <div className="border-t border-dashed border-[#80C78D]/40 pt-3 flex justify-between items-center">
//             <span className="text-sm font-bold text-[#1A2E44]/60">الإجمالي</span>
//             <span className="text-2xl font-black text-[#47A557]">{fmt(total)} <span className="text-xs font-medium text-[#1A2E44]/40"><img src="/money-icon.webp" alt="ر.س" className="inline w-7 h-7 object-contain align-middle" /></span></span>
//           </div>
//         </div>

//         {/* Pay Banner */}
//         <div className="mx-4 mb-4 rounded-2xl p-4 relative overflow-hidden border border-[#80C78D]/40" style={{ background: "linear-gradient(135deg, #DCEFE8 0%, #c8e8d4 100%)" }}>
//           <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle, #47A557 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
//           <div className="relative flex justify-between items-center">
//             <div className="flex items-center gap-1.5">
//               <IoWalletOutline size={15} className="text-[#47A557]" />
//               <span className="text-[#1A2E44] font-black text-sm">المبلغ الإجمالي</span>
//             </div>
//             <div>
//               <span className="text-[#47A557] text-2xl font-black">{fmt(total)}</span>
//               <span className="text-[#1A2E44]/40 text-xs font-medium mr-1"><img src="/money-icon.webp" alt="ر.س" className="inline w-7 h-7 object-contain align-middle" /></span>
//             </div>
//           </div>
//           <p className="text-[#1A2E44]/50 text-[11px] mt-2 relative">دفع كامل بالبطاقة الائتمانية</p>
//         </div>
//       </div>

//       {/* Trust Badges */}
//       <div className="rounded-2xl border border-[#80C78D]/40 p-4 grid grid-cols-3 gap-2" style={{ background: "#ffffff" }}>
//         <TrustBadge icon={<ShieldCheck size={14} />} text="ضمان سنتين" />
//         <TrustBadge icon={<Zap size={14} />} text="توصيل مجاني" />
//         <TrustBadge icon={<Truck size={14} />} text="شحن سريع" />
//       </div>
//     </div>
//   );
// }

// function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
//   return (
//     <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#80C78D]/40 px-2 py-3" style={{ background: "#DCEFE8" }}>
//       <span className="text-[#47A557]">{icon}</span>
//       <span className="text-[10px] font-bold text-[#1A2E44]/70 text-center">{text}</span>
//     </div>
//   );
// }
