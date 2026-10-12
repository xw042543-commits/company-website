import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, words } from "@/lib/site";

export const metadata: Metadata = { title: "Access denied · UDAJO", robots: { index: false, follow: false } };

export default async function ForbiddenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="page-main adviser-consultations">
    <section className="container adviser-denied" aria-labelledby="forbidden-title">
      <p className="eyebrow">403</p>
      <h1 id="forbidden-title">{words(locale, "无权访问", "Access denied")}</h1>
      <p>{words(locale, "此页面仅供已获授权的顾问使用。当前账户没有访问权限。", "This page is for authorised advisers. Your account does not have access.")}</p>
      <nav aria-label={words(locale, "返回导航", "Return navigation")}>
        <Link className="button" href={`/${locale}/account`}>{words(locale, "返回我的账户", "Back to my account")}</Link>
        <Link className="button secondary" href={`/${locale}`}>{words(locale, "返回首页", "Back to home")}</Link>
      </nav>
    </section>
  </main>;
}
