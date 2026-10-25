"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  Package,
  FolderTree,
  Sparkles,
  Plus,
  ExternalLink,
  Menu,
  X,
  Layers,
  ChevronRight,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdmin } from "@/actions/authActions";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on admin login page, render child component directly without studio chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Business priority order (1 to 5)
  const navItems = [
    {
      title: "Dashboard",
      shortTitle: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Orders & Bookings",
      shortTitle: "Orders",
      href: "/admin/orders",
      icon: CalendarCheck2,
    },
    {
      title: "Furniture Catalog",
      shortTitle: "Furniture",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Categories & Rooms",
      shortTitle: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      title: "Storefront Controller",
      shortTitle: "Storefront",
      href: "/admin/storefront",
      icon: Sparkles,
    },
  ];

  const isCurrent = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    if (pathname !== href && typeof window !== "undefined") {
      window.dispatchEvent(new Event("route-transition-start"));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] flex flex-col md:flex-row antialiased">
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (hidden on mobile, visible md:flex)       */}
      {/* ============================================================ */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-[#18181B]/10 bg-white shrink-0 sticky top-0 h-screen justify-between z-30">
        <div>
          {/* Brand & Studio Title */}
          <div className="p-6 border-b border-[#18181B]/5">
            <Link
              href="/"
              target="_blank"
              className="group flex items-center justify-between text-xs text-[#71717A] hover:text-[#9A3412] transition-colors mb-2"
            >
              <span className="font-mono uppercase tracking-wider text-[11px]">
                Green Steel Studio
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </Link>
            <h1 className="text-xl font-serif font-bold tracking-tight text-[#18181B]">
              Admin Studio
            </h1>
            <p className="text-xs text-[#71717A] mt-0.5">
              Production Operations & Lookbook
            </p>
          </div>

          {/* Quick Create Action Button */}
          <div className="p-4 border-b border-[#18181B]/5">
            <Link
              href="/admin/products/new"
              onClick={() => handleNavClick("/admin/products/new")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Furniture</span>
            </Link>
          </div>

          {/* Main 5 Navigation Tabs in Business Priority */}
          <nav className="p-3 space-y-1" aria-label="Admin Navigation Tabs">
            {navItems.map((item, index) => {
              const active = isCurrent(item.href, item.exact);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
                    active
                      ? "bg-[#18181B] text-[#FAF8F5] shadow-xs"
                      : "text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                        active
                          ? "bg-white/10 text-white"
                          : "bg-[#18181B]/5 text-[#71717A] group-hover:text-[#18181B]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono",
                      active ? "text-white/60" : "text-[#71717A]/50"
                    )}
                  >
                    0{index + 1}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Studio Footer Info & Sign Out */}
        <div className="p-4 border-t border-[#18181B]/5 text-xs text-[#71717A] bg-[#FAF8F5]/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#18181B]">Supabase Live Engine</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-semibold text-[#71717A] hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CONTENT AREA                                         */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Mobile Header Bar with Hamburger Drawer Trigger */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#18181B]/10 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-[#18181B]/15 text-[#18181B] hover:bg-[#FAF8F5] cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#18181B]">
                Admin Studio
              </h2>
              <p className="text-[10px] text-[#71717A]">Green Steel Furniture</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/products/new"
              className="p-1.5 rounded-lg bg-[#18181B] text-[#FAF8F5] text-xs font-semibold flex items-center gap-1 px-2.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="p-1.5 rounded-lg border border-[#18181B]/15 text-[#71717A] hover:text-[#18181B]"
              title="Storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Injected Page Content */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
          {children}
        </div>
      </main>

      {/* ============================================================ */}
      {/* 3. MOBILE HAMBURGER SLIDING DRAWER / SHEET                   */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#18181B]/10">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#18181B]">
                    Admin Studio
                  </h3>
                  <p className="text-xs text-[#71717A]">Navigation Menu</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-[#71717A] hover:bg-[#FAF8F5]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="py-4 space-y-1.5">
                {navItems.map((item) => {
                  const active = isCurrent(item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        handleNavClick(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all",
                        active
                          ? "bg-[#18181B] text-white"
                          : "text-[#71717A] hover:bg-[#FAF8F5] hover:text-[#18181B]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#18181B]/10 space-y-2">
              <Link
                href="/admin/products/new"
                onClick={() => {
                  handleNavClick("/admin/products/new");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#9A3412] text-white text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>New Furniture</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#18181B]/15 text-xs font-semibold text-[#18181B]"
              >
                <span>Live Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <form action={logoutAdmin} className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 bg-red-50/50 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MOBILE STICKY BOTTOM NAV BAR (Thumb-Friendly, 5 Items)    */}
      {/* ============================================================ */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#18181B]/10 px-1 py-1.5 flex items-center justify-around shadow-lg"
      >
        {navItems.map((item) => {
          const active = isCurrent(item.href, item.exact);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] transition-all flex-1 min-w-0",
                active
                  ? "text-[#18181B] font-bold"
                  : "text-[#71717A] hover:text-[#18181B]"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center mb-0.5 transition-all",
                  active
                    ? "bg-[#18181B] text-white shadow-2xs"
                    : "bg-[#18181B]/5 text-[#71717A]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="truncate text-[10px] text-center max-w-[60px]">
                {item.shortTitle}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
