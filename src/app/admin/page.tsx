export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Tổng quan hệ thống VFC Farmer</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Tổng nông dân", icon: "👨‍🌾", color: "text-green-600", bg: "bg-green-50" },
          { label: "Tổng đơn hàng", icon: "🛒", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Chuẩn đoán AI", icon: "📷", color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Doanh thu", icon: "💰", color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={`card ${s.bg}`}>
            <div className={`text-3xl ${s.color}`}>{s.icon}</div>
            <div className="mt-2 text-2xl font-bold text-neutral-700">—</div>
            <div className="mt-0.5 text-xs text-neutral-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
