import type { Metadata } from "next";
import { resolvePublicIndexing } from "@/lib/public-indexing";
import "./globals.css";

export function generateMetadata(): Metadata {
  const publicIndexing = resolvePublicIndexing(process.env);
  return {
    metadataBase: new URL(publicIndexing.origin),
    title: "UDAJO | 洋豆角",
    description: "UDAJO study planning and university search | 洋豆角留学规划与院校查询",
    robots: { index: publicIndexing.enabled, follow: publicIndexing.enabled },
  };
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
