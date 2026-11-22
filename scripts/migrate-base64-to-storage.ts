import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or API key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = "furniture-media";

/**
 * Uploads a Base64 data URI to Supabase Storage and returns the public HTTPS URL
 */
async function uploadBase64Image(dataUri: string, targetPath: string): Promise<string> {
  const matches = dataUri.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 data URI string format");
  }

  const contentType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(targetPath, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed for ${targetPath}: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(targetPath);
  return data.publicUrl;
}

/**
 * Recursively scans an object for data:image/ strings and replaces them with uploaded URLs
 */
async function cleanObjectBase64(
  obj: unknown,
  prefix: string,
  counter: { count: number }
): Promise<unknown> {
  if (typeof obj === "string") {
    if (obj.startsWith("data:image/")) {
      counter.count++;
      const targetPath = `migrated/${prefix}_${Date.now()}_${counter.count}.webp`;
      const uploadedUrl = await uploadBase64Image(obj, targetPath);
      console.log(`  ✓ Migrated Base64 image -> ${uploadedUrl}`);
      return uploadedUrl;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    const newArr: unknown[] = [];
    for (let i = 0; i < obj.length; i++) {
      newArr.push(await cleanObjectBase64(obj[i], `${prefix}_arr${i}`, counter));
    }
    return newArr;
  }

  if (obj !== null && typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      newObj[k] = await cleanObjectBase64(v, `${prefix}_${k}`, counter);
    }
    return newObj;
  }

  return obj;
}

async function main() {
  console.log("===============================================================");
  console.log("  GREEN STEEL FURNITURE — BASE64 TO STORAGE MIGRATION RUNNER");
  console.log("===============================================================");
  let totalMigrated = 0;

  // 1. MIGRATING CATEGORIES
  console.log("\n1. Scanning 'categories' table...");
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name_en, cover_image");

  if (catError) {
    console.warn("  Could not query categories:", catError.message);
  } else if (categories) {
    for (const cat of categories) {
      if (cat.cover_image && cat.cover_image.startsWith("data:image/")) {
        try {
          const path = `migrated/categories/${cat.id}.webp`;
          const newUrl = await uploadBase64Image(cat.cover_image, path);
          await supabase
            .from("categories")
            .update({ cover_image: newUrl })
            .eq("id", cat.id);
          console.log(`  ✓ Updated Category "${cat.name_en}" (${cat.id})`);
          totalMigrated++;
        } catch (err) {
          console.error(`  ✗ Failed migrating category ${cat.id}:`, err);
        }
      }
    }
  }

  // 2. MIGRATING PRODUCT FINISHES
  console.log("\n2. Scanning 'product_finishes' table...");
  const { data: finishes, error: finError } = await supabase
    .from("product_finishes")
    .select("id, finish_name, media");

  if (finError) {
    console.warn("  Could not query product_finishes:", finError.message);
  } else if (finishes) {
    for (const fin of finishes) {
      let needsUpdate = false;
      const media = fin.media as Record<string, string>;
      if (media && typeof media === "object") {
        for (const [slot, val] of Object.entries(media)) {
          if (typeof val === "string" && val.startsWith("data:image/")) {
            try {
              const path = `migrated/finishes/${fin.id}_${slot}.webp`;
              const newUrl = await uploadBase64Image(val, path);
              media[slot] = newUrl;
              needsUpdate = true;
              totalMigrated++;
            } catch (err) {
              console.error(`  ✗ Failed migrating finish media ${fin.id} [${slot}]:`, err);
            }
          }
        }
        if (needsUpdate) {
          await supabase
            .from("product_finishes")
            .update({ media })
            .eq("id", fin.id);
          console.log(`  ✓ Updated Product Finish "${fin.finish_name}" (${fin.id})`);
        }
      }
    }
  }

  // 3. MIGRATING STOREFRONT SECTIONS
  console.log("\n3. Scanning 'storefront_sections' table...");
  const { data: sections, error: secError } = await supabase
    .from("storefront_sections")
    .select("id, section_key, content");

  if (secError) {
    console.warn("  Could not query storefront_sections:", secError.message);
  } else if (sections) {
    for (const sec of sections) {
      const counter = { count: 0 };
      const cleaned = (await cleanObjectBase64(
        sec.content,
        `storefront_${sec.section_key}`,
        counter
      )) as Record<string, unknown>;

      if (counter.count > 0) {
        await supabase
          .from("storefront_sections")
          .update({ content: cleaned })
          .eq("id", sec.id);
        console.log(
          `  ✓ Updated Storefront Section "${sec.section_key}" (${counter.count} images migrated)`
        );
        totalMigrated += counter.count;
      }
    }
  }

  // 4. MIGRATING CLIENT REVIEWS
  console.log("\n4. Scanning 'client_reviews' table...");
  const { data: reviews, error: revError } = await supabase
    .from("client_reviews")
    .select("id, client_name, media_urls");

  if (revError) {
    console.warn("  Could not query client_reviews:", revError.message);
  } else if (reviews) {
    for (const rev of reviews) {
      const urls = (rev.media_urls as string[]) || [];
      let needsUpdate = false;
      const updatedUrls: string[] = [];

      for (let i = 0; i < urls.length; i++) {
        const u = urls[i];
        if (typeof u === "string" && u.startsWith("data:image/")) {
          try {
            const path = `migrated/reviews/${rev.id}_${i}.webp`;
            const newUrl = await uploadBase64Image(u, path);
            updatedUrls.push(newUrl);
            needsUpdate = true;
            totalMigrated++;
          } catch (err) {
            console.error(`  ✗ Failed migrating review image ${rev.id} [${i}]:`, err);
            updatedUrls.push(u);
          }
        } else {
          updatedUrls.push(u);
        }
      }

      if (needsUpdate) {
        await supabase
          .from("client_reviews")
          .update({ media_urls: updatedUrls })
          .eq("id", rev.id);
        console.log(`  ✓ Updated Review "${rev.client_name}" (${rev.id})`);
      }
    }
  }

  console.log("\n===============================================================");
  console.log(`  MIGRATION COMPLETE: ${totalMigrated} Base64 image(s) converted to Storage.`);
  console.log("===============================================================");
}

main().catch((err) => {
  console.error("Migration failed with fatal exception:", err);
  process.exit(1);
});

