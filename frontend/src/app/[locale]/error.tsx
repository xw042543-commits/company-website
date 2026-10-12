"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { words } from "@/lib/site";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const params = useParams();
  const locale = params.locale === "en" ? "en" : "zh";

  return <main id="main" className="status-page">
    <section role="alert" className="status-card status-card-error" aria-labelledby="error-title">
      <p className="status-code" aria-hidden="true">!</p>
      <p className="section-label">{words(locale, "暂时出现问题", "Something went wrong")}</p>
      <h1 id="error-title">{words(locale, "这个页面暂时无法加载", "This page could not be loaded")}</h1>
      <p className="status-copy">{words(locale, "请重试一次。如果问题仍然存在，你可以返回首页继续浏览。", "Try once more. If the problem continues, return home and keep browsing.")}</p>
      <div className="status-actions">
        <button type="button" onClick={reset}>{words(locale, "重试", "Try again")}</button>
        <Link className="button secondary" href={`/${locale}`}>{words(locale, "返回首页", "Back to home")}</Link>
      </div>
    </section>
  </main>;
}
