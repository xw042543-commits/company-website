"use client";

import "./globals.css";
import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="zh-CN">
    <body className="status-global-body">
      <main id="main" className="status-page status-page-standalone">
        <section role="alert" className="status-card status-card-error" aria-labelledby="global-error-title">
          <p className="status-wordmark">UDAJO <span lang="zh-CN">洋豆角</span></p>
          <p className="status-code" aria-hidden="true">!</p>
          <h1 id="global-error-title"><span lang="zh-CN">网站暂时无法加载</span><span className="status-title-divider">/</span><span lang="en">The website could not load</span></h1>
          <p className="status-copy"><span lang="zh-CN">请重试，或稍后再次访问。</span><br /><span lang="en">Please try again or return a little later.</span></p>
          <div className="status-actions">
            <button type="button" onClick={reset}>重试 / Try again</button>
            <Link className="button secondary" href="/zh">返回首页 / Back home</Link>
          </div>
        </section>
      </main>
    </body>
  </html>;
}
