import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/app._index";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
export const loader = async ({ request }: Route.LoaderArgs) => { const { session } = await authenticate.admin(request); return { artworks: await prisma.artwork.findMany({ where: { shop: session.shop }, orderBy: { createdAt: "desc" }, take: 10 }) }; };
export default function Home() { const { artworks } = useLoaderData<typeof loader>(); return <s-page heading="Artwork checker"><s-button slot="primary-action" href="/app/upload">Check artwork</s-button><s-section heading="Recent checks"><s-stack direction="block" gap="base">{artworks.length ? artworks.map((a: { id: string; filename: string; score: number; status: string }) => <s-box key={a.id} border="base" padding="base"><strong>{a.filename}</strong> — {a.score}/100 · {a.status}</s-box>) : <s-paragraph>No checks yet. Upload an artwork file to begin.</s-paragraph>}</s-stack></s-section></s-page>; }
