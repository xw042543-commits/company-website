"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { PageMotion } from "@/components/page-motion";
import { SiteHeader } from "@/components/site-header";
import { companyProfile } from "@/data/company-profile";
import { type Locale, words } from "@/lib/site";

export function SiteChrome({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPortal = pathname === `/${locale}/login`;
  const language = locale === "zh" ? "zh-CN" : "en";

  if (isLoginPortal) return <div lang={language}>
    <a href="#main" className="skip-link">{words(locale, "跳至主要内容", "Skip to main content")}</a>
    {children}
  </div>;

  return <div lang={language}>
    <a href="#main" className="skip-link">{words(locale, "跳至主要内容", "Skip to main content")}</a>
    <PageMotion />
    <Suspense fallback={<div className="container header-fallback">UDAJO</div>}><SiteHeader locale={locale} /></Suspense>
    {children}
    <footer className="site-footer"><div className="container footer-grid">
      <div className="footer-brand"><strong>UDAJO</strong><span>洋豆角</span></div>
      <p>{words(locale, "清晰规划留学选择，逐步走向适合你的院校。", "Clear study planning, one practical step at a time.")}</p>
      <p className="footer-note"><a href={`https://${companyProfile.domain}`}>{companyProfile.domain}</a><br /><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></p>
    </div></footer>
  </div>;
}
