import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";

/**
 * Upload an image file to Cloud Storage and return the public URL.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "webp";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Upload a compressed image blob to Cloud Storage.
 */
export async function uploadProductImageBlob(blob: Blob, name?: string): Promise<string> {
  const fileName = name || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, blob, {
    contentType: blob.type || "image/webp",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Compress image and return as Blob (not base64).
 */
export async function compressImageToBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  const MAX_DIM = 1200;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  for (let quality = 0.85; quality >= 0.3; quality -= 0.1) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/webp",
        quality
      );
    });

    if (blob.size <= 1 * 1024 * 1024) {
      bitmap.close();
      return blob;
    }

    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/webp",
      0.3
    );
  });
}
