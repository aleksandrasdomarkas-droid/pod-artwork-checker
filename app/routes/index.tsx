import { redirect } from "react-router";
import type { Route } from "./+types/index";
export const loader = async ({ request }: Route.LoaderArgs) => { const url = new URL(request.url); const shop = url.searchParams.get("shop"); return shop ? redirect(`/app?shop=${encodeURIComponent(shop)}`) : new Response("Missing shop parameter", { status: 400 }); };
export default function Index() { return null; }
