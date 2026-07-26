import type { HeadersFunction } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import type { Route } from "./+types/app";
import { authenticate } from "../shopify.server";
export const loader = async ({ request }: Route.LoaderArgs) => { await authenticate.admin(request); return { apiKey: process.env.SHOPIFY_API_KEY || "" }; };
export default function AppLayout() { const { apiKey } = useLoaderData<typeof loader>(); return <AppProvider embedded apiKey={apiKey}><s-app-nav><s-link href="/app">Artwork checker</s-link><s-link href="/app/upload">New check</s-link><s-link href="/app/pricing">Plans & billing</s-link></s-app-nav><Outlet/></AppProvider>; }
export function ErrorBoundary() { return boundary.error(useRouteError()); }
export const headers: HeadersFunction = (args) => boundary.headers(args);
