import Link from "next/link";

export default function NotFound() {
  return <main id="main" className="container page-main"><div className="content-state"><h1><span lang="zh-CN">页面不存在</span> / <span lang="en">Page not found</span></h1><p><span lang="zh-CN">你访问的页面可能已移动或不存在。</span><br /><span lang="en">The page may have moved or no longer exists.</span></p><div className="form-actions"><Link className="button" href="/zh">返回中文首页</Link><Link className="button secondary" href="/en">Return to English home</Link></div></div></main>;
}
