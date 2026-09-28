"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageMotion } from "@/components/page-motion";
import { SiteHeader } from "@/components/site-header";
import { companyProfile } from "@/data/company-profile";
import { type Locale, words } from "@/lib/site";

export function SiteChrome({ locale, signedIn, children }: { locale: Locale; signedIn: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPortal = [`/${locale}/login`, `/${locale}/register`, `/${locale}/forgot-password`].includes(pathname);
  const language = locale === "zh" ? "zh-CN" : "en";

  if (isAuthPortal) return <div lang={language}>
    <a href="#main" className="skip-link">{words(locale, "跳至主要内容", "Skip to main content")}</a>
    {children}
  </div>;

  return <div lang={language}>
    <a href="#main" className="skip-link">{words(locale, "跳至主要内容", "Skip to main content")}</a>
    <PageMotion />
    <div className="header-scroll-sentinel" aria-hidden="true" />
    <Suspense fallback={<div className="container header-fallback">UDAJO</div>}><SiteHeader locale={locale} signedIn={signedIn} /></Suspense>
    {children}
    <footer className="site-footer"><div className="container footer-grid">
      <div className="footer-brand"><strong>UDAJO</strong><span>洋豆角</span></div>
      <div className="footer-contact">
        <Link className="footer-contact-link" href={`/${locale}/about#enquiry`}>
          {words(locale, "联系我们", "Contact us")}
        </Link>
        <span>{words(locale, "与留学顾问沟通你的升学计划。", "Talk with an adviser about your study plans.")}</span>
      </div>
      <p className="footer-note"><a href={`https://${companyProfile.domain}`}>{companyProfile.domain}</a><br /><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></p>
    </div></footer>
  </div>;
}
