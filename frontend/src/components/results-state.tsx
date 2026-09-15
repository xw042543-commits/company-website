import { Locale, words } from "@/lib/site";
export function ResultsState({ locale, state }: { locale: Locale; state: "loading" | "empty" | "error" | "unconfigured" | "pending" }) {
  const messages = {
    loading: ["正在加载院校", "Loading universities", "请稍候。", "Please wait."],
    empty: ["没有找到符合条件的院校", "No matching universities", "请调整筛选条件后重试。", "Try adjusting your filters."],
    error: ["暂时无法加载院校", "Unable to load universities", "请稍后重试，或通过咨询入口联系我们。", "Try again later, or use the enquiry page."],
    unconfigured: ["院校资料尚未连接", "University information is not connected", "当前展示页面结构，不显示虚构院校。", "This preview shows the page structure without invented university records."],
    pending: ["筛选结果暂不可用", "Filtered results are not available yet", "筛选条件已保存在网址中。筛选服务接入后将显示匹配院校。", "Your filters are saved in the URL. Matching universities will appear once the filter service is connected."],
  };
  const [zh, en, bodyZh, bodyEn] = messages[state];
  return <div className="results-state" role={state === "error" ? "alert" : "status"} aria-busy={state === "loading"}>
    <span className="state-symbol" aria-hidden="true">{state === "loading" ? "…" : state === "error" ? "!" : "○"}</span>
    <h3>{words(locale, zh, en)}</h3><p>{words(locale, bodyZh, bodyEn)}</p>
  </div>;
}
