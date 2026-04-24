import Link from "next/link";

export default function FarmerHomePage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="card bg-gradient-to-r from-green-600 to-emerald-500 text-white">
        <h2 className="text-lg font-bold">Xin chào, Nông dân! 👋</h2>
        <p className="mt-1 text-sm text-green-100">Cây của bạn hôm nay thế nào?</p>
        <Link href="/farmer/diagnose" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition">
          📷 Chuẩn đoán ngay
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/farmer/diagnose" className="card flex flex-col items-center gap-2 text-center hover:ring-green-300 transition-all">
          <span className="text-4xl">📷</span>
          <span className="font-semibold text-sm">Chuẩn đoán bệnh cây</span>
          <span className="text-xs text-neutral-500">AI phân tích tức thì</span>
        </Link>
        <Link href="/farmer/orders" className="card flex flex-col items-center gap-2 text-center hover:ring-green-300 transition-all">
          <span className="text-4xl">🛒</span>
          <span className="font-semibold text-sm">Đơn hàng của tôi</span>
          <span className="text-xs text-neutral-500">Theo dõi tình trạng</span>
        </Link>
      </div>
    </div>
  );
}
