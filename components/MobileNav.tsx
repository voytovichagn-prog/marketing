"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Дашборд", icon: "📊" },
  { href: "/content", label: "Контент", icon: "🗓" },
  { href: "/ai", label: "AI", icon: "✨" },
  { href: "/settings", label: "Настройки", icon: "⚙️" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-foreground/10 bg-background md:hidden">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-2 text-[11px] ${
              active ? "text-foreground" : "text-foreground/60"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
