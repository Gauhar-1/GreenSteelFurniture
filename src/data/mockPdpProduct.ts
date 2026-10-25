import type { PdpProduct } from "@/types/pdp";

export const MOCK_PDP_PRODUCT: PdpProduct = {
  id: "prod-minimalist-3door",
  name: "The Minimalist 3-Door Wardrobe",
  tagline: "Architectural pure steel wardrobe with integrated vault locker.",
  slug: "minimalist-3-door-wardrobe",
  basePrice: 18499,
  mrp: 23999,
  dimensions: {
    heightInches: 78,
    widthInches: 36,
    depthInches: 21,
    note: "H: 78 in | W: 36 in | D: 21 in • Perfect for medium & master bedrooms",
  },
  sizes: [
    {
      id: "size-standard",
      label: "Standard 3-Door",
      specs: '36" W × 78" H',
      priceDelta: 0,
    },
    {
      id: "size-jumbo",
      label: "Jumbo 4-Door",
      specs: '48" W × 78" H',
      priceDelta: 4500,
    },
    {
      id: "size-compact",
      label: "Compact 2-Door",
      specs: '30" W × 72" H',
      priceDelta: -3000,
    },
  ],
  finishes: [
    {
      id: "finish-navy",
      name: "Matte Navy",
      hex: "#1E3A8A",
      outsideImage: "/bento-wardrobe-navy.png",
      insideImage: "/inside-wardrobe-locker.png",
    },
    {
      id: "finish-charcoal",
      name: "Charcoal",
      hex: "#27272A",
      outsideImage: "/color-terra-charcoal.png",
      insideImage: "/inside-wardrobe-locker.png",
    },
    {
      id: "finish-ivory",
      name: "Soft Ivory",
      hex: "#F5F2EB",
      outsideImage: "/color-sage-ivory.jpg",
      insideImage: "/inside-wardrobe-locker.png",
    },
    {
      id: "finish-bronze",
      name: "Warm Bronze",
      hex: "#9A3412",
      outsideImage: "/macro-matte-steel.png",
      insideImage: "/inside-wardrobe-locker.png",
    },
  ],
  galleryOutside: [
    {
      src: "/bento-wardrobe-navy.png",
      alt: "The Minimalist 3-Door Wardrobe in Matte Navy pure steel exterior",
    },
    {
      src: "/hero-bedroom.png",
      alt: "The Minimalist 3-Door Wardrobe in a sunlit architectural bedroom",
    },
    {
      src: "/macro-matte-steel.png",
      alt: "Macro detail of matte pure steel surface with clean beveled edges",
    },
  ],
  galleryInside: [
    {
      src: "/inside-wardrobe-locker.png",
      alt: "Interior storage view with precision shelves and integrated safe locker",
    },
    {
      src: "/macro-hinge.png",
      alt: "Precision internal steel hinges and heavy multi-bolt locking mechanism",
    },
    {
      src: "/bento-storage.png",
      alt: "Floor-to-ceiling organized wardrobe storage system",
    },
  ],
};
