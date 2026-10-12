import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return <main id="main" className="status-page status-page-standalone">
    <section className="status-card" aria-labelledby="not-found-title">
      <div className="status-brand">
        <Image src="/brand/udajo-logo-transparent.png" width={1280} height={1280} priority alt="UDAJO 洋豆角" />
      </div>
      <p className="status-code" aria-hidden="true">404</p>
      <h1 id="not-found-title"><span lang="zh-CN">页面没有找到</span><span className="status-title-divider">/</span><span lang="en">Page not found</span></h1>
      <p className="status-copy"><span lang="zh-CN">链接可能已更改，或者页面已经不存在。</span><br /><span lang="en">The link may have changed, or the page may no longer exist.</span></p>
      <div className="status-actions">
        <Link className="button" href="/zh">返回中文首页</Link>
        <Link className="button secondary" href="/en">Return to English home</Link>
      </div>
    </section>
  </main>;
}
