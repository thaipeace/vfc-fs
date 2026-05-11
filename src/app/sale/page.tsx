import Image from "next/image";

export default function SaleDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800">Dashboard Sale</h1>
      <p className="mt-1 text-sm text-neutral-500">Quản lý đơn hàng và nông dân của bạn</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Đơn hàng mới", value: "—", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Đang xử lý", value: "—", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Hoàn thành hôm nay", value: "—", color: "text-green-600", bg: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className={`card ${s.bg}`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="mt-1 text-sm text-neutral-600">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Ứng dụng</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          <a
            href="https://map.vfcnongdan.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 group"
          >
            <div className="aspect-square w-full relative rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 overflow-hidden transition group-hover:shadow-md group-active:scale-95">
              <Image
                src="/assets/images/map-icon.png"
                alt="Bản đồ"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium text-neutral-600 text-center">Bản đồ</span>
          </a>
        </div>
      </div>
    </div>
  );
}
