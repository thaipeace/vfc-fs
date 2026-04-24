import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: {
    default: "VFC Farmer — Hỗ trợ nông dân thông minh",
    template: "%s | VFC Farmer",
  },
  description:
    "Nền tảng hỗ trợ nông dân: chuẩn đoán bệnh cây bằng AI, tư vấn sản phẩm và đặt hàng trực tiếp qua Zalo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
