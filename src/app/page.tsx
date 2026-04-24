import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
          🌱 Nông nghiệp thông minh
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          VFC Farmer
        </h1>
        <p className="mt-3 max-w-xl text-neutral-500 sm:text-lg">
          Chuẩn đoán bệnh cây bằng AI, tư vấn sản phẩm và đặt hàng nhanh chóng qua Zalo
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/login" className="btn-primary text-base px-7 py-3">
          Đăng nhập bằng Zalo
        </Link>
        <Link href="/products" className="btn-outline text-base px-7 py-3">
          Xem sản phẩm
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: "📷", title: "Chuẩn đoán AI", desc: "Chụp ảnh cây, AI phân tích bệnh tức thì" },
          { icon: "🛒", title: "Đặt hàng nhanh", desc: "Chọn sản phẩm phù hợp, gửi sale xử lý" },
          { icon: "💬", title: "Chat với Sale", desc: "Tư vấn trực tiếp qua Zalo, hỗ trợ 24/7" },
        ].map((f) => (
          <div key={f.title} className="card text-center">
            <div className="mb-2 text-3xl">{f.icon}</div>
            <div className="font-semibold text-neutral-800">{f.title}</div>
            <div className="mt-1 text-sm text-neutral-500">{f.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
