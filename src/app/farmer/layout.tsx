import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
          <Link href="/farmer" className="flex items-center gap-2 font-bold text-green-700">
            🌿 VFC Farmer
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600">
            <Link href="/farmer/diagnose" className="hover:text-green-600">Chuẩn đoán</Link>
            <Link href="/farmer/products" className="hover:text-green-600">Sản phẩm</Link>
            <Link href="/farmer/orders" className="hover:text-green-600">Đơn hàng</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4">
        {children}
      </main>

      {/* Zalo Floating Button */}
      <a 
        href="https://zalo.me/your_oa_id" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition hover:scale-110 active:scale-95 sm:bottom-8 sm:right-8"
      >
        <span className="text-white font-bold text-xs">Zalo</span>
      </a>

      {/* Bottom nav (mobile) */}
      <nav className="sticky bottom-0 border-t bg-white sm:hidden">
        <div className="grid grid-cols-3 divide-x text-center text-xs font-medium text-neutral-500">
          {[
            { href: "/farmer", icon: "🏠", label: "Trang chủ" },
            { href: "/farmer/diagnose", icon: "📷", label: "Chuẩn đoán" },
            { href: "/farmer/orders", icon: "🛒", label: "Đơn hàng" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-2 hover:text-green-600">
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
