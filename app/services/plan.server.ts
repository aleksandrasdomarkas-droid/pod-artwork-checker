import { PRO_PLAN, STARTER_PLAN } from "../shopify.server";
import type { PlanKey } from "./plan.shared";
export { planLabel, WEEKLY_LIMIT } from "./plan.shared";

export async function resolvePlan(billing: { check: Function }): Promise<PlanKey> {
  const result = await billing.check({ plans: [STARTER_PLAN, PRO_PLAN], isTest: process.env.NODE_ENV !== "production" });
  const activeNames = new Set(result.appSubscriptions.map((subscription: { name: string }) => subscription.name));
  if (activeNames.has(PRO_PLAN)) return "pro";
  if (activeNames.has(STARTER_PLAN)) return "starter";
  return "free";
}
