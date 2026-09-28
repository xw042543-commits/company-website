export default function Loading() {
  return <main id="main" className="container page-main loading-page" aria-busy="true">
    <p className="loading-status" role="status"><span lang="zh-CN">正在加载院校资料</span> / <span lang="en">Loading university information</span></p>
    <div className="loading-heading-skeleton" aria-hidden="true"><span /><span /></div>
    <div className="university-skeleton-grid" aria-hidden="true">
      {[0, 1, 2].map((item) => <div className="university-card-skeleton" key={item}>
        <span className="skeleton-media" /><span className="skeleton-line skeleton-line--short" /><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-button" />
      </div>)}
    </div>
  </main>;
}
