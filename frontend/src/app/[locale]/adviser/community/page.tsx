import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdviserCommunityPanel } from "@/components/adviser-community-panel";
import { adviserNavigation } from "@/lib/adviser-consultations-ui";
import { isLocale, words } from "@/lib/site";

export const metadata: Metadata = { title: "Community moderation · UDAJO", robots: { index: false, follow: false } };

export default async function AdviserCommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="adviser-console">
    <div className="adviser-console-shell">
      <header className="adviser-console-header">
        <Link className="adviser-console-brand" href={`/${locale}`} aria-label={words(locale, "返回洋豆角首页", "Return to UDAJO home")}>
          <Image src="/brand/udajo-logo-transparent.png" width={1254} height={1254} sizes="44px" alt="" />
          <span><strong>UDAJO</strong><small>{words(locale, "顾问后台", "Adviser console")}</small></span>
        </Link>
        <div className="adviser-console-heading"><h1>{words(locale, "U圈审核", "Community moderation")}</h1>
          <p>{words(locale, "核对内容与举报，记录每一次处理决定。", "Review content and reports, and record each decision.")}</p></div>
        <Link className="button secondary" href={`/${locale}/account`}>{words(locale, "我的账户", "My account")}</Link>
      </header>
      <nav className="community-navigation" aria-label={words(locale, "顾问导航", "Adviser navigation")}>
        {adviserNavigation(locale).map((item) => <Link key={item.href} href={item.href} aria-current={item.href.endsWith("/community") ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <AdviserCommunityPanel locale={locale} />
    </div>
  </main>;
}
