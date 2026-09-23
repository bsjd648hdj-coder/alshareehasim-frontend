import Image from "next/image";

export default function MaintenancePage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-white px-4 sm:px-8 overflow-hidden relative"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-teal-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-emerald-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg">
        {/* SVG */}
        <div
          className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 mb-2"
          style={{ animation: "fadeIn 0.7s ease both" }}
        >
          <Image
            src="/maintenance-animation.svg"
            alt="صيانة"
            width={320}
            height={320}
            priority
            className="w-full h-full"
          />
        </div>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-5"
          style={{ animation: "fadeUp 0.5s ease 0.15s both" }}
        >
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse inline-block shrink-0" />
          جاري العمل على تحديث الموقع
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-snug"
          style={{ animation: "fadeUp 0.5s ease 0.25s both" }}
        >
          نجهّز لك تجربة أفضل
        </h1>

        {/* Divider */}
        <div
          className="w-12 h-1 bg-teal-400 rounded-full mb-5"
          style={{ animation: "fadeUp 0.5s ease 0.3s both" }}
        />

        {/* Description */}
        <div
          className="space-y-2"
          style={{ animation: "fadeUp 0.5s ease 0.35s both" }}
        >
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            موقع مسار الجوال يخضع حاليًا لبعض أعمال الصيانة والتحديث.
          </p>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            نعود إليكم قريبًا بخدمات أفضل وتجربة أسرع وأسهل.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
