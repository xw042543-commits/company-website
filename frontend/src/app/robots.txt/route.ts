import { buildRobotsText, resolvePublicIndexing } from "@/lib/public-indexing";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(buildRobotsText(resolvePublicIndexing(process.env)), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
