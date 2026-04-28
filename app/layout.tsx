import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketing",
  description: "Marketing app — bootstrapped with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
