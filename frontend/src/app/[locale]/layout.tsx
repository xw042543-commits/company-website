import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isLocale, words } from "@/lib/site";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <div lang={locale === "zh" ? "zh-CN" : "en"}>
    <a href="#main" className="skip-link">{words(locale, "跳至主要内容", "Skip to main content")}</a>
    <Suspense fallback={<div className="container header-fallback">UDAJO</div>}><SiteHeader locale={locale} /></Suspense>
    {children}
    <footer className="site-footer"><div className="container footer-grid">
      <div className="footer-brand"><strong>UDAJO</strong><span>洋豆角</span></div>
      <p>{words(locale, "清晰规划留学选择，逐步走向适合你的院校。", "Clear study planning, one practical step at a time.")}</p>
      <p className="footer-note">{words(locale, "联系资料确认后将在此发布。", "Contact details will be published after approval.")}</p>
    </div></footer>
  </div>;
}
