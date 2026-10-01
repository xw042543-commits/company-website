import { notFound } from "next/navigation";
import { AccountPanel } from "@/components/account-panel";
import { isLocale, words } from "@/lib/site";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="page-main account-page"><div className="container"><header className="page-heading"><h1>{words(locale, "我的账户", "My account")}</h1><p>{words(locale, "继续查看收藏清单，或管理你的账户资料。", "Continue with your shortlist or manage your account details.")}</p></header><AccountPanel locale={locale} /></div></main>;
}
