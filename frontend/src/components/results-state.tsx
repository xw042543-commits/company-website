import Link from "next/link";
import { Locale, words } from "@/lib/site";

export function ResultsState({ locale, state, actionHref }: { locale: Locale; state: "loading" | "empty" | "error" | "unconfigured" | "pending"; actionHref?: string }) {
  const messages = {
    loading: ["正在加载院校", "Loading universities", "请稍候。", "Please wait."],
    empty: ["没有找到符合条件的院校", "No matching universities", "请调整筛选条件后重试。", "Try adjusting your filters."],
    error: ["暂时无法加载院校", "Unable to load universities", "请稍后重试，或通过咨询页面联系我们。", "Try again later, or use the enquiry page."],
    unconfigured: ["院校资料正在接入", "University information is being connected", "当前不会显示未经审核的院校资料。", "Unreviewed university records are not shown."],
    pending: ["筛选服务正在接入", "Filtered results are being connected", "筛选条件会保留在网址中。服务接入后将显示匹配院校。", "Your choices remain in the URL. Matching universities will appear when the service is connected."],
  } as const;
  const [zh, en, bodyZh, bodyEn] = messages[state];

  return <div className="results-state" role={state === "error" ? "alert" : "status"} aria-busy={state === "loading"}>
    <span className="state-symbol" aria-hidden="true">{state === "loading" ? "…" : state === "error" ? "!" : "○"}</span>
    <h3>{words(locale, zh, en)}</h3>
    <p>{words(locale, bodyZh, bodyEn)}</p>
    {state === "empty" && actionHref ? <Link className="text-link" href={actionHref}>{words(locale, "清除搜索和筛选条件", "Clear search and filters")}</Link> : null}
  </div>;
}
