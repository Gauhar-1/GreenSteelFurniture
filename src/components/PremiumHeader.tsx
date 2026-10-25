"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumHeaderProps {
  className?: string;
}

/**
 * PremiumHeader — Client Component
 * 
 * Editorial Sticky Navigation:
 * - Frosted glass effect with Warm Alabaster canvas tint
 * - Mobile: Hamburger menu, center luxury typography, language toggle & WhatsApp
 * - Desktop: Brand on left, animated hover links in center, action button & WhatsApp on right
 */
export function PremiumHeader({ className }: PremiumHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"ENG" | "HI">("ENG");

  // Completely hide header in admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ENG" ? "HI" : "ENG"));
  };

  const navLinks = [
    { label: language === "ENG" ? "Collections" : "कलेक्शन", href: "/categories" },
    { label: language === "ENG" ? "Design by Color" : "रंग चयन", href: "/#design-by-color" },
    { label: language === "ENG" ? "Lookbook" : "स्थान", href: "/#spaces" },
    { label: language === "ENG" ? "Admin Engine" : "व्यवस्थापक", href: "/admin/products/new" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-[#FAF8F5]/85 backdrop-blur-md border-b border-[#18181B]/5 transition-all",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* ================= DESKTOP LAYOUT (hidden md:flex) ================= */}
        <div className="hidden md:flex items-center justify-between h-20">
          {/* Left: Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Green Steel Home"
          >
            <span className="font-serif text-lg tracking-[0.25em] uppercase font-semibold text-[#18181B] group-hover:text-[#9A3412] transition-colors">
              GREEN STEEL
            </span>
          </Link>

          {/* Center: Clean Navigation Links with Underline Animation */}
          <nav aria-label="Main Navigation" className="flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-xs uppercase tracking-[0.18em] font-medium text-[#18181B]/80 hover:text-[#18181B] transition-colors py-1 group/link"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#18181B] transition-all duration-300 group-hover/link:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right: Language Toggle, WhatsApp Icon, and Book Store Visit Button */}
          <div className="flex items-center gap-4 lg:gap-5">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="text-xs font-semibold tracking-wider px-2.5 py-1 rounded-md text-[#18181B]/75 hover:text-[#18181B] border border-[#18181B]/15 hover:border-[#18181B]/35 transition-all cursor-pointer"
            >
              {language === "ENG" ? "ENG | हिं" : "हिं | ENG"}
            </button>

            {/* Subtle WhatsApp Icon */}
            <a
              href="https://wa.me/919876543210?text=Namaste!%20I%20would%20like%20to%20learn%20more%20about%20Green%20Steel%20Furniture."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact on WhatsApp"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#18181B]/80 hover:text-[#18181B] hover:bg-[#18181B]/5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {/* Dark Book Store Visit Button */}
            <Link
              href="/#visit-store"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase text-[#FAF8F5] bg-[#18181B] hover:bg-[#18181B]/90 shadow-xs active:scale-95 transition-all min-h-[38px]"
            >
              Book Store Visit
            </Link>
          </div>
        </div>

        {/* ================= MOBILE LAYOUT (flex md:hidden) ================= */}
        <div className="flex md:hidden items-center justify-between h-16">
          {/* Left: Clean, thin hamburger menu icon */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="w-10 h-10 -ml-2 flex items-center justify-center text-[#18181B] cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[1.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[1.5]" />
            )}
          </button>

          {/* Center: Brand name in crisp, tracking-widest style */}
          <Link href="/" className="text-center" aria-label="Green Steel Home">
            <span className="font-serif text-sm tracking-[0.25em] uppercase font-semibold text-[#18181B]">
              GREEN STEEL
            </span>
          </Link>

          {/* Right: Language toggle and subtle WhatsApp icon */}
          <div className="flex items-center gap-1.5 -mr-1">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="text-[11px] font-semibold px-2 py-1 rounded text-[#18181B]/80 border border-[#18181B]/15"
            >
              {language === "ENG" ? "हिं" : "ENG"}
            </button>

            <a
              href="https://wa.me/919876543210?text=Namaste!%20I%20would%20like%20to%20learn%20more%20about%20Green%20Steel%20Furniture."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact on WhatsApp"
              className="w-9 h-9 flex items-center justify-center text-[#18181B]"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ================= MOBILE SLIDE-DOWN DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#18181B]/10 bg-[#FAF8F5]/98 backdrop-blur-xl px-6 py-6 animate-fadeIn">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium tracking-wide text-[#18181B] py-2 border-b border-[#18181B]/5"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2">
              <Link
                href="/#visit-store"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] bg-[#18181B] shadow-sm"
              >
                Book Store Visit
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
