"use client";
import { useParams } from "next/navigation";
import { words } from "@/lib/site";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const params = useParams();
  const locale = params.locale === "en" ? "en" : "zh";
  return <main id="main" className="container page-main"><div role="alert" className="results-state"><h1>{words(locale, "页面暂时无法加载", "This page could not be loaded")}</h1><p>{words(locale, "请重试。", "Please try again.")}</p><button onClick={reset}>{words(locale, "重试", "Try again")}</button></div></main>;
}
