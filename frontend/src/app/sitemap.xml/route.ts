import { buildSitemapXml, resolvePublicIndexing } from "@/lib/public-indexing";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(buildSitemapXml(resolvePublicIndexing(process.env)), {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
