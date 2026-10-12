import Link from "next/link";
import { Locale, words } from "@/lib/site";

export function ResultsState({ locale, state, actionHref }: { locale: Locale; state: "loading" | "empty" | "error" | "unconfigured" | "pending"; actionHref?: string }) {
  const messages = {
    loading: ["正在加载院校", "Loading universities", "请稍候。", "Please wait."],
    empty: ["没有找到符合条件的院校", "No matching universities", "请调整筛选条件后重试。", "Try adjusting your filters."],
    error: ["暂时无法加载院校资料", "University information is temporarily unavailable", "请稍后重试，或联系留学顾问获取帮助。", "Please try again later or contact an adviser for assistance."],
    unconfigured: ["院校资料正在完善", "University profiles coming soon", "我们只会展示已经审核的院校资料。", "Profiles appear here after the university information has been reviewed."],
    pending: ["筛选结果暂未开放", "Results are not available yet", "你的筛选条件已保留。功能开放后，这里将显示匹配的院校。", "Your filters have been saved. Matching universities will appear here when search becomes available."],
  } as const;
  const [zh, en, bodyZh, bodyEn] = messages[state];

  return <div className="results-state" role={state === "error" ? "alert" : "status"} aria-busy={state === "loading"}>
    <span className="state-symbol" aria-hidden="true">{state === "loading" ? "…" : state === "error" ? "!" : "○"}</span>
    <h3>{words(locale, zh, en)}</h3>
    <p>{words(locale, bodyZh, bodyEn)}</p>
    {state === "empty" && actionHref ? <Link className="text-link" href={actionHref}>{words(locale, "清除搜索和筛选条件", "Clear search and filters")}</Link> : null}
  </div>;
}
