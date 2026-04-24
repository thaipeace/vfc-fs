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
    </div>
  );
}
