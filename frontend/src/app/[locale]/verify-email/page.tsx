import { notFound } from "next/navigation";
import { EmailVerificationForm } from "@/components/email-verification-form";
import { isLocale, words } from "@/lib/site";

export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="login-page account-recovery-page"><div className="container recovery-layout"><section className="login-panel" aria-labelledby="verify-email-title"><div className="login-panel-heading"><h1 id="verify-email-title">{words(locale, "验证邮箱", "Verify your email")}</h1><p>{words(locale, "确认验证后即可使用账户登录。", "Confirm your email to activate account access.")}</p></div><EmailVerificationForm locale={locale} /></section></div></main>;
}
