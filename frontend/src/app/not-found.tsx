import Link from "next/link";
export default function NotFound() {
  return <main id="main" className="container page-main"><h1><span lang="zh-CN">页面不存在</span> / <span lang="en">Page not found</span></h1><Link href="/zh">返回首页</Link> · <Link href="/en">Return home</Link></main>;
}
