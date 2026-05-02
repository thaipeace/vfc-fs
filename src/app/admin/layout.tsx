import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-60 flex-col border-r bg-neutral-900 text-white sm:flex">
        <div className="border-b border-neutral-700 px-5 py-4 font-bold tracking-tight">
          🌿 VFC Admin
        </div>
        <nav className="flex flex-col gap-1 p-3 text-sm">
          {[
            { href: "/admin", icon: "📊", label: "Overview" },
            { href: "/admin/users", icon: "👥", label: "Người dùng" },
            { href: "/admin/products", icon: "🧪", label: "Sản phẩm" },
            { href: "/admin/orders", icon: "🛒", label: "Đơn hàng" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <div className="mt-auto pt-4 border-t border-neutral-700">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
