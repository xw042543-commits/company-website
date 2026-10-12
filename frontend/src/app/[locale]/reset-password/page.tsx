import { notFound } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { isLocale, words } from "@/lib/site";

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="login-page account-recovery-page"><div className="container recovery-layout"><section className="login-panel" aria-labelledby="reset-password-title"><div className="login-panel-heading"><h1 id="reset-password-title">{words(locale, "设置新密码", "Set a new password")}</h1><p>{words(locale, "请设置一个未在其他网站使用过的密码。", "Choose a password you do not use on other websites.")}</p></div><ResetPasswordForm locale={locale} /></section></div></main>;
}
