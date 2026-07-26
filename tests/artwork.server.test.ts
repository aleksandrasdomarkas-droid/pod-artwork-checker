import { describe, expect, it } from "vitest";
import { analyseArtwork } from "../app/services/artwork.server";
const transparentPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLx6AAAAABJRU5ErkJggg==", "base64");
describe("analyseArtwork", () => {
  it("reports dimensions and warns on tiny artwork", async () => { const result = await analyseArtwork(transparentPng, "image/png"); expect(result.width).toBe(1); expect(result.hasAlpha).toBe(true); expect(result.status).toBe("fail"); });
  it("rejects unsupported formats", async () => { await expect(analyseArtwork(Buffer.from("not an image"), "application/pdf")).rejects.toThrow("Only PNG"); });
});
