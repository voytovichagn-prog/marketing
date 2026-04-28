"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Дашборд", icon: "📊" },
  { href: "/content", label: "Контент-план", icon: "🗓" },
  { href: "/ai", label: "AI-ассистент", icon: "✨" },
  { href: "/settings", label: "Настройки", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-foreground/10 bg-foreground/[0.02] md:flex md:flex-col">
      <div className="flex h-14 items-center px-5 text-sm font-semibold tracking-tight">
        Marketing
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2 text-sm">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                active
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-3 text-xs text-foreground/40">v0.1 · MVP</div>
    </aside>
  );
}
