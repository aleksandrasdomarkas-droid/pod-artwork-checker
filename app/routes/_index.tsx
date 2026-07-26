import { redirect } from "react-router";
import type { Route } from "./+types/_index";

// Shopify opens an embedded app at its configured root URL. Keep the signed
// App Bridge query parameters while routing it to the authenticated dashboard.
export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  return redirect(`/app${url.search}`);
};

export default function Index() {
  return null;
}
