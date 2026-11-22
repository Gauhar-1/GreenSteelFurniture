"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Drawer } from "vaul";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
  ArrowRight,
  MapPin,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { buildCartWhatsAppUrl } from "@/lib/whatsapp";
import { TactileButton } from "@/components/ui/TactileButton";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    totalItems,
    estimatedTotal,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  // Client-only optional metadata for WhatsApp message
  const [customerName, setCustomerName] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const { whatsappPhone, businessPhone, settings } = useSiteSettings();

  const handleWhatsAppSend = () => {
    if (items.length === 0) return;
    const url = buildCartWhatsAppUrl({
      phone: whatsappPhone,
      items,
      customerName,
      customerLocation,
      brandName: settings?.brand_name || "Green Steel Furniture",
    });
    window.open(url, "_blank");
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCart();
      }}
      direction="right"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity" />

        <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#FAF8F5] text-[#18181B] shadow-2xl outline-none border-l border-[#18181B]/10">
          <Drawer.Title className="sr-only">Your Furniture Cart</Drawer.Title>
          <Drawer.Description className="sr-only">
            Review selected steel furniture items and send order via WhatsApp or phone.
          </Drawer.Description>

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#18181B]/10 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-[#18181B] leading-tight">
                  Furniture Cart
                </h2>
                <p className="text-[11px] text-[#71717A]">
                  {totalItems} {totalItems === 1 ? "piece" : "pieces"} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-[#71717A] hover:text-red-700 transition-colors px-2 py-1 cursor-pointer"
                  title="Clear all items from cart"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={closeCart}
                className="w-8 h-8 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#18181B]/5 text-[#71717A] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#18181B]">
                  Your Cart is Empty
                </h3>
                <p className="text-xs text-[#71717A] max-w-xs mx-auto">
                  Explore our pure steel architectural furniture collection to add bespoke pieces to your inquiry.
                </p>
              </div>
              <Link
                href="/categories"
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* Items List */
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartKey}
                  className="bg-white rounded-2xl p-3.5 border border-[#18181B]/10 shadow-2xs space-y-2.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#18181B]/10">
                      <Image
                        src={item.thumbnailUrl || "/hero-bedroom.png"}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/categories/${item.categorySlug}/product/${item.productSlug}`}
                        onClick={closeCart}
                        className="text-xs font-bold text-[#18181B] hover:text-[#9A3412] transition-colors line-clamp-1 block"
                      >
                        {item.title}
                      </Link>

                      {/* Swatch & Finish Name */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/15 inline-block shrink-0 shadow-2xs"
                          style={{ backgroundColor: item.finishHex }}
                        />
                        <span className="text-[11px] text-[#71717A] truncate">
                          {item.finishName}
                        </span>
                      </div>

                      {/* Size & Dimensions */}
                      <p className="text-[10px] text-[#71717A] mt-0.5 font-mono truncate">
                        {item.sizeLabel} • {item.dimensionsText}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.cartKey)}
                      className="p-1 rounded-lg text-[#71717A] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Line Subtotal */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#18181B]/5 text-xs">
                    <div className="flex items-center gap-2 bg-[#FAF8F5] rounded-xl border border-[#18181B]/10 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg text-[#18181B] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#18181B] px-1 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg text-[#18181B] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[#18181B] font-mono">
                        ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-[#71717A] font-mono">
                          ₹{item.unitPrice.toLocaleString("en-IN")} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Optional Quick Details for Sales Team Context */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#18181B]/10 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A3412] block">
                  Delivery Details (Optional for WhatsApp)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full pl-7 pr-2.5 py-1.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 text-xs text-[#18181B] focus:border-[#9A3412] focus:outline-none placeholder:text-[#71717A]/60"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                      type="text"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      placeholder="City / Pincode"
                      className="w-full pl-7 pr-2.5 py-1.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 text-xs text-[#18181B] focus:border-[#9A3412] focus:outline-none placeholder:text-[#71717A]/60"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drawer Footer with Actions & iOS Safe Area */}
          {items.length > 0 && (
            <div className="border-t border-[#18181B]/10 bg-white p-5 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {/* Estimated Total & Guarantees */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#71717A] uppercase font-semibold tracking-wider">
                    Estimated Total
                  </span>
                  <p className="text-[10px] text-[#71717A]">
                    Free delivery • Pay balance on delivery
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-[#18181B]">
                    ₹{estimatedTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Primary CTA: Send Order on WhatsApp */}
              <TactileButton
                variant="primary"
                onClick={handleWhatsAppSend}
                className="w-full min-h-[48px] bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center justify-center gap-2 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>Send Order on WhatsApp</span>
              </TactileButton>

              {/* Secondary CTA: Call Directly */}
              <a
                href={`tel:${businessPhone.replace(/[^0-9+]/g, "")}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider border border-[#18181B]/15 bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 text-[#18181B] transition-colors cursor-pointer select-none touch-manipulation active:scale-[0.99]"
              >
                <Phone className="w-3.5 h-3.5 text-[#9A3412] shrink-0" />
                <span>Call to Inquire Directly</span>
              </a>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-[#71717A]">
                <div className="flex items-center gap-1.5 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9A3412]" />
                  <span>15-Year Rust Warranty</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <Truck className="w-3.5 h-3.5 text-[#18181B]" />
                  <span>Doorstep Inspection</span>
                </div>
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

