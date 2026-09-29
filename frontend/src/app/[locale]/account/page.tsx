import { notFound } from "next/navigation";
import { AccountPanel } from "@/components/account-panel";
import { isLocale, words } from "@/lib/site";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="page-main account-page"><div className="container"><header className="page-heading"><h1>{words(locale, "我的账户", "My account")}</h1><p>{words(locale, "查看验证状态、修改密码或管理账户。", "Review verification, change your password, or manage your account.")}</p></header><AccountPanel locale={locale} /></div></main>;
}
