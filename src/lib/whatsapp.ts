import { getSiteUrl } from "./siteUrl";
import type { CartItem } from "@/context/CartContext";
import type { ProductCatalogItem } from "@/services/ProductService";

export interface BuildCartWhatsAppUrlOptions {
  phone: string;
  items: CartItem[];
  customerName?: string;
  customerLocation?: string;
  brandName?: string;
}

export interface BuildSingleProductWhatsAppUrlOptions {
  phone: string;
  product: ProductCatalogItem;
  finish?: { id?: string; finish_name?: string };
  size?: {
    id?: string;
    size_label?: string;
    price?: number;
    dimensions?: {
      height?: number;
      width?: number;
      depth?: number;
      unit?: string;
    };
  };
  categorySlug?: string;
  brandName?: string;
}

/**
 * Constructs an absolute canonical URL to a specific product.
 * Handles both hierarchical (/categories/[cat]/product/[slug]) and direct (/product/[slug]) routes.
 * Preserves clean normal links without variant query parameters for WhatsApp messages.
 */
export function buildProductUrl(
  categorySlug?: string,
  productSlug?: string,
  _finishId?: string,
  _sizeId?: string
): string {
  const siteUrl = getSiteUrl();
  const slug = (productSlug || "steel-furniture").trim();

  // If categorySlug exists and is valid, use canonical hierarchical route; otherwise fallback to direct route
  return categorySlug && categorySlug.trim() && categorySlug !== "all"
    ? `${siteUrl}/categories/${encodeURIComponent(categorySlug.trim())}/product/${encodeURIComponent(slug)}`
    : `${siteUrl}/product/${encodeURIComponent(slug)}`;
}

/**
 * Builds a formatted WhatsApp order message and direct wa.me link for the entire shopping cart.
 * Guarantees every item contains a direct, full https:// product link on its own line.
 */
export function buildCartWhatsAppUrl({
  phone,
  items,
  customerName,
  customerLocation,
  brandName = "Green Steel Furniture",
}: BuildCartWhatsAppUrlOptions): string {
  const cleanPhone = (phone || "919876543210").replace(/[^0-9]/g, "");

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const estimatedTotal = items.reduce(
    (acc, curr) => acc + curr.unitPrice * curr.quantity,
    0
  );

  let msg = `*${brandName} — Order Inquiry* 🪑\n`;
  msg += `Namaste! I would like to inquire about / place an order for the following architectural steel items:\n\n`;

  items.forEach((item, index) => {
    const subtotal = item.unitPrice * item.quantity;
    const itemUrl = buildProductUrl(
      item.categorySlug,
      item.productSlug,
      item.finishId,
      item.sizeId
    );

    msg += `*${index + 1}. ${item.title}*\n`;
    msg += `• Finish: ${item.finishName} | Size: ${item.sizeLabel} (${item.dimensionsText})\n`;
    msg += `• Qty: ${item.quantity} × ₹${item.unitPrice.toLocaleString("en-IN")} = ₹${subtotal.toLocaleString("en-IN")}\n`;
    msg += `• Link: ${itemUrl}\n\n`;
  });

  msg += `--------------------------------\n`;
  msg += `📦 *Total Items:* ${totalItems}\n`;
  msg += `💰 *Estimated Total:* ₹${estimatedTotal.toLocaleString("en-IN")}\n\n`;

  if (customerName?.trim() || customerLocation?.trim()) {
    msg += `*Customer Details:*\n`;
    if (customerName?.trim()) msg += `• Name: ${customerName.trim()}\n`;
    if (customerLocation?.trim())
      msg += `• Delivery City / Location: ${customerLocation.trim()}\n`;
    msg += `\n`;
  }

  msg += `Please confirm model availability, delivery timeline, and invoice details. Thank you!\n\n`;
  msg += `_Explore more pure steel furniture:_ ${getSiteUrl()}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

/**
 * Builds a formatted WhatsApp inquiry link for a single product with active finish & size.
 */
export function buildSingleProductWhatsAppUrl({
  phone,
  product,
  finish,
  size,
  categorySlug,
  brandName = "Green Steel Furniture",
}: BuildSingleProductWhatsAppUrlOptions): string {
  const cleanPhone = (phone || "919876543210").replace(/[^0-9]/g, "");
  const catSlug = categorySlug || product.category?.slug || "bedroom";
  const currentPrice = Number(size?.price || product.base_price);

  const dimensionsStr = size?.dimensions
    ? `${size.dimensions.height || 78}" × ${size.dimensions.width || 36}" × ${
        size.dimensions.depth || 22
      }"`
    : "Standard Dimensions";

  const productUrl = buildProductUrl(
    catSlug,
    product.slug,
    finish?.id,
    size?.id
  );

  let msg = `*${brandName} — Product Inquiry* 🪑\n`;
  msg += `Namaste! I am interested in the *${product.title_en}* from your digital showroom:\n\n`;
  msg += `• Finish: ${finish?.finish_name || "Standard Architectural Finish"}\n`;
  msg += `• Size: ${size?.size_label || "Standard"} (${dimensionsStr})\n`;
  msg += `• Price: ₹${currentPrice.toLocaleString("en-IN")}\n`;
  msg += `• Link: ${productUrl}\n\n`;
  msg += `Please share availability, delivery schedule, and customization options. Thank you!\n\n`;
  msg += `_Explore showroom collections:_ ${getSiteUrl()}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
