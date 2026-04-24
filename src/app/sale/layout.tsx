import Link from "next/link";

export default function SaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col border-r bg-white sm:flex">
        <div className="border-b px-5 py-4 font-bold text-green-700">🌿 VFC Sale</div>
        <nav className="flex flex-col gap-1 p-3 text-sm">
          {[
            { href: "/sale", icon: "📊", label: "Dashboard" },
            { href: "/sale/orders", icon: "🛒", label: "Đơn hàng" },
            { href: "/sale/farmers", icon: "👨‍🌾", label: "Nông dân" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-600 hover:bg-green-50 hover:text-green-700 transition"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b bg-white px-6 py-3 text-sm font-medium text-neutral-600 sm:hidden">
          🌿 VFC Sale
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
