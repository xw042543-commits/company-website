export default function Loading() {
  return <main id="main" className="container page-main" aria-busy="true"><p role="status"><span lang="zh-CN">正在加载…</span> / <span lang="en">Loading…</span></p><div className="loading-skeleton" aria-hidden="true" /></main>;
}
