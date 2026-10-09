import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdviserConsultationsPanel } from "@/components/adviser-consultations-panel";
import { adviserNavigation } from "@/lib/adviser-consultations-ui";
import { isLocale, words } from "@/lib/site";

export const metadata: Metadata = { title: "Consultations · UDAJO", robots: { index: false, follow: false } };

export default async function AdviserConsultationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="adviser-console">
    <div className="adviser-console-shell">
      <header className="adviser-console-header">
        <Link className="adviser-console-brand" href={`/${locale}`} aria-label={words(locale, "返回洋豆角首页", "Return to UDAJO home")}>
          <Image src="/brand/udajo-logo-transparent.png" width={1254} height={1254} sizes="44px" alt="" />
          <span><strong>UDAJO</strong><small>{words(locale, "顾问后台", "Adviser console")}</small></span>
        </Link>
        <div className="adviser-console-heading"><p className="eyebrow">{words(locale, "顾问工作台", "Adviser workspace")}</p>
          <h1>{words(locale, "咨询管理", "Consultations")}</h1>
          <p>{words(locale, "查看客户提交的留学需求并持续跟进。", "Review submitted study-abroad needs and keep every enquiry moving.")}</p></div>
        <Link className="button secondary" href={`/${locale}/account`}>{words(locale, "我的账户", "My account")}</Link>
      </header>
      <nav className="community-navigation" aria-label={words(locale, "顾问导航", "Adviser navigation")}>
        {adviserNavigation(locale).map((item) => <Link key={item.href} href={item.href} aria-current={item.href.endsWith("/consultations") ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <Suspense fallback={<p role="status">{words(locale, "正在载入咨询…", "Loading consultations…")}</p>}>
        <AdviserConsultationsPanel locale={locale} />
      </Suspense>
    </div>
  </main>;
}
