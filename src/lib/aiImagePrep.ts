/**
 * Client-Side Image Pre-Compressor for Groq Vision AI
 * 
 * Prepares user-selected furniture photos for instant 4G transmission:
 * - Scales down offscreen so longest side <= 800px preserving aspect ratio.
 * - Compresses to JPEG at 0.72 quality (~50–90 KB payload).
 * - Strictly prevents memory leaks by releasing canvas buffers and revoking Object URLs.
 */

export async function compressImageForAI(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  const canvas = document.createElement("canvas");

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to decode image file for AI analysis."));
      image.src = objectUrl;
    });

    const maxDimension = 800;
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not acquire 2D canvas context for image scaling.");
    }

    // High quality downscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    // Explicit buffer release to prevent mobile/tablet memory leaks
    canvas.width = 0;
    canvas.height = 0;
    URL.revokeObjectURL(objectUrl);
  }
}

