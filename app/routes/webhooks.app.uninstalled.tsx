import type { Route } from "./+types/webhooks.app.uninstalled";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
export const action = async ({ request }: Route.ActionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);
  if (topic !== "APP_UNINSTALLED") return new Response("Unexpected topic", { status: 400 });
  await prisma.$transaction([prisma.session.deleteMany({ where: { shop } }), prisma.artwork.deleteMany({ where: { shop } }), prisma.usageEvent.deleteMany({ where: { shop } })]);
  return new Response(null, { status: 200 });
};
