import { notFound } from "next/navigation";
import { resolveWebsite } from "@/lib/tenant/resolveWebsite";
import { loadTemplate } from "@/templates/registry";

export default async function StorefrontLayout({ children, params }) {
  const { hostname } = await params;
  const website = await resolveWebsite(hostname);
  if (!website) notFound();
  const { Layout } = await loadTemplate(website);
  return <Layout website={website}>{children}</Layout>;
}
