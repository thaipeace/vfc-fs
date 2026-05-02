"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout} 
      className="text-red-600 hover:text-red-700 font-medium text-sm ml-4"
    >
      Đăng xuất
    </button>
  );
}
