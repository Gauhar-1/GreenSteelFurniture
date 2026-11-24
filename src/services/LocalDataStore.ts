import fs from "fs";
import path from "path";
import type { Category, SiteSettings, ClientReview } from "@/types/database";
import type { ProductCatalogItem } from "@/services/ProductService";
import type { BookingWithDetails } from "@/services/BookingService";
import type { ProductWizardFormData } from "@/types/database";

interface LocalStoreData {
  categories: Category[];
  products: ProductCatalogItem[];
  bookings: BookingWithDetails[];
  storefront: Record<string, unknown>;
  site_settings?: SiteSettings;
  reviews?: ClientReview[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "admin-store.json");

const DEFAULT_SETTINGS: SiteSettings = {
  id: "global",
  brand_name: "Green Steel Furniture",
  footer_tagline: "Pure heavy-gauge steel furniture engineered for generations. Handcrafted in our Gorakhpur industrial studio.",
  phone_primary: "+91 98765 43210",
  whatsapp_number: "919876543210",
  email: "concierge@greensteelfurniture.com",
  showroom_address: "NH-28 Industrial Corridor, Showroom & Design Studio, Gorakhpur, UP 273001",
  factory_address: "Plot 14-16, Phase II Industrial Estate, Gorakhpur, UP 273001",
  google_maps_url: "https://maps.google.com/?q=Gorakhpur+Industrial+Area",
  operating_hours: "Mon–Sat, 9:30 AM – 8:00 PM",
  service_districts: [
    "Gorakhpur",
    "Lucknow",
    "Varanasi",
    "Ayodhya",
    "Basti",
    "Deoria",
    "Kushinagar",
    "Azamgarh",
    "Mau",
    "Ballia",
  ],
  social_links: {
    instagram: "https://instagram.com/greensteelfurniture",
    facebook: "https://facebook.com/greensteelfurniture",
    youtube: "",
  },
};

const EMPTY_STORE: LocalStoreData = {
  categories: [],
  products: [],
  bookings: [],
  storefront: {},
  site_settings: DEFAULT_SETTINGS,
  reviews: [],
};

export class LocalDataStore {
  private static ensureStore(): LocalStoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (!fs.existsSync(STORE_FILE)) {
        fs.writeFileSync(STORE_FILE, JSON.stringify(EMPTY_STORE, null, 2), "utf-8");
        return { categories: [], products: [], bookings: [], storefront: {} };
      }

      const content = fs.readFileSync(STORE_FILE, "utf-8").trim();
      if (!content) {
        fs.writeFileSync(STORE_FILE, JSON.stringify(EMPTY_STORE, null, 2), "utf-8");
        return { categories: [], products: [], bookings: [], storefront: {} };
      }
      const parsed = JSON.parse(content) as LocalStoreData;
      return {
        categories: parsed.categories || [],
        products: parsed.products || [],
        bookings: parsed.bookings || [],
        storefront: parsed.storefront || {},
        site_settings: parsed.site_settings || DEFAULT_SETTINGS,
        reviews: parsed.reviews || [],
      };
    } catch (err) {
      console.error("LocalDataStore read error, using empty store:", err);
      return {
        categories: [],
        products: [],
        bookings: [],
        storefront: {},
        site_settings: DEFAULT_SETTINGS,
        reviews: [],
      };
    }
  }

  private static saveStore(data: LocalStoreData): void {
    if (process.env.NODE_ENV === "production") {
      console.warn("LocalDataStore write ignored in production serverless environment. Configure live Supabase database.");
      return;
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("LocalDataStore write error:", err);
    }
  }

  // --- CATEGORIES ---
  public static getCategories(): Category[] {
    return this.ensureStore().categories;
  }

  public static saveCategory(cat: Category): Category {
    const store = this.ensureStore();
    const existingIndex = store.categories.findIndex((c) => c.id === cat.id || c.slug === cat.slug);

    if (existingIndex >= 0) {
      store.categories[existingIndex] = { ...store.categories[existingIndex], ...cat };
    } else {
      store.categories.push(cat);
    }

    this.saveStore(store);
    return cat;
  }

  public static deleteCategory(id: string): boolean {
    const store = this.ensureStore();
    store.categories = store.categories.filter((c) => c.id !== id);
    this.saveStore(store);
    return true;
  }

  // --- PRODUCTS ---
  public static getProducts(): ProductCatalogItem[] {
    return this.ensureStore().products;
  }

  public static saveProduct(formData: ProductWizardFormData, productId: string): ProductCatalogItem {
    const store = this.ensureStore();
    const category = store.categories.find((c) => c.id === formData.category_id || c.slug === formData.category_id);

    const catalogItem: ProductCatalogItem = {
      id: productId,
      category_id: formData.category_id,
      sub_category_id: formData.sub_category_id || null,
      blueprint_type: formData.blueprint_type || null,
      title_en: formData.title_en,
      slug: formData.slug,
      tagline: formData.tagline,
      base_price: formData.base_price,
      highlights: formData.highlights,
      is_featured: formData.is_featured,
      is_active: true,
      created_at: new Date().toISOString(),
      category: category
        ? {
            name_en: category.name_en,
            slug: category.slug,
            blueprint_type: category.blueprint_type,
          }
        : {
            name_en: "Uncategorized",
            slug: "uncategorized",
            blueprint_type: formData.blueprint_type,
          },
      finishes: formData.finishes.map((f, i) => ({
        id: `fin-${Date.now()}-${i}`,
        finish_name: f.finish_name,
        hex_code: f.hex_code,
        media: f.media,
      })),
      sizes: formData.sizes.map((s, i) => ({
        id: `sz-${Date.now()}-${i}`,
        size_label: s.size_label,
        price: s.price,
        stock_status: s.stock_status,
      })),
    };

    const existingIndex = store.products.findIndex((p) => p.id === productId || p.slug === formData.slug);
    if (existingIndex >= 0) {
      store.products[existingIndex] = catalogItem;
    } else {
      store.products.unshift(catalogItem);
    }

    this.saveStore(store);
    return catalogItem;
  }

  public static deleteProduct(id: string): boolean {
    const store = this.ensureStore();
    store.products = store.products.filter((p) => p.id !== id);
    this.saveStore(store);
    return true;
  }

  // --- BOOKINGS ---
  public static getBookings(): BookingWithDetails[] {
    return this.ensureStore().bookings;
  }

  public static updateBookingStatus(id: string, status: BookingWithDetails["order_status"]): boolean {
    const store = this.ensureStore();
    const booking = store.bookings.find((b) => b.id === id);
    if (booking) {
      booking.order_status = status;
      booking.updated_at = new Date().toISOString();
      this.saveStore(store);
      return true;
    }
    return false;
  }

  // --- STOREFRONT SECTIONS ---
  public static getStorefrontSection(key: string): unknown | null {
    const store = this.ensureStore();
    return store.storefront[key] || null;
  }

  public static getAllStorefrontSections(): Array<{
    id: string;
    section_key: string;
    title_en: string;
    content: Record<string, unknown>;
    is_active: boolean;
    display_order: number;
  }> {
    const store = this.ensureStore();
    const result: Array<{
      id: string;
      section_key: string;
      title_en: string;
      content: Record<string, unknown>;
      is_active: boolean;
      display_order: number;
    }> = [];
    let order = 0;
    for (const [key, value] of Object.entries(store.storefront || {})) {
      if (!value) continue;
      const v = value as Record<string, unknown>;
      if (v.content && typeof v.content === "object") {
        result.push({
          id: (v.id as string) || `local-${key}`,
          section_key: key,
          title_en: (v.title_en as string) || key,
          content: v.content as Record<string, unknown>,
          is_active: v.is_active !== false,
          display_order: typeof v.display_order === "number" ? (v.display_order as number) : order++,
        });
      } else {
        result.push({
          id: `local-${key}`,
          section_key: key,
          title_en: key,
          content: v,
          is_active: true,
          display_order: order++,
        });
      }
    }
    return result;
  }

  public static saveStorefrontSection(key: string, content: unknown): void {
    const store = this.ensureStore();
    store.storefront[key] = content;
    this.saveStore(store);
  }

  public static getSiteSettings(): SiteSettings {
    const store = this.ensureStore();
    return store.site_settings || DEFAULT_SETTINGS;
  }

  public static saveSiteSettings(settings: SiteSettings): void {
    const store = this.ensureStore();
    store.site_settings = settings;
    this.saveStore(store);
  }

  public static getReviews(): ClientReview[] {
    const store = this.ensureStore();
    return store.reviews || [];
  }

  public static saveReview(review: ClientReview): void {
    const store = this.ensureStore();
    if (!store.reviews) store.reviews = [];
    const index = store.reviews.findIndex((r) => r.id === review.id);
    if (index > -1) {
      store.reviews[index] = review;
    } else {
      store.reviews.unshift(review);
    }
    this.saveStore(store);
  }

  public static deleteReview(id: string): void {
    const store = this.ensureStore();
    if (!store.reviews) return;
    store.reviews = store.reviews.filter((r) => r.id !== id);
    this.saveStore(store);
  }
}
