import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, navigation, words } from "@/lib/site";
export default async function ContentSection({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale)) notFound();
  const item = navigation.find(([path]) => path === section);
  if (!item || !["language", "scholarships", "programmes", "news", "about"].includes(section)) notFound();
  return <main id="main" className="container page-main"><p className="eyebrow">{words(locale, "栏目结构预览", "SECTION PREVIEW")}</p><h1>{words(locale, item[1], item[2])}</h1><div className="results-state"><h2>{words(locale, "栏目内容待提供", "Section content to be supplied")}</h2><p>{words(locale, "该栏目保留已确认的导航位置，正式内容与页面结构待确认。", "This section retains its approved navigation position. Its content and detailed layout await approval.")}</p><Link className="button secondary" href={`/${locale}`}>{words(locale, "返回首页", "Return home")}</Link></div></main>;
}
