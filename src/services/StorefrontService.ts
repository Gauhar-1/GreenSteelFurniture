import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CategoryService } from "@/services/CategoryService";
import { LocalDataStore } from "@/services/LocalDataStore";
import type {
  PageBlock,
  RoomHotspot,
  BentoSpaceCard,
  LookbookRoom,
  LookbookPiece,
  WallColorOption,
} from "@/types/blocks";
import type { Category } from "@/types/database";

interface RawStorefrontRow {
  id: string;
  section_key: string;
  title_en: string;
  title_hi: string;
  content: Record<string, unknown>;
  is_active: boolean;
  display_order?: number;
}

interface HydratedProductSummary {
  id: string;
  slug: string;
  title_en: string;
  title_hi: string;
  formattedPrice: string;
  imageUrl: string;
  href: string;
}

export class StorefrontService {
  public static isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes("placeholder-project"));
  }

  /**
   * Fetch custom section content from storefront_sections table
   */
  public static async getSectionContent<T = Record<string, unknown>>(
    sectionKey: string
  ): Promise<T | null> {
    try {
      if (!this.isConfigured()) {
        const store = LocalDataStore.getStorefrontSection(sectionKey);
        return (store as T) || null;
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("storefront_sections")
        .select("content")
        .eq("section_key", sectionKey)
        .eq("is_active", true)
        .single();

      if (error || !data) return null;
      return data.content as T;
    } catch {
      return null;
    }
  }

  /**
   * 100% Dynamic Landing Page Blocks Hydration Service
   * 
   * Strict Rules Followed:
   * 1. Fetches active rows from storefront_sections ordered by display_order ASC.
   * 2. ZERO mock arrays. Returns [] if the database returns 0 rows or an error.
   * 3. Relational Hydration:
   *    - Collects all product_ids from hero hotspots and lookbook rooms.
   *    - Batch-fetches live products joined with finishes and sizes.
   *    - Filters out deleted products gracefully so the UI never crashes on undefined.price.
   *    - Collects category_ids from bento cards and maps live slug and localized names.
   * 4. Maps into the discriminated union PageBlock type.
   */
  public static async getLandingPageBlocks(): Promise<PageBlock[]> {
    try {
      let rows: RawStorefrontRow[] = [];

      if (this.isConfigured()) {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
          .from("storefront_sections")
          .select("id, section_key, title_en, title_hi, content, is_active, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("StorefrontService: Error fetching storefront_sections:", error.message);
          return [];
        }

        const rawData = (data as RawStorefrontRow[]) || [];
        rows = rawData.sort((a, b) => {
          const orderA = (a.content?.display_order as number) ?? (a as any).display_order ?? 0;
          const orderB = (b.content?.display_order as number) ?? (b as any).display_order ?? 0;
          return orderA - orderB;
        });
      } else {
        rows = LocalDataStore.getAllStorefrontSections().filter((s) => s.is_active);
      }

      if (!rows || rows.length === 0) {
        return [];
      }

      // ----------------------------------------------------------------------
      // Step A: Collect referenced product IDs and category IDs
      // ----------------------------------------------------------------------
      const referencedProductIds = new Set<string>();
      const referencedProductSlugs = new Set<string>();
      const referencedCategoryIds = new Set<string>();

      for (const row of rows) {
        const key = row.section_key;
        const content = (row.content as Record<string, any>) || {};

        // Hero hotspots
        if (key === "hero_room_showcase" || key === "hero_showcase") {
          const hotspots = Array.isArray(content.hotspots) ? content.hotspots : [];
          for (const h of hotspots) {
            if (h.product_id) referencedProductIds.add(String(h.product_id));
            if (h.product_slug) referencedProductSlugs.add(String(h.product_slug));
          }
        }

        // Lookbook sets
        if (key === "interactive_room_lookbook" || key === "complete_the_look") {
          const rooms = Array.isArray(content.rooms) ? content.rooms : (Array.isArray(content.sets) ? content.sets : []);
          for (const room of rooms) {
            const products = Array.isArray(room.products) ? room.products : [];
            for (const p of products) {
              if (p.product_id) referencedProductIds.add(String(p.product_id));
              if (p.id) referencedProductIds.add(String(p.id));
              if (p.slug) referencedProductSlugs.add(String(p.slug));
            }
            const linkedIds = Array.isArray(room.linkedProductIds) ? room.linkedProductIds : [];
            for (const lid of linkedIds) {
              referencedProductIds.add(String(lid));
            }
          }
        }

        // Bento spaces
        if (key === "asymmetric_spaces_bento" || key === "bento_spaces") {
          const cards = Array.isArray(content.cards) ? content.cards : [];
          for (const c of cards) {
            if (c.category_id) referencedCategoryIds.add(String(c.category_id));
          }
        }
      }

      // ----------------------------------------------------------------------
      // Step B: Batch-fetch live products with default finishes and sizes
      // ----------------------------------------------------------------------
      const liveProductsMap = new Map<string, HydratedProductSummary>();
      const liveProductsBySlug = new Map<string, HydratedProductSummary>();

      if (referencedProductIds.size > 0 || referencedProductSlugs.size > 0) {
        try {
          if (this.isConfigured()) {
            const supabase = getSupabaseServerClient();
            let query = supabase
              .from("products")
              .select(`
                id,
                slug,
                title_en,
                title_hi,
                base_price,
                is_active,
                category:categories!products_category_id_fkey(id, slug, name_en, name_hi),
                finishes:product_finishes(id, finish_name, hex_code, media, is_default),
                sizes:product_sizes(id, size_label, price, is_default)
              `)
              .eq("is_active", true);

            if (referencedProductIds.size > 0) {
              query = query.in("id", Array.from(referencedProductIds));
            }

            const { data: prods, error: prodsErr } = await query;

            if (!prodsErr && prods) {
              for (const p of prods as any[]) {
                const defaultFinish = p.finishes?.find((f: any) => f.is_default) || p.finishes?.[0];
                const img =
                  defaultFinish?.media?.lifestyle ||
                  defaultFinish?.media?.front ||
                  defaultFinish?.media?.macro ||
                  "";

                const defaultSize = p.sizes?.find((s: any) => s.is_default) || p.sizes?.[0];
                const rawPrice = defaultSize?.price ?? p.base_price;
                const formattedPrice = `₹${Number(rawPrice).toLocaleString("en-IN")}`;
                const categorySlug = p.category?.slug || "bedroom";
                const href = `/categories/${categorySlug}/product/${p.slug}`;

                const summary: HydratedProductSummary = {
                  id: p.id,
                  slug: p.slug,
                  title_en: p.title_en,
                  title_hi: p.title_hi,
                  formattedPrice,
                  imageUrl: img,
                  href,
                };

                liveProductsMap.set(p.id, summary);
                liveProductsBySlug.set(p.slug, summary);
              }
            }
          } else {
            const localProducts = LocalDataStore.getProducts();
            for (const p of localProducts) {
              const defaultFinish = p.finishes?.find((f) => f.is_default) || p.finishes?.[0];
              const img =
                defaultFinish?.media?.lifestyle ||
                defaultFinish?.media?.front ||
                "";
              const defaultSize = p.sizes?.find((s) => s.is_default) || p.sizes?.[0];
              const rawPrice = defaultSize?.price ?? p.base_price;
              const formattedPrice = `₹${Number(rawPrice).toLocaleString("en-IN")}`;
              const categorySlug = p.category?.slug || "bedroom";
              const href = `/categories/${categorySlug}/product/${p.slug}`;

              const summary: HydratedProductSummary = {
                id: p.id,
                slug: p.slug,
                title_en: p.title_en,
                title_hi: p.title_hi,
                formattedPrice,
                imageUrl: img,
                href,
              };

              liveProductsMap.set(p.id, summary);
              liveProductsBySlug.set(p.slug, summary);
            }
          }
        } catch (fetchErr) {
          console.error("StorefrontService: Failed batch-fetching live products:", fetchErr);
        }
      }

      // ----------------------------------------------------------------------
      // Step C: Live categories map
      // ----------------------------------------------------------------------
      const liveCategories = await CategoryService.getAllCategories();
      const liveCategoriesMap = new Map<string, Category>();
      const liveCategoriesBySlug = new Map<string, Category>();

      for (const cat of liveCategories) {
        if (cat.id) liveCategoriesMap.set(cat.id, cat);
        if (cat.slug) liveCategoriesBySlug.set(cat.slug, cat);
      }

      // ----------------------------------------------------------------------
      // Step D: Map each database row into PageBlock discriminated union
      // ----------------------------------------------------------------------
      const blocks: PageBlock[] = [];
      const seenBlockTypes = new Set<string>();

      for (const row of rows) {
        const key = row.section_key;
        const content = (row.content as Record<string, any>) || {};

        // 1. HERO ROOM SHOWCASE (Deduplicated)
        if (key === "hero_room_showcase" || key === "hero_showcase") {
          if (seenBlockTypes.has("hero_room_showcase")) continue;
          seenBlockTypes.add("hero_room_showcase");

          const rawHotspots = Array.isArray(content.hotspots) ? content.hotspots : [];
          const hydratedHotspots: RoomHotspot[] = [];

          for (const raw of rawHotspots) {
            const prodId = raw.product_id;
            const prodSlug = raw.product_slug;
            const liveProd = (prodId && liveProductsMap.get(prodId)) || (prodSlug && liveProductsBySlug.get(prodSlug));

            // If a product was explicitly referenced:
            if (prodId || prodSlug) {
              // Admin deleted the referenced product -> filter out gracefully
              if (!liveProd) continue;

              hydratedHotspots.push({
                id: raw.id || `pin-${liveProd.id}`,
                title: liveProd.title_en,
                price: liveProd.formattedPrice,
                href: liveProd.href,
                xPercent: typeof raw.xPercent === "number" ? raw.xPercent : (typeof raw.x === "number" ? raw.x : 50),
                yPercent: typeof raw.yPercent === "number" ? raw.yPercent : (typeof raw.y === "number" ? raw.y : 50),
                product_id: liveProd.id,
                product_slug: liveProd.slug,
              });
            } else if (raw.title && raw.price) {
              hydratedHotspots.push({
                id: raw.id || `pin-${Math.random()}`,
                title: raw.title || raw.label,
                price: typeof raw.price === "number" ? `₹${Number(raw.price).toLocaleString("en-IN")}` : String(raw.price),
                href: raw.href || "/categories",
                xPercent: typeof raw.xPercent === "number" ? raw.xPercent : (typeof raw.x === "number" ? raw.x : 50),
                yPercent: typeof raw.yPercent === "number" ? raw.yPercent : (typeof raw.y === "number" ? raw.y : 50),
              });
            }
          }

          blocks.push({
            id: row.id || "hero-room-showcase",
            type: "hero_room_showcase",
            label: content.label || content.badge || row.title_en || "BUILT FOR EVERY ROOM",
            headline: content.headline || content.headline_en || "Furniture That Defines Your Home.",
            imageUrl: content.imageUrl || content.image_url || "",
            imageAlt: content.imageAlt || content.headline || "Pure steel furniture room showcase",
            cta: {
              label: content.cta?.label || "Explore Collections",
              href: content.cta?.href || "/categories",
            },
            hotspots: hydratedHotspots,
          });
        }

        // 2. ASYMMETRIC SPACES BENTO (Categories driven solely by Categories Page)
        else if (key === "asymmetric_spaces_bento" || key === "bento_spaces") {
          if (seenBlockTypes.has("asymmetric_spaces_bento")) continue;
          seenBlockTypes.add("asymmetric_spaces_bento");

          const rawCards = Array.isArray(content.cards) ? content.cards : [];
          const hydratedCards: BentoSpaceCard[] = rawCards.map((card: any, idx: number) => {
            const catId = card.category_id;
            const liveCat = (catId && liveCategoriesMap.get(catId)) || (card.slug && liveCategoriesBySlug.get(card.slug));

            // Sole source of truth for name, subtitle, image, and slug is the live Category record
            const title = liveCat ? (liveCat.name_en || "Collection Space") : (card.title || "Collection Space");
            const subtitle = liveCat ? (liveCat.subtitle || "") : (card.subtitle || "");
            const href = liveCat ? `/categories/${liveCat.slug}` : (card.href || card.link || "/categories");
            const imageUrl = (liveCat && liveCat.cover_image) ? liveCat.cover_image : (card.imageUrl || card.image || "");
            const gridSpan = card.gridSpan || (
              idx === 0 ? "master_bedroom" :
              idx === 1 ? "living_hall" :
              idx === 2 ? "dining_space" :
              idx === 3 ? "study_office" :
              idx === 4 ? "storage_almirah" : "standard"
            );

            return {
              id: card.id || `card-${liveCat?.id || idx + 1}`,
              title,
              subtitle,
              href,
              imageUrl,
              imageAlt: card.imageAlt || `${title} pure steel furniture`,
              gridSpan,
              category_id: liveCat?.id || catId,
            };
          });

          blocks.push({
            id: row.id || "asymmetric-spaces-bento",
            type: "asymmetric_spaces_bento",
            title: content.title || row.title_en || "Designed for Every Space",
            cards: hydratedCards,
          });
        }

        // 3. WALL COLOR MATCHER ("Design by Color")
        else if (key === "wall_color_matcher") {
          if (seenBlockTypes.has("wall_color_matcher")) continue;
          seenBlockTypes.add("wall_color_matcher");

          const rawCombos = Array.isArray(content.combinations)
            ? content.combinations
            : (Array.isArray(content.colors) ? content.colors : []);

          const combinations: WallColorOption[] = rawCombos.map((c: any, idx: number) => ({
            id: c.id || `wall-${idx + 1}`,
            wallName: c.wallName || c.name || "Curated Walls",
            hex: c.hex || "#E5D9C5",
            advice: c.advice || "",
            image: c.image || c.imageUrl || "",
            href: c.href || c.link,
            ctaText: c.ctaText,
            ctaLink: c.ctaLink,
          }));

          blocks.push({
            id: row.id || "wall-color-matcher",
            type: "wall_color_matcher",
            label: content.label || "Harmonious Living",
            title: content.title || row.title_en || "Design by Color",
            description: content.description,
            combinations,
          });
        }

        // 4. INTERACTIVE ROOM LOOKBOOK ("Complete the Look")
        else if (key === "interactive_room_lookbook" || key === "complete_the_look") {
          if (seenBlockTypes.has("interactive_room_lookbook")) continue;
          seenBlockTypes.add("interactive_room_lookbook");

          const rawRooms = Array.isArray(content.rooms)
            ? content.rooms
            : (Array.isArray(content.sets) ? content.sets : []);

          const hydratedRooms: LookbookRoom[] = [];

          for (const rawRoom of rawRooms) {
            const rawProducts = Array.isArray(rawRoom.products) ? rawRoom.products : [];
            const linkedIds: string[] = Array.isArray(rawRoom.linkedProductIds) ? rawRoom.linkedProductIds : [];
            const hydratedProducts: LookbookPiece[] = [];

            for (const rawPiece of rawProducts) {
              const prodId = rawPiece.product_id || rawPiece.id;
              const prodSlug = rawPiece.slug;
              const liveProd = (prodId && liveProductsMap.get(prodId)) || (prodSlug && liveProductsBySlug.get(prodSlug));

              if (prodId || prodSlug) {
                // Admin deleted referenced product -> filter out gracefully
                if (!liveProd) continue;

                hydratedProducts.push({
                  id: liveProd.id,
                  title: liveProd.title_en,
                  price: liveProd.formattedPrice,
                  imageUrl: liveProd.imageUrl || rawPiece.imageUrl || rawPiece.image || "",
                  href: liveProd.href,
                  product_id: liveProd.id,
                });
              } else if (rawPiece.title && rawPiece.price) {
                hydratedProducts.push({
                  id: rawPiece.id || `piece-${Math.random()}`,
                  title: rawPiece.title,
                  price: typeof rawPiece.price === "number" ? `₹${Number(rawPiece.price).toLocaleString("en-IN")}` : String(rawPiece.price),
                  imageUrl: rawPiece.imageUrl || rawPiece.image || "",
                  href: rawPiece.href || "/categories",
                });
              }
            }

            // Hydrate linkedProductIds from live products
            for (const lid of linkedIds) {
              const liveProd = liveProductsMap.get(lid) || liveProductsBySlug.get(lid);
              if (liveProd && !hydratedProducts.some((p) => p.id === liveProd.id)) {
                hydratedProducts.push({
                  id: liveProd.id,
                  title: liveProd.title_en,
                  price: liveProd.formattedPrice,
                  imageUrl: liveProd.imageUrl || "",
                  href: liveProd.href,
                  product_id: liveProd.id,
                });
              }
            }

            hydratedRooms.push({
              id: rawRoom.id || `room-${hydratedRooms.length + 1}`,
              tabLabel: rawRoom.tabLabel || rawRoom.tabName || rawRoom.name || rawRoom.tab || "Room",
              lifestyleImageUrl: rawRoom.lifestyleImageUrl || rawRoom.lifestyleImage || rawRoom.lifestyle_image || rawRoom.image || "",
              lifestyleImageAlt: rawRoom.lifestyleImageAlt || `${rawRoom.tabLabel || rawRoom.tabName || "Room"} pure steel setting`,
              products: hydratedProducts,
            });
          }

          blocks.push({
            id: row.id || "interactive-room-lookbook",
            type: "interactive_room_lookbook",
            title: content.title || row.title_en || "Complete the Look",
            subtitle: content.subtitle,
            rooms: hydratedRooms,
          });
        }

        // 5. VISUAL CRAFTSMANSHIP SPLIT ("Unseen Strength")
        else if (key === "visual_craftsmanship_split" || key === "craftsmanship_split") {
          if (seenBlockTypes.has("visual_craftsmanship_split")) continue;
          seenBlockTypes.add("visual_craftsmanship_split");
          blocks.push({
            id: row.id || "visual-craftsmanship-split",
            type: "visual_craftsmanship_split",
            left: {
              caption: content.left?.caption || "Warmth of Wood. Strength of Steel.",
              imageUrl: content.left?.imageUrl || content.left?.image || "",
              imageAlt: content.left?.imageAlt || "Tactile matte pure steel surface",
              href: content.left?.href || "/categories",
            },
            right: {
              caption: content.right?.caption || "Crafted to Last Generations.",
              imageUrl: content.right?.imageUrl || content.right?.image || "",
              imageAlt: content.right?.imageAlt || "Precision engineered steel mechanisms",
              href: content.right?.href || "/categories",
            },
          });
        }

        // LEGACY: category_grid
        else if (key === "category_grid") {
          blocks.push({
            id: row.id || "category-grid",
            type: "category_grid",
            title: content.title || row.title_en || "Collections",
            subtitle: content.subtitle,
            categories: content.categories || [],
          });
        }

        // LEGACY: hero
        else if (key === "hero") {
          blocks.push({
            id: row.id || "hero",
            type: "hero",
            headline: content.headline || row.title_en || "",
            subheadline: content.subheadline,
            imageUrl: content.imageUrl || "",
            imageAlt: content.imageAlt || "",
            primaryCta: content.primaryCta || { label: "Explore", href: "/categories" },
            secondaryCta: content.secondaryCta,
            trustBadges: content.trustBadges || [],
          });
        }
      }

      return blocks;
    } catch (err) {
      console.error("StorefrontService: Unexpected error in getLandingPageBlocks:", err);
      return [];
    }
  }

  /**
   * Backward-compatible alias for getLandingPageBlocks
   */
  public static async getShowroomLandingBlocks(): Promise<PageBlock[]> {
    return this.getLandingPageBlocks();
  }
}
