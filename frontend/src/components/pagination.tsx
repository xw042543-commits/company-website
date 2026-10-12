import Link from "next/link";
import { Locale, Query, pageLink, words } from "@/lib/site";

export function Pagination({ locale, path, query, page, total }: { locale: Locale; path: string; query: Query; page: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / 12));

  return <nav className="pagination" aria-label={words(locale, "分页", "Pagination")}>
    {page > 1 ? <Link className="button secondary" href={pageLink(path, query, page - 1)}>{words(locale, "上一页", "Previous")}</Link> : <button type="button" disabled>{words(locale, "上一页", "Previous")}</button>}
    <span aria-current="page">{words(locale, `第 ${page} / ${pages} 页`, `Page ${page} of ${pages}`)}</span>
    {page < pages ? <Link className="button secondary" href={pageLink(path, query, page + 1)}>{words(locale, "下一页", "Next")}</Link> : <button type="button" disabled>{words(locale, "下一页", "Next")}</button>}
  </nav>;
}
