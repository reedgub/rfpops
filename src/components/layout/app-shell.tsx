"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Gauge,
  Library,
  Settings,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/score", label: "Score RFP", icon: Target },
  { href: "/pipeline", label: "Pipeline", icon: BriefcaseBusiness },
  { href: "/profile", label: "Profile", icon: Building2 },
  { href: "/past-performance", label: "Past Performance", icon: BookOpen },
  { href: "/library", label: "Library", icon: Library },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-surface/95 p-4 lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gold/40 bg-gold/12 font-mono text-sm font-bold text-gold">
            RFP
          </div>
          <div>
            <div className="font-semibold">RFPOps</div>
            <div className="text-xs text-muted">Bid-decision intelligence</div>
          </div>
        </Link>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition hover:bg-panel hover:text-foreground",
                  active && "border border-gold/25 bg-gold/10 text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-background/86 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <div>
              <div className="text-xs font-medium text-muted">Northstar Federal Systems</div>
              <div className="text-sm text-slate-300">Demo workspace runs without Supabase or an AI key</div>
            </div>
            <Link
              href="/score"
              className="rounded-md border border-gold/40 bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-[#d7b969]"
            >
              Score an RFP
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface lg:hidden">
        {nav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-col items-center gap-1 px-2 py-2 text-[11px] text-muted", active && "text-gold")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
