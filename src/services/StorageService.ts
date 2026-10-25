import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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

    // Graceful fallback to persistent base64 dataUrl if Supabase is unconfigured
    if (!this.isConfigured()) {
      return {
        publicUrl: dataUrl || objectUrl,
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
        console.warn("Supabase Storage upload warning, falling back to local preview:", uploadError.message);
        return {
          publicUrl: dataUrl || objectUrl,
          path,
          isFallback: true,
          sizeKb: compressedSizeKb,
        };
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
      console.warn("Storage upload exception, using local preview:", err);
      return {
        publicUrl: dataUrl || objectUrl,
        path,
        isFallback: true,
        sizeKb: compressedSizeKb,
      };
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
      return {
        publicUrl: dataUrl || objectUrl,
        path,
        isFallback: true,
        sizeKb: compressedSizeKb,
      };
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, blob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) {
        return {
          publicUrl: dataUrl || objectUrl,
          path,
          isFallback: true,
          sizeKb: compressedSizeKb,
        };
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
    } catch {
      return {
        publicUrl: dataUrl || objectUrl,
        path,
        isFallback: true,
        sizeKb: compressedSizeKb,
      };
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

