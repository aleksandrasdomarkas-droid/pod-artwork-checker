import { Form, useLoaderData } from "react-router";
import type { Route } from "./+types/app.pricing";
import { authenticate } from "../shopify.server";
import { PRO_PLAN, STARTER_PLAN } from "../shopify.server";
import { resolvePlan } from "../services/plan.server";
import { planLabel, WEEKLY_LIMIT } from "../services/plan.shared";
import { prisma } from "../db.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const plan = await resolvePlan(billing);
  const used = await prisma.usageEvent.count({ where: { shop: session.shop, type: "analysis", createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } });
  return { plan, used, limit: WEEKLY_LIMIT[plan] };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { billing } = await authenticate.admin(request);
  const form = await request.formData(); const choice = form.get("plan");
  if (choice !== "starter" && choice !== "pro") return new Response("Invalid plan.", { status: 400 });
  await billing.request({ plan: choice === "starter" ? STARTER_PLAN : PRO_PLAN, isTest: process.env.NODE_ENV !== "production", returnUrl: `${process.env.SHOPIFY_APP_URL}/app/pricing` });
};

export default function Pricing() {
  const { plan, used, limit } = useLoaderData<typeof loader>();
  const usage = Number.isFinite(limit) ? `${used} of ${limit} used this week` : `${used} used this week`;
  return <s-page heading="Plans & billing"><s-section heading={`Current plan: ${planLabel(plan)}`}><s-paragraph>{usage}</s-paragraph></s-section><s-section heading="Choose a plan"><s-stack direction="block" gap="base"><s-box border="base" padding="base"><s-heading>Free</s-heading><s-paragraph>1 artwork check per week. £0/month.</s-paragraph></s-box><s-box border="base" padding="base"><s-heading>Starter</s-heading><s-paragraph>7 artwork checks per week. £2.99/month.</s-paragraph><Form method="post"><input type="hidden" name="plan" value="starter"/><button type="submit">Choose Starter</button></Form></s-box><s-box border="base" padding="base"><s-heading>Pro</s-heading><s-paragraph>Unlimited artwork checks. £5.99/month.</s-paragraph><Form method="post"><input type="hidden" name="plan" value="pro"/><button type="submit">Choose Pro</button></Form></s-box></s-stack></s-section></s-page>;
}
