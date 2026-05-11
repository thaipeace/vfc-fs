import Link from "next/link";
import Image from "next/image";

export default function SystemManagementPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-neutral-500 hover:text-neutral-800 transition">
          Admin
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-2xl font-bold text-neutral-800">Quản lý hệ thống</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        <Link
          href="/admin/system/users"
          className="flex flex-col items-center gap-2 group"
        >
          <div className="aspect-square w-full relative rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 overflow-hidden transition group-hover:shadow-md group-active:scale-95">
            <Image
              src="/assets/images/user-icon.png"
              alt="Quản lý người dùng"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs font-medium text-neutral-600 text-center">Quản lý người dùng</span>
        </Link>
      </div>
    </div>
  );
}
