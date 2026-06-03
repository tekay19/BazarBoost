"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/server/auth-actions";
import {
  Menu, LogOut, X,
  LayoutDashboard, Building2, LayoutTemplate, BarChart3,
  Package, FolderTree, QrCode, Settings,
} from "lucide-react";

const ICONS = {
  dashboard: LayoutDashboard,
  building: Building2,
  template: LayoutTemplate,
  chart: BarChart3,
  package: Package,
  folder: FolderTree,
  qr: QrCode,
  settings: Settings,
} as const;

export type IconKey = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: IconKey;
}

export function Shell({
  title,
  items,
  user,
  banner,
  children,
}: {
  title: string;
  items: NavItem[];
  user?: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/business/dashboard" && pathname.startsWith(item.href));
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* sidebar desktop */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r bg-white">
        <div className="px-5 h-16 flex items-center font-bold text-lg border-b">{title}</div>
        {nav}
        <form action={logout} className="p-3 border-t">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            <LogOut className="h-4 w-4" /> Çıkış
          </button>
        </form>
      </aside>

      {/* mobile header */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b bg-white">
        <button onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
        <span className="font-bold">{title}</span>
        <form action={logout}><button><LogOut className="h-5 w-5" /></button></form>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-white flex flex-col">
            <div className="px-5 h-14 flex items-center justify-between border-b font-bold">
              {title}
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {nav}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      <main className="md:pl-60">
        {banner}
        <div className="container py-6 max-w-6xl">
          {user && <p className="text-xs text-slate-400 mb-4">Giriş: {user}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
