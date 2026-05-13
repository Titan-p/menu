import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家庭菜单",
  description: "家庭共享菜谱与每日做饭灵感工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
