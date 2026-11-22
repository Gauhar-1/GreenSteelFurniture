import { createClient as getSupabaseBrowserClient } from "@/utils/supabase/client";

export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  objectUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export interface UploadResult {
  publicUrl: string;
  path: string;
  isFallback: boolean;
  sizeKb: number;
}

export class StorageService {
  private static readonly BUCKET_NAME = "furniture-media";
  private static readonly MAX_WIDTH = 1600;
  private static readonly QUALITY = 0.82;

  /**
   * Checks whether Supabase is properly configured with live environment variables
   */
  public static isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes("placeholder-project"));
  }

  /**
   * Compresses any phone or desktop image into a lightweight .webp file using HTML5 Canvas
   * Max width: 1600px, quality: 0.82
   */
  public static async compressImage(
    file: File | Blob,
    maxWidth = StorageService.MAX_WIDTH,
    quality = StorageService.QUALITY
  ): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      // Handle server-side or non-browser environments safely
      if (typeof window === "undefined" || typeof document === "undefined") {
        const dummyUrl = typeof file === "object" ? "" : "";
        resolve({
          blob: file as Blob,
          dataUrl: dummyUrl,
          objectUrl: dummyUrl,
          originalSizeKb: Math.round(file.size / 1024),
          compressedSizeKb: Math.round(file.size / 1024),
        });
        return;
      }

      const originalSizeKb = Math.round(file.size / 1024);
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // Scale down if width exceeds maxWidth
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Unable to obtain 2D canvas context for compression."));
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Export as webp (fallback to jpeg if webp unsupported)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Image compression canvas blob generation failed."));
                return;
              }

              const objectUrl = URL.createObjectURL(blob);
              const dataUrl = canvas.toDataURL("image/webp", quality);
              const compressedSizeKb = Math.round(blob.size / 1024);

              resolve({
                blob,
                dataUrl,
                objectUrl,
                originalSizeKb,
                compressedSizeKb,
              });
            },
            "image/webp",
            quality
          );
        };

        img.onerror = () => reject(new Error("Failed to load image file into Image object."));
        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error("Failed to read file as data URL."));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Uploads compressed product finish photo:
   * Path: products/{productSlug}/{finishName}/{slotName}.webp
   */
  public static async uploadProductMedia(
    file: File | Blob,
    options: {
      productSlug: string;
      finishName: string;
      slotName: string; // 'lifestyle' | 'front' | 'functional' | 'macro'
    }
  ): Promise<UploadResult> {
    const { blob, dataUrl, objectUrl, compressedSizeKb } = await this.compressImage(file);

    const cleanProduct = options.productSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const cleanFinish = options.finishName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const cleanSlot = options.slotName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const path = `products/${cleanProduct}/${cleanFinish}/${cleanSlot}.webp`;

    // In unconfigured development mode, return temporary object URL (never base64)
    if (!this.isConfigured()) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Supabase Storage is unconfigured in production environment.");
      }
      return {
        publicUrl: objectUrl || dataUrl,
        path,
        isFallback: true,
        sizeKb: compressedSizeKb,
      };
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, blob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        console.error("[StorageService] Supabase upload failed:", uploadError.message);
        throw new Error(`Supabase Storage upload failed: ${uploadError.message}. Base64 fallback is disabled to prevent database bloat.`);
      }

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(path);

      return {
        publicUrl: urlData.publicUrl,
        path,
        isFallback: false,
        sizeKb: compressedSizeKb,
      };
    } catch (err) {
      console.error("[StorageService] Upload exception:", err);
      throw err instanceof Error ? err : new Error("Failed to upload media to Supabase Storage.");
    }
  }

  /**
   * Uploads compressed storefront media:
   * Path: storefront/{sectionKey}/{timestamp}.webp
   */
  public static async uploadStorefrontMedia(
    file: File | Blob,
    sectionKey: string
  ): Promise<UploadResult> {
    const { blob, dataUrl, objectUrl, compressedSizeKb } = await this.compressImage(file);

    const cleanSection = sectionKey.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const timestamp = Date.now();
    const path = `storefront/${cleanSection}/${timestamp}.webp`;

    if (!this.isConfigured()) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Supabase Storage is unconfigured in production environment.");
      }
      return {
        publicUrl: objectUrl || dataUrl,
        path,
        isFallback: true,
        sizeKb: compressedSizeKb,
      };
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, blob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        console.error("[StorageService] Storefront upload failed:", uploadError.message);
        throw new Error(`Storefront storage upload failed: ${uploadError.message}. Base64 fallback is disabled to prevent database bloat.`);
      }

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(path);

      return {
        publicUrl: urlData.publicUrl,
        path,
        isFallback: false,
        sizeKb: compressedSizeKb,
      };
    } catch (err) {
      console.error("[StorageService] Storefront upload exception:", err);
      throw err instanceof Error ? err : new Error("Failed to upload storefront media to Supabase Storage.");
    }
  }

  /**
   * Uploads compressed review / portfolio media:
   * Path: reviews/{clientType}/{timestamp}.webp
   */
  public static async uploadReviewMedia(
    file: File | Blob,
    clientType: string = "general"
  ): Promise<UploadResult> {
    const { blob, dataUrl, objectUrl, compressedSizeKb } = await this.compressImage(file);

    const cleanType = clientType.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const path = `reviews/${cleanType}/${timestamp}_${randomSuffix}.webp`;

    if (!this.isConfigured()) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Supabase Storage is unconfigured in production environment.");
      }
      return {
        publicUrl: objectUrl || dataUrl,
        path,
        isFallback: true,
        sizeKb: compressedSizeKb,
      };
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, blob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        console.error("[StorageService] Review upload failed:", uploadError.message);
        throw new Error(`Review storage upload failed: ${uploadError.message}. Base64 fallback is disabled to prevent database bloat.`);
      }

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(path);

      return {
        publicUrl: urlData.publicUrl,
        path,
        isFallback: false,
        sizeKb: compressedSizeKb,
      };
    } catch (err) {
      console.error("[StorageService] Review upload exception:", err);
      throw err instanceof Error ? err : new Error("Failed to upload review media to Supabase Storage.");
    }
  }

  /**
   * Extracts the internal relative file path from a Supabase Storage public or signed URL.
   * Returns null if the URL is not a Supabase storage asset or is a local asset.
   */
  public static extractStoragePath(url: string, bucket = StorageService.BUCKET_NAME): string | null {
    if (!url || typeof url !== "string") return null;
    if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) return null;

    const marker = `/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const raw = url.substring(idx + marker.length);
      return decodeURIComponent(raw.split("?")[0].split("#")[0]);
    }

    return null;
  }

  /**
   * Deletes a media file from Supabase storage by its public URL.
   * Gracefully ignores local, static, or non-storage URLs.
   */
  public static async deleteMediaByUrl(url: string, bucket = StorageService.BUCKET_NAME): Promise<boolean> {
    const path = this.extractStoragePath(url, bucket);
    if (!path) return false;

    if (!this.isConfigured()) return true;

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) {
        console.warn(`[StorageService] Warning removing file '${path}':`, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn(`[StorageService] Storage removal exception for '${path}':`, err);
      return false;
    }
  }
}

