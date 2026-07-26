import "@shopify/shopify-app-react-router/adapters/node";
import { ApiVersion, AppDistribution, BillingInterval, shopifyApp } from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";

export const STARTER_PLAN = "Starter — 7 artwork checks per week";
export const PRO_PLAN = "Pro — unlimited artwork checks";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  apiVersion: ApiVersion.April26,
  scopes: (process.env.SCOPES || "read_products").split(","),
  appUrl: process.env.SHOPIFY_APP_URL!,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing: {
    [STARTER_PLAN]: { lineItems: [{ amount: 2.99, currencyCode: "GBP", interval: BillingInterval.Every30Days }] },
    [PRO_PLAN]: { lineItems: [{ amount: 5.99, currencyCode: "GBP", interval: BillingInterval.Every30Days }] },
  },
  future: { expiringOfflineAccessTokens: true },
});
export default shopify;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const registerWebhooks = shopify.registerWebhooks;
