import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Marketing",
  description: "Личное приложение маркетолога — аналитика, контент, AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
