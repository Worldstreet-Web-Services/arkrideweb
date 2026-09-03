import type { UploadedFile } from "../../types";

const MAX_DIMENSION = 1280; // longest edge after downscale
const JPEG_QUALITY = 0.7;

/**
 * Turns a picked File into an UploadedFile with a preview data URL.
 * Images are downscaled/re-encoded to JPEG so previews stay small enough to
 * survive localStorage; PDFs are stored as-is.
 */
export async function processFile(file: File): Promise<UploadedFile> {
  if (file.type.startsWith("image/")) {
    const dataUrl = await downscaleImage(file);
    return { name: file.name, type: "image/jpeg", size: file.size, dataUrl };
  }
  const dataUrl = await readAsDataUrl(file);
  return { name: file.name, type: file.type, size: file.size, dataUrl };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function downscaleImage(file: File): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl; // fallback: original
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
