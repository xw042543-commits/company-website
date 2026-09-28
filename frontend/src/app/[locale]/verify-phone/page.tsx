import { notFound } from "next/navigation";
import { PhoneVerificationForm } from "@/components/phone-verification-form";
import { isLocale, words } from "@/lib/site";

export default async function VerifyPhonePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="login-page account-recovery-page"><div className="container recovery-layout"><section className="login-panel" aria-labelledby="verify-phone-title"><div className="login-panel-heading"><h1 id="verify-phone-title">{words(locale, "验证手机号码", "Verify your phone number")}</h1><p>{words(locale, "输入收到的 6 位短信验证码。", "Enter the six-digit code sent to your phone.")}</p></div><PhoneVerificationForm locale={locale} /></section></div></main>;
}
