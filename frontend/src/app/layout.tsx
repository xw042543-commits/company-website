import type { Metadata } from "next";
import { resolvePublicIndexing } from "@/lib/public-indexing";
import "./globals.css";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const publicIndexing = resolvePublicIndexing(process.env);
  return {
    metadataBase: new URL(publicIndexing.origin),
    title: "UDAJO | 洋豆角",
    description: "UDAJO full-cycle international student services | 洋豆角留学生全周期服务",
    robots: { index: publicIndexing.enabled, follow: publicIndexing.enabled },
  };
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
