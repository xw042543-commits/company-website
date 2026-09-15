"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Locale, navigation, words } from "@/lib/site";
export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const query = useSearchParams();
  const other = locale === "zh" ? "en" : "zh";
  const languagePath = pathname.replace(/^\/(zh|en)(?=\/|$)/, `/${other}`);
  useEffect(() => { document.documentElement.lang = locale === "zh" ? "zh-CN" : "en"; }, [locale]);
  return <header className="site-header">
    <div className="header-top container">
      <Link href={`/${locale}`} className="brand">洋豆角<span>YANGDOUJIAO</span></Link>
      <div className="header-actions">
        <Link href={`${languagePath}${query.size ? `?${query}` : ""}`} hrefLang={other} aria-label={words(locale, "Switch to English", "切换为中文")}>{locale === "zh" ? "English" : "中文"}</Link>
        <Link className="button small" href={`/${locale}/consultation`}>{words(locale, "咨询", "Enquire")}</Link>
      </div>
    </div>
    <nav className="navigation container" aria-label={words(locale, "主导航", "Main navigation")}>
      {navigation.map(([path, zh, en]) => <Link key={path} href={`/${locale}${path ? `/${path}` : ""}`} aria-current={pathname === `/${locale}${path ? `/${path}` : ""}` ? "page" : undefined}>{words(locale, zh, en)}</Link>)}
    </nav>
  </header>;
}
