"use client";

import { Suspense } from "react";
import Image from "next/image";
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
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-column">
          <Link href={`/${locale}`} className="footer-brand" aria-label={words(locale, "洋豆角首页", "UDAJO home")}>
            <Image src="/brand/udajo-logo-transparent.png" width={1254} height={1254} sizes="72px" alt="" />
            <span><strong>UDAJO</strong><small>洋豆角</small></span>
          </Link>
          <p>{words(locale, "提供清晰、可信的留学规划与申请支持。", "Clear information and practical support for studying abroad.")}</p>
          <div className="footer-socials" aria-label={words(locale, "社交媒体", "Social media")}>
            <a href={companyProfile.socialProfiles.xiaohongshu} target="_blank" rel="noreferrer" aria-label={words(locale, "在小红书查看大宋留学", "View Da Song Study Abroad on Xiaohongshu")} title={words(locale, "小红书：大宋留学", "Xiaohongshu: Da Song Study Abroad")}>
              <span aria-hidden="true">小红书</span>
            </a>
            <a href={companyProfile.socialProfiles.douyin} target="_blank" rel="noreferrer" aria-label={words(locale, "在抖音查看大宋留学", "View Da Song Study Abroad on Douyin")} title={words(locale, "抖音：大宋留学", "Douyin: Da Song Study Abroad")}>
              <DouyinIcon />
            </a>
            <Link href={`/${locale}/about#enquiry`} aria-label={words(locale, "查看微信联系方式", "View WeChat contact options")} title={words(locale, "微信联系方式", "WeChat contact options")}>
              <WechatIcon />
            </Link>
          </div>
        </div>

        <nav className="footer-navigation" aria-label={words(locale, "页脚导航", "Footer navigation")}>
          <div>
            <h2>{words(locale, "查找与规划", "Explore")}</h2>
            <Link href={`/${locale}/universities`}>{words(locale, "院校一览", "Universities")}</Link>
            <Link href={`/${locale}/planning`}>{words(locale, "专业规划", "Programme planning")}</Link>
            <Link href={`/${locale}/language`}>{words(locale, "语言学习", "Language learning")}</Link>
            <Link href={`/${locale}/scholarships`}>{words(locale, "奖学金", "Scholarships")}</Link>
          </div>
          <div>
            <h2>{words(locale, "关于洋豆角", "About UDAJO")}</h2>
            <Link href={`/${locale}/about`}>{words(locale, "公司简介", "About us")}</Link>
            <Link className="footer-contact-link" href={`/${locale}/about#enquiry`}>{words(locale, "联系顾问", "Contact an adviser")}</Link>
            <Link href={`/${locale}/news`}>{words(locale, "留学资讯", "Study abroad insights")}</Link>
            <a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a>
          </div>
          <div>
            <h2>{words(locale, "账户与支持", "Account and support")}</h2>
            <Link href={`/${locale}/account`}>{words(locale, "我的账户", "My account")}</Link>
            <Link className="footer-legal-link" href={`/${locale}/privacy`}>{words(locale, "隐私政策", "Privacy policy")}</Link>
            <Link className="footer-legal-link" href={`/${locale}/terms`}>{words(locale, "用户协议", "User agreement")}</Link>
            <a href={`https://${companyProfile.domain}`}>{companyProfile.domain}</a>
          </div>
        </nav>
      </div>

      <div className="container footer-bottom">
        <p><strong>{companyProfile.legalNameZh}</strong><span>{words(locale, `统一社会信用代码：${companyProfile.registrationNumber}`, `Registration number: ${companyProfile.registrationNumber}`)}</span></p>
        <p>{words(locale, "洋豆角保留所有权利。", "UDAJO. All rights reserved.")}</p>
      </div>
    </footer>
  </div>;
}

function DouyinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.6 3.4c.4 2.5 1.8 4 4.2 4.6v3.2a9.1 9.1 0 0 1-4.2-1.4v6.1a6.1 6.1 0 1 1-5.3-6v3.3a2.9 2.9 0 1 0 2.1 2.7V3.4h3.2Z" /></svg>;
}

function WechatIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.7 4.3c-4.2 0-7.5 2.6-7.5 5.9 0 1.9 1.1 3.6 2.9 4.7l-.7 2.5 2.9-1.5c.8.2 1.6.3 2.4.3h.5a5.6 5.6 0 0 1-.3-1.8c0-3.4 3.2-6.1 7.2-6.1h.1c-.9-2.3-3.8-4-7.5-4Zm-2.5 4a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Zm5 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" /><path d="M21.8 14.4c0-2.8-2.8-5-6.2-5s-6.2 2.2-6.2 5 2.8 5 6.2 5c.7 0 1.4-.1 2.1-.3l2.4 1.3-.6-2.1c1.4-1 2.3-2.3 2.3-3.9Zm-8.2-1a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Zm4.1 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z" /></svg>;
}
