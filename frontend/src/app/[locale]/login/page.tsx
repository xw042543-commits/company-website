import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isLocale, words } from "@/lib/site";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const otherLocale = locale === "zh" ? "en" : "zh";

  return <main id="main" className="auth-portal">
    <div className="auth-portal-background" aria-hidden="true">
      <span className="auth-backdrop auth-backdrop-one" />
      <span className="auth-backdrop auth-backdrop-two" />
      <span className="auth-backdrop auth-backdrop-line" />
    </div>

    <header className="auth-portal-header">
      <Link className="auth-portal-brand" href={`/${locale}`} aria-label={words(locale, "返回洋豆角首页", "Return to UDAJO home")}>
        <Image src="/brand/udajo-logo-transparent.png" width={1280} height={1280} priority alt={words(locale, "洋豆角 UDAJO 标志", "UDAJO logo")} />
      </Link>
      <nav className="auth-portal-actions" aria-label={words(locale, "账户页面导航", "Account page navigation")}>
        <Link href={`/${otherLocale}/login`} hrefLang={otherLocale}>{locale === "zh" ? "English" : "中文"}</Link>
        <Link className="auth-back-link" href={`/${locale}`}>{words(locale, "返回网站", "Back to website")}</Link>
      </nav>
    </header>

    <section className="auth-portal-content" aria-labelledby="login-title">
      <div className="auth-portal-heading">
        <h1 id="login-title">{words(locale, "继续你的留学规划", "Continue your study journey")}</h1>
        <p>{words(locale, "使用邮箱或手机号码安全登录并管理个人账户。", "Sign in securely with your email address or phone number and manage your account.")}</p>
      </div>

      <div className="auth-login-card">
        <section className="auth-form-column" aria-labelledby="account-login-title">
          <div className="auth-form-heading">
            <div>
              <p className="auth-column-label">{words(locale, "UDAJO 账户", "UDAJO account")}</p>
              <h2 id="account-login-title">{words(locale, "登录", "Sign in")}</h2>
            </div>
            <Link href={`/${locale}/register`}>{words(locale, "注册新账户", "Create account")}</Link>
          </div>
          <LoginForm locale={locale} />
          <div className="auth-form-support">
            <Link href={`/${locale}/consultation`}>{words(locale, "需要帮助？联系顾问", "Need help? Contact an adviser")}</Link>
          </div>
        </section>
      </div>
    </section>

    <footer className="auth-portal-footer">
      <span>UDAJO 洋豆角</span>
      <span>{words(locale, "清晰规划，安心申请。", "Clear planning, confident applications.")}</span>
    </footer>
  </main>;
}
