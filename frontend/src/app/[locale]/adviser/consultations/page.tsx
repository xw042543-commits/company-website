import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdviserConsultationsPanel } from "@/components/adviser-consultations-panel";
import { isLocale, words } from "@/lib/site";

export const metadata: Metadata = { title: "Consultations · UDAJO", robots: { index: false, follow: false } };

export default async function AdviserConsultationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="page-main adviser-consultations">
    <div className="container adviser-workspace">
      <header className="adviser-heading">
        <div><p className="eyebrow">{words(locale, "顾问工作台", "Adviser workspace")}</p>
          <h1>{words(locale, "咨询管理", "Consultations")}</h1>
          <p>{words(locale, "查看咨询表单并跟进处理状态。", "Review consultation enquiries and track their progress.")}</p></div>
        <Link className="button secondary" href={`/${locale}/account`}>{words(locale, "我的账户", "My account")}</Link>
      </header>
      <Suspense fallback={<p role="status">{words(locale, "正在载入咨询…", "Loading consultations…")}</p>}>
        <AdviserConsultationsPanel locale={locale} />
      </Suspense>
    </div>
  </main>;
}
