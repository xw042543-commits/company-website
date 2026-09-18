"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isNavigationActive, Locale, navigation, words } from "@/lib/site";

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const query = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const other = locale === "zh" ? "en" : "zh";
  const languagePath = pathname.replace(/^\/(zh|en)(?=\/|$)/, `/${other}`);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  return <header className="site-header">
    <div className="header-top container">
      <Link href={`/${locale}`} className="brand" aria-label={words(locale, "洋豆角首页", "UDAJO home")}>
        <Image src="/brand/udajo-logo.jpg" width={480} height={480} priority alt={words(locale, "洋豆角 UDAJO 标志", "UDAJO logo")} />
      </Link>
      <div className="header-actions">
        <Link className="language-switch" href={`${languagePath}${query.size ? `?${query}` : ""}`} hrefLang={other} aria-label={words(locale, "切换为英文", "Switch to Simplified Chinese")}>
          <span className="language-symbol" aria-hidden="true"><span>A</span><span>文</span></span>
          <span>{locale === "zh" ? "EN" : "中文"}</span>
        </Link>
        <Link className="login-link" href={`/${locale}/login`} aria-current={pathname === `/${locale}/login` ? "page" : undefined}>{words(locale, "登录", "Sign in")}</Link>
        <Link className="button small" href={`/${locale}/consultation`}>{words(locale, "咨询", "Enquire")}</Link>
        <button type="button" className="navigation-toggle" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(value => !value)}>
          <span>{words(locale, "菜单", "Menu")}</span>
          <span className="navigation-toggle-state" aria-hidden="true">{menuOpen ? words(locale, "关闭", "Close") : words(locale, "打开", "Open")}</span>
        </button>
      </div>
    </div>
    <nav id="primary-navigation" className={`navigation container${menuOpen ? " navigation-open" : ""}`} aria-label={words(locale, "主导航", "Main navigation")}>
      {navigation.map(([path, zh, en]) => <Link onClick={() => setMenuOpen(false)} key={path} href={`/${locale}${path ? `/${path}` : ""}`} aria-current={isNavigationActive(pathname, locale, path) ? "page" : undefined}>{words(locale, zh, en)}</Link>)}
    </nav>
  </header>;
}
