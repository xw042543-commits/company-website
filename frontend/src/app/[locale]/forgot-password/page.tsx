import Link from "next/link";
import { notFound } from "next/navigation";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { isLocale, words } from "@/lib/site";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main id="main" className="login-page account-recovery-page">
    <div className="container recovery-layout">
      <section className="login-panel" aria-labelledby="recovery-title">
        <div className="login-panel-heading">
          <p className="eyebrow">{words(locale, "账户协助", "Account help")}</p>
          <h1 id="recovery-title">{words(locale, "忘记密码", "Forgot your password?")}</h1>
          <p>{words(locale, "提交注册邮箱或手机号码后，我们会发送安全的密码重设说明。", "Submit your registered email or phone number to receive secure reset instructions.")}</p>
        </div>
        <ForgotPasswordForm locale={locale} />
        <div className="login-help"><Link href={`/${locale}/login`}>{words(locale, "返回登录", "Return to sign in")}</Link></div>
      </section>
    </div>
  </main>;
}
