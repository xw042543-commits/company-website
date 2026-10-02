import type { Metadata } from "next";
import { resolvePublicIndexing } from "@/lib/public-indexing";
import "./globals.css";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const publicIndexing = resolvePublicIndexing(process.env);
  return {
    metadataBase: new URL(publicIndexing.origin),
    title: "洋豆角留学｜留学规划与院校查询 | UDAJO",
    description: "洋豆角留学（洋豆角教育）提供留学院校与专业查询、留学规划、申请咨询及留学全周期服务。",
    robots: { index: publicIndexing.enabled, follow: publicIndexing.enabled },
  };
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
