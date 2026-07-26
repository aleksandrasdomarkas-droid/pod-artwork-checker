import { Form, useActionData } from "react-router";
import type { Route } from "./+types/app.upload";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { analyseArtwork, make300DpiPng } from "../services/artwork.server";
import { saveUpload } from "../services/storage.server";
import { PrintReadyDownload } from "../components/PrintReadyDownload";
import { planLabel, resolvePlan, WEEKLY_LIMIT } from "../services/plan.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const form = await request.formData(); const file = form.get("artwork");
  const backgroundMode = form.get("backgroundMode") === "black" ? "black" : form.get("backgroundMode") === "white" ? "white" : "none";
  const makePrintReady = form.get("makePrintReady") === "on";
  if (!(file instanceof File) || !file.size) return { error: "Choose an artwork file." };
  const max = Number(process.env.MAX_UPLOAD_BYTES || 26214400);
  if (file.size > max) return { error: "File exceeds the 25 MB upload limit." };
  const plan = await resolvePlan(billing);
  const usedThisWeek = await prisma.usageEvent.count({ where: { shop: session.shop, type: "analysis", createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } });
  if (usedThisWeek >= WEEKLY_LIMIT[plan]) return { error: `${planLabel(plan)} plan limit reached (${WEEKLY_LIMIT[plan]} artwork check${WEEKLY_LIMIT[plan] === 1 ? "" : "s"} per week). Choose a plan to continue.` };
  try { const bytes = Buffer.from(await file.arrayBuffer()); const report = await analyseArtwork(bytes, file.type); const originalKey = await saveUpload(session.shop, file.name, bytes); const processedKey = makePrintReady ? await saveUpload(session.shop, `${file.name.replace(/\.[^.]+$/, "")}-print-ready.png`, await make300DpiPng(bytes, backgroundMode)) : undefined; const artwork = await prisma.artwork.create({ data: { shop: session.shop, originalKey, processedKey, filename: file.name, mimeType: file.type, bytes: file.size, width: report.width, height: report.height, hasAlpha: report.hasAlpha, score: report.score, status: report.status, report } }); await prisma.usageEvent.create({ data: { shop: session.shop, type: "analysis" } }); return { artwork }; } catch (error) { return { error: error instanceof Error ? error.message : "Upload failed." }; }
};
export default function Upload() {
  const data = useActionData<typeof action>();
  const artwork = data && "artwork" in data ? data.artwork : undefined;
  const report = artwork?.report as { maxWidthInches: number; maxHeightInches: number; issues: string[] } | undefined;
  return <s-page heading="Check artwork"><s-section heading="Upload"><Form method="post" encType="multipart/form-data"><s-stack direction="block" gap="base"><input required name="artwork" type="file" accept="image/png,image/jpeg,image/webp,image/tiff"/><s-paragraph>PNG, JPEG, WebP or TIFF. Maximum 25 MB.</s-paragraph><label><input name="makePrintReady" type="checkbox" defaultChecked/> Create print-ready PNG: enlarge up to 2× and set 300 DPI</label><label>Make background transparent: <select name="backgroundMode" defaultValue="none"><option value="none">Keep background</option><option value="white">Remove white / near-white background</option><option value="black">Remove black / near-black background</option></select></label><s-paragraph>Use the black option for a logo on a solid black background. The tool removes only matching background connected to the image edge, protecting dark details inside the logo. Existing transparency is preserved.</s-paragraph><s-button type="submit" variant="primary">Analyse artwork</s-button></s-stack></Form></s-section>{data && "error" in data && <s-banner tone="critical">{data.error}</s-banner>}{artwork && report && <s-section heading="Result"><s-heading>{artwork.score}/100 — {artwork.status}</s-heading><s-paragraph>{artwork.width} × {artwork.height} px · transparency: {artwork.hasAlpha ? "yes" : "no"}</s-paragraph><s-paragraph>Maximum at 300 DPI: {report.maxWidthInches} × {report.maxHeightInches} inches.</s-paragraph>{report.issues.map(issue => <s-paragraph key={issue}>• {issue}</s-paragraph>)}{artwork.processedKey && <PrintReadyDownload artworkId={artwork.id} filename={`${artwork.filename.replace(/\.[^.]+$/, "")}-print-ready.png`}/>}</s-section>}</s-page>;
}
