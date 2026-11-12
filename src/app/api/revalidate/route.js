import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

const SAFE_TAG = /^(site:[0-9a-f-]{36}|catalog:[0-9a-f-]{36}|page:[0-9a-f-]{36}:[a-z0-9-]+|host:[a-z0-9.-]+|page-host:[a-z0-9.-]+:[a-z0-9-]+)$/;

function matchesSecret(request) {
  const configured = process.env.STOREFRONT_REVALIDATE_SECRET || "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!configured || configured.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(configured), Buffer.from(supplied));
}

export async function POST(request) {
  if (!matchesSecret(request)) return Response.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const tags = Array.isArray(body.tags) ? [...new Set(body.tags)].slice(0, 20) : [];
  if (!tags.length || tags.some((tag) => typeof tag !== "string" || !SAFE_TAG.test(tag))) {
    return Response.json({ detail: "Invalid tags" }, { status: 400 });
  }
  tags.forEach((tag) => revalidateTag(tag, "max"));
  return Response.json({ revalidated: tags });
}
