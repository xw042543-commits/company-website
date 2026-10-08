import type { Metadata } from "next";
import { chineseBrandMetadata } from "@/lib/brand-metadata";
import { resolvePublicIndexing } from "@/lib/public-indexing";
import "./globals.css";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const publicIndexing = resolvePublicIndexing(process.env);
  return {
    metadataBase: new URL(publicIndexing.origin),
    title: chineseBrandMetadata.title,
    keywords: chineseBrandMetadata.keywords,
    description: chineseBrandMetadata.description,
    robots: { index: publicIndexing.enabled, follow: publicIndexing.enabled },
  };
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
