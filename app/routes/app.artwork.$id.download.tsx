import type { Route } from "./+types/app.artwork.$id.download";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { readUpload } from "../services/storage.server";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { session } = await authenticate.admin(request);
  const artwork = await prisma.artwork.findFirst({ where: { id: params.id, shop: session.shop } });
  if (!artwork?.processedKey) throw new Response("Print-ready artwork not found.", { status: 404 });
  const bytes = await readUpload(session.shop, artwork.processedKey);
  const filename = artwork.filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_") + "-print-ready.png";
  return new Response(bytes, { headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" } });
};
