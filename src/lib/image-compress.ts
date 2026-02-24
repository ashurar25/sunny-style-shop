const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

/**
 * Compress an image file to at most `MAX_SIZE_BYTES` by
 * progressively reducing quality and dimensions.
 * Returns a base64 data-URL string.
 */
export async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  // Scale down large images first (max 1200px on longest side)
  const MAX_DIM = 1200;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Try progressively lower quality until under 1 MB
  for (let quality = 0.85; quality >= 0.3; quality -= 0.1) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/webp', quality);
    const sizeBytes = Math.round((dataUrl.length - 'data:image/webp;base64,'.length) * 0.75);

    if (sizeBytes <= MAX_SIZE_BYTES) {
      bitmap.close();
      return dataUrl;
    }

    // Also try shrinking dimensions further
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
  }

  // Final fallback — very small
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/webp', 0.3);
}
