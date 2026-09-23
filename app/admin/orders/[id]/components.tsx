import React from "react";

export function Section({ icon, iconBg, title, children }: {
  icon: React.ReactNode; iconBg: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-base font-bold text-gray-700 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2.5">
        <span className={`${iconBg} text-white p-1.5 rounded-lg flex items-center justify-center shrink-0`}>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export function InfoRow({ label, value, dir }: { label: string; value?: string; dir?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-800 overflow-x-auto whitespace-nowrap" dir={dir}>{value || "—"}</p>
    </div>
  );
}


export function FinField({ label, value, onChange, integer }: {
  label: string; value: number; onChange: (v: number) => void; integer?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(integer ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
        />
        {!integer && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">ر.س</span>
        )}
      </div>
    </div>
  );
}
