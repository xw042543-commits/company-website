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
          <p>{words(locale, "正式开放后，我们会向已注册的邮箱发送安全密码重设链接。", "When enabled, we will send a secure password reset link to the registered email address.")}</p>
        </div>
        <ForgotPasswordForm locale={locale} />
        <div className="login-help"><Link href={`/${locale}/login`}>{words(locale, "返回登录", "Return to sign in")}</Link></div>
      </section>
    </div>
  </main>;
}
