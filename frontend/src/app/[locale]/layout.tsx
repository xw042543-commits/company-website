import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isLocale, words } from "@/lib/site";
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <div lang={locale === "zh" ? "zh-CN" : "en"}>
    <a href="#main" className="skip-link">{words(locale, "跳至主要内容", "Skip to main content")}</a>
    <div className="preview-strip">{words(locale, "页面线框预览 · 非正式上线网站", "Wireframe preview · Not a live service")} <Link href={`/${locale}/review`}>{words(locale, "查看组件状态", "Review component states")} →</Link></div>
    <Suspense fallback={<div className="container">洋豆角</div>}><SiteHeader locale={locale} /></Suspense>
    {children}
    <footer className="site-footer container"><strong>洋豆角</strong><p>{words(locale, "页尾内容及联系资料待提供。", "Footer content and contact details are awaiting approval.")}</p></footer>
  </div>;
}
