# Green Steel Furniture — Pre-Launch Security, Leak, & Performance Audit Report

**Audit Target:** Green Steel Furniture E-Commerce Platform  
**Architecture:** Next.js 15 (App Router), TypeScript (Strict), Supabase (PostgreSQL + RLS + S3 Storage + `@supabase/ssr`), Tailwind CSS v4 / shadcn  
**Audit Role:** Principal Security & Next.js Performance Architect  
**Audit Status:** Complete Pre-Launch Deep Audit  
**Execution Mode:** Read-Only Analysis (No application code modified)  
**Date:** November 2026  

---

## 1. System Data-Flow & Bottleneck Architecture Map

```
=========================================================================================================
                                     PUBLIC STOREFRONT TRAFFIC PATH
=========================================================================================================

[Customer Browser] 
       │ 
       ▼
[Edge / CDN Layer] ──❌ CACHE MISS: Every public route declares `export const dynamic = "force-dynamic"`!
       │             (Next.js Data Cache & Full Route Cache completely bypassed on every request)
       ▼
[Next.js App Router (RSC)]
       │
       ├──► `generateMetadata` ──► Duplicate Query: `ProductService.getProductBySlug()` [No React cache()]
       │
       ├──► Page Component RSC ──► Duplicate Query: `ProductService.getProductBySlug()` (Repeated DB Hit)
       │                         ├──► `ProductService.getProductsByCategorySlug()` 
       │                         │       └──❌ Full Table Scan: Fetches ALL products from Postgres & filters in Node.js RAM!
       │                         └──► `StorefrontService.getLandingPageBlocks()`
       │
       ▼
[Supabase Client Layer] ────────► Uses Singleton `getSupabaseServerClient()` with `SUPABASE_SERVICE_ROLE_KEY`
       │                          (Bypasses PostgreSQL Row Level Security across all read services)
       ▼
[Supabase PostgreSQL + RLS] ───► Missing composite indexes on `(is_active, display_order)`
                                 RLS Policy in `002_admin_auth.sql` allows public to read inactive/draft items!

---------------------------------------------------------------------------------------------------------
                                      PUBLIC CHECKOUT & MUTATION PATH
---------------------------------------------------------------------------------------------------------

[Customer Mobile Browser]
       │
       ▼
[CheckoutDrawer.tsx (Vaul Sheet)]
       │
       ▼
[Server Action: `createTokenOrder`] (src/actions/checkout.ts)
       │
       ├──❌ Boundary Vulnerability: Accepts `productPrice` & `amountPayableNow` directly from client!
       │     (Zero verification against `product_sizes` in PostgreSQL database -> Price Tampering Risk)
       │
       └──❌ Order Drop: NEVER inserts into `public.bookings` table!
             (Generates dummy in-memory UPI string; orders never persist to database or admin dashboard)

---------------------------------------------------------------------------------------------------------
                                        ADMIN STUDIO TRAFFIC PATH
---------------------------------------------------------------------------------------------------------

[Admin Browser]
       │
       ▼
[Next.js Middleware (src/middleware.ts)]
       │
       ├──► Matches `/admin/:path*`
       └──► `updateSession` ──► Executes `supabase.auth.getUser()` + DB query on `public.admin_users`
                               on EVERY SINGLE admin navigation (Redundant Edge latency overhead)
       │
       ▼
[Admin Studio RSCs] ───────────► `verifyAdminSession()` runs identical check again (Redundant DB Hit)
       │
       ▼
[Admin Client Components]
       │
       ├──► `StorageService.ts` ──► Uses `@supabase/supabase-js` (localStorage) instead of `@supabase/ssr` (cookies)
       │                           (Admin session token missing in browser -> direct uploads fail RLS!)
       │
       ├──► Photo Upload Canvas ──► `URL.createObjectURL()` called without `URL.revokeObjectURL()` cleanup
       │                           (Severe browser memory leak during batch photo uploads)
       │
       └──► `ProductCatalogList.tsx` ──► `handleDelete()` only updates local React state; no Server Action call!
=========================================================================================================
```

---

## 2. Findings Grouped by Severity

---

### Layer 1: Security, Auth, & Data Leakage (`[Blocking]`)

---

#### Finding 1.1: Supabase RLS Public Policy Exposes Inactive & Draft Catalog Items
- **Severity:** `[Blocking]`
- **Exact Location:** `supabase/migrations/002_admin_auth.sql:72-86`
- **Architecture Context:** In migration `001_production_schema.sql` (lines 151-165), public read policies strictly enforced `USING (is_active = true)` on `categories`, `products`, and `storefront_sections`. However, in migration `002_admin_auth.sql`, those policies were dropped and replaced with:
  ```sql
  CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
  CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
  CREATE POLICY "Public can view storefront sections" ON public.storefront_sections FOR SELECT USING (true);
  ```
- **Failure Scenario Under Production Traffic:**  
  Any external actor or competitor using the public Supabase anon key can query PostgREST (`https://<project-ref>.supabase.co/rest/v1/products?is_active=eq.false&select=*` or `https://<project-ref>.supabase.co/rest/v1/storefront_sections?select=*`) and extract unpublished product blueprints, upcoming seasonal releases, internal cost metadata, and deactivated pricing without authentication.
- **Concrete Fix:**  
  Update `supabase/migrations/002_admin_auth.sql` (or create migration `004_fix_rls_policies.sql`) to restrict public reads to active records only, while granting authenticated admins full access via `public.is_admin()`:
  ```sql
  DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
  DROP POLICY IF EXISTS "Public can view products" ON public.products;
  DROP POLICY IF EXISTS "Public can view storefront sections" ON public.storefront_sections;

  CREATE POLICY "Public can view active categories" ON public.categories
      FOR SELECT USING (is_active = true OR public.is_admin());

  CREATE POLICY "Public can view active products" ON public.products
      FOR SELECT USING (is_active = true OR public.is_admin());

  CREATE POLICY "Public can view active storefront sections" ON public.storefront_sections
      FOR SELECT USING (is_active = true OR public.is_admin());
  ```

---

#### Finding 1.2: Unauthenticated Server Action Exposing Master Blueprint Mutation
- **Severity:** `[Blocking]`
- **Exact Location:** `src/actions/adminProduct.ts:20-40`
- **Architecture Context:** Next.js App Router exposes every Server Action as a publicly reachable HTTP POST endpoint. While `src/actions/adminActions.ts` (lines 41-48) correctly calls `await verifyAdminSession()`, `src/actions/adminProduct.ts` defines `createProductBlueprintAction` without any session check:
  ```typescript
  export async function createProductBlueprintAction(
    formData: ProductBlueprintFormData
  ): Promise<ActionResult> {
    try {
      const validatedData = ProductBlueprintSchema.parse(formData);
      const result = await ProductService.saveProductBlueprint(validatedData);
  ```
- **Failure Scenario Under Production Traffic:**  
  An unauthenticated attacker can inspect the client bundle or synthesize a POST request with the Next.js action header targeting `createProductBlueprintAction`, injecting arbitrary product blueprints directly into the system, completely bypassing admin authentication.
- **Concrete Fix:**  
  Delete `src/actions/adminProduct.ts` (and its orphaned component `src/components/admin/ProductBlueprintForm.tsx`) as legacy dead code, or add `verifyAdminSession()` at the boundary:
  ```typescript
  const { authorized } = await verifyAdminSession();
  if (!authorized) {
    return { success: false, message: "Unauthorized: Admin privileges required." };
  }
  ```

---

#### Finding 1.3: Client-Supplied Price Tampering & Booking Persistence Failure
- **Severity:** `[Blocking]`
- **Exact Location:** `src/actions/checkout.ts:99-128` and `src/types/checkout.ts:45-56`
- **Architecture Context:** `createTokenOrder` validates `CheckoutOrderSchema`, which accepts `productPrice`, `amountPayableNow`, and `balanceOnDelivery` directly from the client request payload:
  ```typescript
  export const CheckoutOrderSchema = z.object({
    customer: CustomerIdentitySchema,
    productId: z.string(),
    productName: z.string(),
    variantId: z.string(),
    variantName: z.string(),
    productPrice: z.number().positive(),
    paymentPlan: PaymentPlanSchema,
    amountPayableNow: z.number().positive(),
    balanceOnDelivery: z.number().nonnegative(),
  });
  ```
  `createTokenOrder` performs zero server-side lookup against `public.products` or `public.product_sizes` to verify the actual price. Furthermore, `createTokenOrder` **never executes an `insert` into `public.bookings`**—it only formats a mock string and returns a UPI URI.
- **Failure Scenario Under Production Traffic:**  
  1. **Price Tampering:** A malicious user can intercept the Server Action request and pass `amountPayableNow: 1` and `productPrice: 1` for a ₹42,000 wardrobe. The server generates a legitimate UPI payment link for ₹1 (`upi://pay?pa=greensteel@upi&pn=GreenSteelFurniture&am=1...`).
  2. **Total Order Loss:** Real customers making reservations believe their order is placed, but because `createTokenOrder` never writes to `public.bookings` or `LocalDataStore`, the order is completely invisible to administrators in `/admin/orders`.
- **Concrete Fix:**  
  Refactor `src/actions/checkout.ts` to query `product_sizes` server-side, recalculate `total_amount` and `token_amount`, persist the verified order to `public.bookings` via `@supabase/ssr`, and build the UPI URI from verified server values:
  ```typescript
  const { data: sizeRecord, error } = await supabase
    .from("product_sizes")
    .select("price, token_amount, product_id")
    .eq("id", rawOrder.variantId)
    .single();

  if (error || !sizeRecord) {
    return { success: false, orderId: "", message: "Invalid product configuration." };
  }

  const verifiedTotal = Number(sizeRecord.price);
  const verifiedToken = Number(sizeRecord.token_amount || 999);
  const amountPayableNow = rawOrder.paymentPlan === "token_advance" ? verifiedToken : verifiedTotal - 500;

  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      product_id: sizeRecord.product_id,
      finish_id: rawOrder.finishId,
      size_id: rawOrder.variantId,
      customer_name: rawOrder.customer.fullName,
      customer_phone: rawOrder.customer.mobile,
      pincode: rawOrder.customer.pincode,
      city_district: rawOrder.customer.city || "Hub",
      payment_mode: rawOrder.paymentPlan,
      total_amount: verifiedTotal,
      amount_paid: 0,
      order_status: "pending_token",
    })
    .select("id")
    .single();
  ```

---

#### Finding 1.4: Storage Bucket Upload Auth Disconnect (Client-Side RLS Failure)
- **Severity:** `[Blocking]`
- **Exact Location:** `src/services/StorageService.ts:147-154`, `src/lib/supabase/client.ts:9-25`, and `supabase/migrations/002_admin_auth.sql:157-165`
- **Architecture Context:**  
  - In `002_admin_auth.sql`, storage policies enforce `public.is_admin()`, which checks `auth.uid() = auth.users.id`.
  - Admin login (`loginAdmin` in `src/actions/authActions.ts`) authenticates via `@supabase/ssr` server client, setting HTTP-only session cookies.
  - However, `StorageService.uploadProductMedia` and `uploadStorefrontMedia` call `getSupabaseBrowserClient()` from `src/lib/supabase/client.ts`, which instantiates a bare `createClient` from `@supabase/supabase-js` that looks for tokens in `localStorage`, NOT cookies!
- **Failure Scenario Under Production Traffic:**  
  When an admin attempts to upload photos in `ProductWizard` or `StorefrontVisualEditor`, the browser client has no session token (`auth.uid()` is `null`). Supabase Storage rejects the upload with an RLS policy violation error. `StorageService` catches this error and falls back to converting the multi-megabyte image into a local Base64 string (`isFallback: true`), bloating the database payload or storing megabytes in `.data/admin-store.json`.
- **Concrete Fix:**  
  Update `StorageService.ts` to use `createClient()` from `@/utils/supabase/client` (which uses `@supabase/ssr` `createBrowserClient` that automatically reads session cookies):
  ```typescript
  import { createClient as createBrowserSupabaseClient } from "@/utils/supabase/client";
  // In upload method:
  const supabase = createBrowserSupabaseClient();
  ```

---

#### Finding 1.5: Open Redirect Vulnerability in Admin Authentication
- **Severity:** `[Blocking]`
- **Exact Location:** `src/actions/authActions.ts:81-97, 169` and `src/components/admin/AdminLogin.tsx:24, 62-66`
- **Architecture Context:**  
  In `AdminLogin.tsx`:
  ```typescript
  const redirectTo = searchParams.get("redirectTo") || "/admin";
  ```
  This is passed to `loginAdmin`, which returns it in `data.redirectTo`, and `AdminLogin.tsx` executes:
  ```typescript
  const destination = res.data?.redirectTo || redirectTo || "/admin";
  router.push(destination);
  ```
  Neither the Server Action nor the client component validates that `redirectTo` is an internal relative URL.
- **Failure Scenario Under Production Traffic:**  
  An attacker crafts a spear-phishing link: `https://greensteelfurniture.com/admin/login?redirectTo=https://evil-spoof.com/harvest`. When an administrator clicks the link and signs in, Next.js immediately redirects the browser to `https://evil-spoof.com/harvest`, facilitating session token theft or credential harvesting.
- **Concrete Fix:**  
  Strictly validate that `redirectTo` starts with `/` and does not start with `//` or protocol schemes:
  ```typescript
  function sanitizeRedirectUrl(url?: string): string {
    if (!url || typeof url !== "string") return "/admin";
    if (url.startsWith("/") && !url.startsWith("//") && !url.includes("://")) {
      return url;
    }
    return "/admin";
  }
  ```

---

#### Finding 1.6: Production Crash Risk on Serverless via Synchronous File Writing
- **Severity:** `[Blocking]`
- **Exact Location:** `src/services/LocalDataStore.ts:15, 29, 65`
- **Architecture Context:**  
  `LocalDataStore` attempts to create and write `.data/admin-store.json` using `fs.mkdirSync` and `fs.writeFileSync`:
  ```typescript
  const DATA_DIR = path.join(process.cwd(), ".data");
  const STORE_FILE = path.join(DATA_DIR, "admin-store.json");
  ```
- **Failure Scenario Under Production Traffic:**  
  Serverless hosting platforms (Vercel, AWS Lambda, Google Cloud Run in read-only container mode) strictly enforce a read-only root filesystem. If Supabase experiences a network hiccup or is momentarily unreachable, `adminActions.ts` falls back to `LocalDataStore`. Any call to `saveCategory`, `saveProduct`, or `updateBookingStatus` will throw an unhandled `EROFS: read-only file system` exception, crashing the Server Action and serving HTTP 500 errors to admins.
- **Concrete Fix:**  
  In production, disable file-based fallback and return an explicit service error:
  ```typescript
  if (process.env.NODE_ENV === "production") {
    throw new Error("Live database connection unavailable. File fallback is disabled in production.");
  }
  ```

---

#### Finding 1.7: Overly Permissive Bypass in Middleware and Auth Actions
- **Severity:** `[Blocking]`
- **Exact Location:** `src/utils/supabase/middleware.ts:24-31` and `src/actions/authActions.ts:17-20`
- **Architecture Context:**  
  In `src/utils/supabase/middleware.ts`:
  ```typescript
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder-project")) {
    return {
      response: supabaseResponse,
      user: null,
      isAdmin: true, // Allow local development when credentials are unset
      isConfigured: false,
    };
  }
  ```
  And in `src/actions/authActions.ts`:
  ```typescript
  if (!url || url.includes("placeholder-project")) {
    return { authorized: true };
  }
  ```
- **Failure Scenario Under Production Traffic:**  
  If environment variables are omitted or misconfigured during production deployment (or set to placeholder values), any public visitor navigating to `/admin` is automatically granted `isAdmin: true` and can execute admin actions.
- **Concrete Fix:**  
  Ensure bypasses are strictly gated by `process.env.NODE_ENV === "development"`:
  ```typescript
  if (process.env.NODE_ENV === "development" && (!supabaseUrl || supabaseUrl.includes("placeholder-project"))) {
    return { response: supabaseResponse, user: null, isAdmin: true, isConfigured: false };
  }
  ```

---

### Layer 2: Memory, Resource, & Connection Leaks (`[Blocking]` / `[Architecture]`)

---

#### Finding 2.1: Browser Heap Memory Leak from Unrevoked Object URLs
- **Severity:** `[Blocking]`
- **Exact Location:** `src/services/StorageService.ts:91`
- **Architecture Context:**  
  In `StorageService.compressImage`:
  ```typescript
  const objectUrl = URL.createObjectURL(blob);
  const dataUrl = canvas.toDataURL("image/webp", quality);
  resolve({ blob, dataUrl, objectUrl, originalSizeKb, compressedSizeKb });
  ```
  `URL.createObjectURL(blob)` registers a reference in the browser's internal URL registry. `URL.revokeObjectURL()` is never called anywhere in `StorageService.ts`, `ProductWizard.tsx`, or `StorefrontVisualEditor.tsx`.
- **Failure Scenario Under Production Traffic:**  
  Each 4-slot finish photo uploaded by an admin allocates a persistent blob in browser RAM. An admin configuring 3 finishes (12 photos) leaves over 50–100MB of uncollected image memory in the browser process. On lower-RAM mobile devices or tablets, the browser tab will crash with an "Out of Memory" error during catalog curation.
- **Concrete Fix:**  
  Provide an explicit revoke mechanism or revoke previous object URLs before allocating new ones in `ProductWizard.tsx` and `StorefrontVisualEditor.tsx`:
  ```typescript
  if (previewUrl && previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
  ```

---

#### Finding 2.2: Unreleased Canvas Memory and Double Encoding
- **Severity:** `[Architecture]`
- **Exact Location:** `src/services/StorageService.ts:68-105`
- **Architecture Context:**  
  `StorageService.compressImage` creates a `<canvas>` element up to 1600px wide. It simultaneously generates both `canvas.toBlob(...)` AND a massive Base64 string via `canvas.toDataURL("image/webp", quality)`:
  ```typescript
  const objectUrl = URL.createObjectURL(blob);
  const dataUrl = canvas.toDataURL("image/webp", quality);
  ```
  The canvas dimensions are never reset (`canvas.width = 0; canvas.height = 0`), and both representations are kept in memory simultaneously.
- **Failure Scenario Under Production Traffic:**  
  A 1600x1200 canvas consumes ~7.7MB of raw RGBA pixel memory. Generating a 2MB Base64 string alongside the blob doubles memory consumption. On mobile devices with 3–4GB RAM, processing multiple photos in sequence triggers OS memory pressure kills.
- **Concrete Fix:**  
  Release the canvas after `toBlob` completion, and only generate `toDataURL` if explicitly required for offline fallback:
  ```typescript
  canvas.toBlob((blob) => {
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) return reject(new Error("Compression failed"));
    resolve({ blob, objectUrl: URL.createObjectURL(blob), ... });
  }, "image/webp", quality);
  ```

---

#### Finding 2.3: Orphaned Timer Leak in Navigation Progress Bar
- **Severity:** `[Blocking]`
- **Exact Location:** `src/components/ui/TopRouteProgressBar.tsx:25-34`
- **Architecture Context:**  
  ```typescript
  const handleStart = () => {
    setIsVisible(true);
    setProgress(25);
    const t1 = setTimeout(() => setProgress(65), 150);
    const t2 = setTimeout(() => setProgress(85), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };
  window.addEventListener("route-transition-start", handleStart);
  ```
  DOM event listener callbacks cannot return cleanup functions—the return value is silently discarded by `window.addEventListener`. The timers `t1` and `t2` are never cleared.
- **Failure Scenario Under Production Traffic:**  
  Rapid user navigation or clicking links creates orphaned timers that trigger `setProgress` after route completion, causing visual progress bar stutter and React state update warnings on unmounted components.
- **Concrete Fix:**  
  Store timer references in a `useRef` array and clear active timers whenever `handleStart` or `handleStop` is invoked:
  ```typescript
  const timerRefs = useRef<NodeJS.Timeout[]>([]);
  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };
  ```

---

#### Finding 2.4: Uncancelled Asynchronous Server Action in Customer Checkout Sheet
- **Severity:** `[Architecture]`
- **Exact Location:** `src/components/checkout/CheckoutDrawer.tsx:96-135`
- **Architecture Context:**  
  When 6 digits are typed into the pincode field, `useEffect` triggers `lookupPincode(cleanPin)` without checking if the component remains mounted or if the input has since changed:
  ```typescript
  useEffect(() => {
    if (cleanPin.length === 6) {
      lookupPincode(cleanPin).then((res) => {
        setValue("city", res.city);
        setValue("state", res.state);
      });
    }
  }, [watchedPincode, setValue]);
  ```
- **Failure Scenario Under Production Traffic:**  
  If a customer types `273001`, realizes a typo, and quickly changes it to `221001`, both Server Actions race. If the first slower network response resolves last, it overwrites the correct city with outdated data.
- **Concrete Fix:**  
  Add an active cancellation flag inside `useEffect`:
  ```typescript
  useEffect(() => {
    let isCurrent = true;
    if (cleanPin.length === 6 && /^\d{6}$/.test(cleanPin)) {
      lookupPincode(cleanPin).then((res) => {
        if (!isCurrent) return;
        if (res.available) {
          setValue("city", res.city);
          setValue("state", res.state);
        }
      });
    }
    return () => { isCurrent = false; };
  }, [watchedPincode, setValue]);
  ```

---

#### Finding 2.5: Sequential N+1 Database Waterfall in Admin Storefront Reordering
- **Severity:** `[Architecture]`
- **Exact Location:** `src/actions/adminActions.ts:427-442`
- **Architecture Context:**  
  `reorderStorefrontSectionsAction` iterates through ordered sections using a sequential `for...of` loop, executing a `SELECT` followed by an `UPDATE` on every iteration:
  ```typescript
  for (const item of orders) {
    const { data: existing } = await supabase
      .from("storefront_sections")
      .select("content")
      .eq("section_key", item.sectionKey)
      .single();

    await supabase
      .from("storefront_sections")
      .update({ content: { ...currentContent, display_order: item.displayOrder }, ... })
      .eq("section_key", item.sectionKey);
  }
  ```
- **Failure Scenario Under Production Traffic:**  
  Reordering 5 storefront sections executes 10 sequential roundtrips over HTTPS to Supabase. Over high-latency mobile networks, this action takes 2.5–4.5 seconds, frequently causing network timeout errors.
- **Concrete Fix:**  
  Fetch all existing sections in one batched `.in("section_key", keys)` query, and execute updates in parallel using `Promise.all` or a Postgres stored procedure.

---

### Layer 3: Production Latency & Performance Bottlenecks (`[Architecture]` / `[Suggestion]`)

---

#### Finding 3.1: Complete Dynamic Opt-Out on All Public Storefront Routes (`force-dynamic`)
- **Severity:** `[Architecture]` (Major Bottleneck)
- **Exact Location:**
  - `src/app/page.tsx:5`
  - `src/app/categories/page.tsx:5`
  - `src/app/categories/[slug]/page.tsx:9`
  - `src/app/categories/[slug]/product/[productSlug]/page.tsx:7`
  - `src/app/product/[slug]/page.tsx:5`
- **Architecture Context:**  
  Every public storefront route explicitly exports:
  ```typescript
  export const dynamic = "force-dynamic";
  ```
  This instructs Next.js to completely disable static site generation (SSG) and the Full Route Data Cache.
- **Failure Scenario Under Production Traffic:**  
  Every customer visit triggers fresh server-side rendering, invoking `StorefrontService.getLandingPageBlocks()`, `CategoryService.getAllMasterCategories()`, or `ProductService.getProductBySlug()`. During marketing campaigns or traffic spikes, concurrent visitors trigger hundreds of un-cached PostgreSQL queries, overwhelming Supabase database connections and ballooning TTFB (Time to First Byte) from 50ms to 1200–2500ms.
- **Concrete Fix:**  
  Remove `export const dynamic = "force-dynamic"` from public routes. Enable Incremental Static Regeneration (ISR) with `export const revalidate = 3600;` (1 hour) or rely on on-demand cache revalidation, which is already correctly wired in `src/actions/adminActions.ts` via `revalidatePath`.

---

#### Finding 3.2: Full Catalog Scan & In-Memory Filtering on Category PLP
- **Severity:** `[Architecture]`
- **Exact Location:** `src/services/ProductService.ts:156-161`
- **Architecture Context:**  
  In `ProductService.getProductsByCategorySlug`:
  ```typescript
  public static async getProductsByCategorySlug(categorySlug: string) {
    const allProducts = await this.getProducts();
    const filtered = allProducts.filter((p) => {
      return p.category?.slug === categorySlug;
    });
  ```
  `this.getProducts()` queries the entire `products` table, joining all `product_finishes` and `product_sizes` without any `WHERE` clause.
- **Failure Scenario Under Production Traffic:**  
  When a user visits `/categories/bedroom`, the server queries all 200+ furniture products across living, dining, and storage, parses thousands of JSON media attributes, and discards 80% of the rows in Node.js memory. This causes massive memory spikes and slow database query times.
- **Concrete Fix:**  
  Push filtering down to the PostgreSQL query level using Supabase foreign table filters:
  ```typescript
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories!products_category_id_fkey!inner(name_en, slug, blueprint_type),
      finishes:product_finishes(*),
      sizes:product_sizes(*)
    `)
    .eq("is_active", true)
    .eq("category.slug", categorySlug)
    .order("created_at", { ascending: false });
  ```

---

#### Finding 3.3: Duplicate Database Queries on PDP (Missing React `cache()`)
- **Severity:** `[Architecture]`
- **Exact Location:** `src/app/categories/[slug]/product/[productSlug]/page.tsx:21, 53`
- **Architecture Context:**  
  `generateMetadata` calls `await ProductService.getProductBySlug(productSlug)`, and the page RSC calls `await ProductService.getProductBySlug(productSlug)` again. Because `getProductBySlug` uses Supabase JS client directly without React `cache()`, Next.js executes two separate full database queries per request.
- **Failure Scenario Under Production Traffic:**  
  Doubles the database load on every product view.
- **Concrete Fix:**  
  Wrap `getProductBySlug` with React's `cache` utility in `src/services/ProductService.ts`:
  ```typescript
  import { cache } from "react";
  public static getProductBySlug = cache(async (slug: string) => { ... });
  ```

---

#### Finding 3.4: Missing Database Indexes for Catalog & Filter Queries
- **Severity:** `[Architecture]`
- **Exact Location:** `supabase/migrations/001_production_schema.sql` and `003_storefront_sections_display_order.sql`
- **Architecture Context:**  
  Missing composite and foreign key indexes:
  - `public.products(sub_category_id)`: Foreign key exists, but no index exists.
  - `public.storefront_sections(is_active, display_order)`: Section queries filter by `is_active = true` and sort by `display_order`.
  - `public.categories(is_active, display_order)`: Category queries filter by `is_active` and sort by `display_order`.
  - `public.bookings(product_id)`, `bookings(finish_id)`, `bookings(size_id)`: Foreign keys exist without indexes.
- **Failure Scenario Under Production Traffic:**  
  PostgreSQL executes sequential table scans during join operations and category filtering as rows increase.
- **Concrete Fix:**  
  Add migration `004_production_indexes.sql`:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(sub_category_id);
  CREATE INDEX IF NOT EXISTS idx_storefront_active_order ON public.storefront_sections(is_active, display_order);
  CREATE INDEX IF NOT EXISTS idx_categories_active_display ON public.categories(is_active, display_order);
  CREATE INDEX IF NOT EXISTS idx_bookings_product ON public.bookings(product_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_finish ON public.bookings(finish_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_size ON public.bookings(size_id);
  ```

---

#### Finding 3.5: Redundant Database Lookup on Every Admin Navigation in Middleware
- **Severity:** `[Architecture]`
- **Exact Location:** `src/utils/supabase/middleware.ts:61-68`
- **Architecture Context:**  
  ```typescript
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();
  ```
  If `user.app_metadata.role` is not set to `"admin"`, middleware queries `public.admin_users` table on EVERY request to `/admin/*`.
- **Failure Scenario Under Production Traffic:**  
  Adds 80–150ms of database roundtrip latency to every admin page click.
- **Concrete Fix:**  
  Ensure `app_metadata.role = 'admin'` is stamped onto the user's JWT in Supabase Auth (already handled in `003_create_admin_user.sql`). Middleware can check `user.app_metadata?.role === 'admin'` synchronously without executing a SQL query.

---

#### Finding 3.6: Missing Next.js Modern Image Formats Configuration
- **Severity:** `[Suggestion]`
- **Exact Location:** `next.config.ts:3-16`
- **Architecture Context:**  
  `next.config.ts` configures `remotePatterns` for Unsplash and Supabase, but omits `formats: ['image/avif', 'image/webp']`.
- **Failure Scenario Under Production Traffic:**  
  Next.js image optimizer serves WebP or JPEG. Browsers supporting AVIF miss out on 30–50% smaller file sizes, slowing down mobile LCP times.
- **Concrete Fix:**  
  ```typescript
  const nextConfig: NextConfig = {
    images: {
      formats: ["image/avif", "image/webp"],
      remotePatterns: [
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "*.supabase.co" },
      ],
    },
  };
  ```

---

### Layer 4: Production Reliability, SEO, & Edge Cases

---

#### Finding 4.1: Missing Next.js Error Boundaries and 404 Handlers
- **Severity:** `[Blocking]`
- **Exact Location:** `src/app/`
- **Architecture Context:**  
  The application has no `error.tsx`, `global-error.tsx`, or `not-found.tsx` in `src/app/` or any subroutes.
- **Failure Scenario Under Production Traffic:**  
  - If a database query fails or a transient network error occurs during RSC rendering, Next.js crashes with a generic unstyled 500 white-screen error.
  - When `notFound()` is triggered in `/categories/[slug]` or `/categories/[slug]/product/[productSlug]`, users see the unbranded default Next.js 404 page.
- **Concrete Fix:**  
  Create `src/app/error.tsx`, `src/app/global-error.tsx`, and `src/app/not-found.tsx` with branded recovery UI and return-to-showroom links.

---

#### Finding 4.2: Information Disclosure of Raw Database Errors to Clients
- **Severity:** `[Blocking]`
- **Exact Location:** `src/actions/adminActions.ts:231`
- **Architecture Context:**  
  In `saveProductWizardAction`:
  ```typescript
  if (error instanceof Error) {
    const msg = error.message;
    // ...
    return {
      success: false,
      message: `Database / Server Error: ${msg}`,
    };
  }
  ```
- **Failure Scenario Under Production Traffic:**  
  If a PostgreSQL constraint fails or connection times out, internal SQL details, table structures, and connection hostnames are returned directly to the client browser.
- **Concrete Fix:**  
  Log raw errors on the server (`console.error`), and return generic user-safe error messages to clients:
  ```typescript
  console.error("[saveProductWizardAction] Database error:", error);
  return {
    success: false,
    message: "A database error occurred while updating the product. Please try again or contact support.",
  };
  ```

---

#### Finding 4.3: Missing Search Engine Directives (`robots.ts` & `sitemap.ts`)
- **Severity:** `[Suggestion]`
- **Exact Location:** `src/app/`
- **Architecture Context:**  
  Neither `src/app/robots.ts` nor `src/app/sitemap.ts` exists.
- **Failure Scenario Under Production Traffic:**  
  1. Search engine crawlers (Googlebot) will index `/admin`, `/admin/login`, and internal admin routes.
  2. Crawlers cannot discover dynamic product URLs (`/categories/[slug]/product/[productSlug]`), harming search ranking and organic traffic.
- **Concrete Fix:**  
  1. Create `src/app/robots.ts`:
     ```typescript
     import { MetadataRoute } from "next";
     export default function robots(): MetadataRoute.Robots {
       return {
         rules: {
           userAgent: "*",
           allow: "/",
           disallow: ["/admin/", "/api/"],
         },
         sitemap: "https://greensteelfurniture.com/sitemap.xml",
       };
     }
     ```
  2. Create `src/app/sitemap.ts` dynamically querying active categories and products from `CategoryService` and `ProductService`.

---

#### Finding 4.4: Incomplete Product Deletion Implementation in Admin UI
- **Severity:** `[Blocking]`
- **Exact Location:** `src/components/admin/ProductCatalogList.tsx:50-57`
- **Architecture Context:**  
  In `ProductCatalogList.tsx`:
  ```typescript
  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    startTransition(async () => {
      // In production calls delete action
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setToast({ success: true, message: `Product "${title}" removed from catalog.` });
    });
  };
  ```
  `handleDelete` does not invoke any Server Action! It only modifies local React state.
- **Failure Scenario Under Production Traffic:**  
  An administrator clicks "Delete Product", confirms the prompt, and sees the product disappear with a "Removed from catalog" toast. Upon page refresh, the product reappears because it was never deleted from Supabase.
- **Concrete Fix:**  
  Create `deleteProductAction(id: string)` in `src/actions/adminActions.ts` and call it inside `handleDelete`.

---

#### Finding 4.5: Hardcoded Placeholder Phone Number in WhatsApp Handoff
- **Severity:** `[Blocking]`
- **Exact Location:** `src/components/pdp/ProductDetailView.tsx:80` and `src/components/pdp/ProductConfiguration.tsx:74`
- **Architecture Context:**  
  `waUrl` is hardcoded to:
  ```typescript
  const waUrl = `https://wa.me/919437000000?text=${encodeURIComponent(waMessage)}`;
  ```
- **Failure Scenario Under Production Traffic:**  
  All customers clicking "Ask on WhatsApp" or "Reserve via WhatsApp" are sent to an inactive dummy number (`919437000000`), losing 100% of customer inquiries.
- **Concrete Fix:**  
  Replace with `process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919437059999"`.

---

#### Finding 4.6: Unhandled Failure State in Checkout Drawer
- **Severity:** `[Architecture]`
- **Exact Location:** `src/components/checkout/CheckoutDrawer.tsx:186-195`
- **Architecture Context:**  
  ```typescript
  const result = await createTokenOrder(orderPayload);
  if (result.success) {
    setConfirmedOrderId(result.orderId);
    setCurrentStep("confirmed");
  }
  ```
  If `result.success` is false, nothing happens. No error banner is set, and the user is left stuck on Step 3 with no explanation.
- **Concrete Fix:**  
  Add `checkoutError` state and display a clear red alert banner if order creation fails.

---

#### Finding 4.7: Missing iOS Home Indicator Safe Area Padding
- **Severity:** `[Suggestion]`
- **Exact Location:** `src/components/pdp/StickyMobileActionBar.tsx:37`
- **Architecture Context:**  
  Container uses `p-3` without accounting for iOS home indicator safe area insets:
  ```typescript
  className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden flex-col gap-2 bg-white/95 backdrop-blur-md p-3 border-t..."
  ```
- **Failure Scenario Under Production Traffic:**  
  On iPhone 12/13/14/15/16 models, the "Reserve for ₹500 Token" button touches or gets partially clipped by the black swipe home bar.
- **Concrete Fix:**  
  Add `pb-[max(0.75rem,env(safe-area-inset-bottom))]` to the container classes.

---

## 3. Prioritized Fix Roadmap (Implementation PRs)

### Phase 1: Security, Auth, & Data Integrity (PR #1)
> **Goal:** Close all security holes, prevent price tampering, fix RLS leaks, and ensure customer bookings persist reliably.

1. **Fix Supabase RLS Policies (`supabase/migrations/`):**
   - Restrict public SELECT on `categories`, `products`, and `storefront_sections` to `is_active = true`.
   - Maintain public INSERT on `bookings` with strict input checking.
2. **Secure Server Actions (`src/actions/`):**
   - Add `verifyAdminSession()` to `createProductBlueprintAction` or purge `adminProduct.ts`.
   - Implement server-side price lookup and `bookings` table insertion in `createTokenOrder` (`src/actions/checkout.ts`).
   - Implement `deleteProductAction` in `adminActions.ts` and wire it up to `ProductCatalogList.tsx`.
3. **Fix Auth Open Redirect & Storage Client:**
   - Sanitize `redirectTo` in `authActions.ts` and `AdminLogin.tsx`.
   - Update `StorageService.ts` to use `@/utils/supabase/client` (`@supabase/ssr`) so session cookies authenticate photo uploads.
   - Guard local filesystem writes in `LocalDataStore.ts` against serverless environments.
   - Replace placeholder WhatsApp number with production environment variable.
4. **Verification Step:**
   - Run e2e tests (`npx playwright test e2e/admin/`).
   - Verify unauthenticated users cannot call mutations or read inactive catalog items via PostgREST.

---

### Phase 2: Caching, Database Efficiency, & Memory Leaks (PR #2)
> **Goal:** Eliminate TTFB latency bottlenecks, prevent database pool exhaustion, and fix browser memory leaks.

1. **Enable Next.js Caching & ISR on Public Routes:**
   - Remove `export const dynamic = "force-dynamic"` from `src/app/page.tsx`, `categories/page.tsx`, `categories/[slug]/page.tsx`, `categories/[slug]/product/[productSlug]/page.tsx`, and `product/[slug]/page.tsx`.
   - Add `export const revalidate = 3600;` on public routes.
2. **Optimize Database Queries & Add Missing Indexes:**
   - Refactor `ProductService.getProductsByCategorySlug` to filter by category slug inside PostgreSQL rather than fetching all products and filtering in Node memory.
   - Wrap `ProductService.getProductBySlug` in React `cache()`.
   - Batch sequential `for` loop updates in `reorderStorefrontSectionsAction`.
   - Apply index migration for `products(sub_category_id)`, `storefront_sections(is_active, display_order)`, and foreign keys on `bookings`.
3. **Eliminate Browser & Component Leaks:**
   - Implement `URL.revokeObjectURL()` cleanup in `StorageService.ts` and admin photo preview components.
   - Release HTML5 canvas dimensions after compression.
   - Fix timer leaks in `TopRouteProgressBar.tsx`.
   - Add cancellation flag to pincode lookup `useEffect` in `CheckoutDrawer.tsx`.
4. **Verification Step:**
   - Measure TTFB on public pages (target < 150ms).
   - Test batch photo upload in `ProductWizard` on mobile device emulation without RAM spikes.

---

### Phase 3: Reliability, SEO, & Mobile UX Polish (PR #3)
> **Goal:** Ensure resilient error handling, perfect search engine discoverability, and flawless mobile checkout experience.

1. **Error Boundaries & 404 Handlers:**
   - Add `src/app/error.tsx`, `src/app/global-error.tsx`, and `src/app/not-found.tsx`.
   - Sanitize all database error messages returned to clients in `adminActions.ts`.
2. **SEO & Discoverability:**
   - Create `src/app/robots.ts` disallowing `/admin` and pointing to sitemap.
   - Create `src/app/sitemap.ts` dynamically indexing active categories and products.
   - Add OpenGraph and Twitter card images to `generateMetadata` on all storefront routes.
   - Inject JSON-LD Product schema on PDP.
3. **Mobile Polish & Edge Cases:**
   - Add iOS safe-area bottom padding (`env(safe-area-inset-bottom)`) to `StickyMobileActionBar.tsx`.
   - Add error banner feedback in `CheckoutDrawer.tsx` when order submission fails.
   - Add `formats: ['image/avif', 'image/webp']` to `next.config.ts`.
4. **Verification Step:**
   - Run lighthouse audit on mobile viewport (target: 95+ Performance, 100 SEO).
   - Verify `/robots.txt` and `/sitemap.xml` return valid XML/text payloads.

---
*Report generated and saved to `AUDIT_REPORT.md` on November 2026.*

