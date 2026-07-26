export type PlanKey = "free" | "starter" | "pro";
export const WEEKLY_LIMIT: Record<PlanKey, number> = { free: 1, starter: 7, pro: Number.POSITIVE_INFINITY };
export function planLabel(plan: PlanKey) { return plan === "pro" ? "Pro" : plan === "starter" ? "Starter" : "Free"; }
