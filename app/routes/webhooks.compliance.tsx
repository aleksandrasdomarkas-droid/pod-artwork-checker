import type { Route } from "./+types/webhooks.compliance";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
export const action = async ({ request }: Route.ActionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);
  // No customer data is retained. Shop-wide data is deleted on shop/redact.
  if (topic === "SHOP_REDACT") await prisma.$transaction([prisma.session.deleteMany({ where: { shop } }), prisma.artwork.deleteMany({ where: { shop } }), prisma.usageEvent.deleteMany({ where: { shop } })]);
  return new Response(null, { status: 200 });
};
