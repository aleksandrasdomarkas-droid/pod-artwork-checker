import sharp from "sharp";

export type ArtworkReport = { width: number; height: number; format: string; hasAlpha: boolean; maxWidthInches: number; maxHeightInches: number; score: number; status: "pass" | "warning" | "fail"; issues: string[] };
const supported = new Set(["image/png", "image/jpeg", "image/webp", "image/tiff"]);

export async function analyseArtwork(input: Buffer, mimeType: string): Promise<ArtworkReport> {
  if (!supported.has(mimeType)) throw new Error("Only PNG, JPEG, WebP, and TIFF artwork is accepted.");
  const image = sharp(input, { limitInputPixels: 100_000_000, failOn: "error" });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height || !metadata.format) throw new Error("The uploaded file is not a readable image.");
  const issues: string[] = [];
  let score = 100;
  const minSide = Math.min(metadata.width, metadata.height);
  if (minSide < 1200) { score -= 45; issues.push("Low pixel dimensions may not support a detailed garment print."); }
  else if (minSide < 2400) { score -= 15; issues.push("Artwork is suitable for smaller prints; review the 300 DPI maximum size."); }
  if (mimeType === "image/jpeg") { score -= 12; issues.push("JPEG cannot preserve transparency. Use PNG for cut-out artwork."); }
  if (!metadata.hasAlpha && mimeType !== "image/jpeg") { score -= 5; issues.push("No transparency was detected; confirm that a background is intended."); }
  const status = score < 60 ? "fail" : score < 85 ? "warning" : "pass";
  return { width: metadata.width, height: metadata.height, format: metadata.format, hasAlpha: Boolean(metadata.hasAlpha), maxWidthInches: +(metadata.width / 300).toFixed(2), maxHeightInches: +(metadata.height / 300).toFixed(2), score: Math.max(0, score), status, issues };
}

export async function createPrintReadyPng(input: Buffer): Promise<Buffer> {
  return sharp(input, { limitInputPixels: 100_000_000 }).rotate().png({ compressionLevel: 9, palette: false }).toBuffer();
}

export async function removeSolidBackground(input: Buffer, background: "white" | "black"): Promise<Buffer> {
  const { data, info } = await sharp(input, { limitInputPixels: 100_000_000 }).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const matchesBackground = (pixel: number) => {
    const offset = pixel * channels;
    const [red, green, blue, alpha] = [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
    return background === "white" ? red > 238 && green > 238 && blue > 238 && alpha > 0 : red < 25 && green < 25 && blue < 25 && alpha > 0;
  };
  const enqueue = (pixel: number) => { if (!visited[pixel] && matchesBackground(pixel)) { visited[pixel] = 1; queue.push(pixel); } };
  for (let x = 0; x < width; x++) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 1; y < height - 1; y++) { enqueue(y * width); enqueue(y * width + width - 1); }
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const pixel = queue[cursor]; const x = pixel % width; const y = Math.floor(pixel / width); data[pixel * channels + 3] = 0;
    if (x > 0) enqueue(pixel - 1); if (x + 1 < width) enqueue(pixel + 1); if (y > 0) enqueue(pixel - width); if (y + 1 < height) enqueue(pixel + width);
  }
  return sharp(data, { raw: info }).png({ compressionLevel: 9 }).toBuffer();
}

export async function make300DpiPng(input: Buffer, backgroundMode: "white" | "black" | "none"): Promise<Buffer> {
  const cleaned = backgroundMode === "none" ? input : await removeSolidBackground(input, backgroundMode);
  const metadata = await sharp(cleaned).metadata();
  if (!metadata.width || !metadata.height) throw new Error("The uploaded file is not a readable image.");
  const scale = Math.min(2, 10_000 / Math.max(metadata.width, metadata.height));
  return sharp(cleaned, { limitInputPixels: 100_000_000 }).resize({ width: Math.max(1, Math.round(metadata.width * scale)), height: Math.max(1, Math.round(metadata.height * scale)), kernel: "lanczos3" }).png({ compressionLevel: 9 }).withMetadata({ density: 300 }).toBuffer();
}
