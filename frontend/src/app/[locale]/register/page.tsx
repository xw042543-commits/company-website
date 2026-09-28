import Link from "next/link";
import { notFound } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { isLocale, words } from "@/lib/site";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main id="main" className="login-page">
    <div className="container login-layout">
      <section className="login-introduction" aria-labelledby="register-title">
        <p className="section-label">{words(locale, "学生与客户账户", "Student and client accounts")}</p>
        <h1 id="register-title">{words(locale, "建立你的 UDAJO 账户", "Create your UDAJO account")}</h1>
        <p className="page-intro">{words(locale, "使用邮箱或手机号码注册，验证后即可登录并管理个人账户。", "Register with an email address or phone number, then verify it to access your account.")}</p>
      </section>
      <section className="login-panel" aria-label={words(locale, "注册表单", "Registration form")}>
        <div className="login-panel-heading">
          <p className="eyebrow">{words(locale, "新用户", "New account")}</p>
          <h2>{words(locale, "开始建立账户", "Get started")}</h2>
          <p>{words(locale, "填写基本资料并选择验证方式。", "Enter your details and choose a verification method.")}</p>
        </div>
        <RegisterForm locale={locale} />
        <div className="login-help"><p>{words(locale, "已经有账户？", "Already have an account?")}</p><Link href={`/${locale}/login`}>{words(locale, "返回登录", "Return to sign in")}</Link></div>
      </section>
    </div>
  </main>;
}
