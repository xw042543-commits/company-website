import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuthAccountPanel } from "@/components/auth-account-panel";
import { safeReturnTo, signedInLoginDestination } from "@/lib/access-policy";
import { isRequestAuthenticated } from "@/lib/server-auth";
import { isLocale, words } from "@/lib/site";

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ mode?: string; returnTo?: string; wechatError?: string }> }) {
  const { locale } = await params;
  const { mode, returnTo: requestedReturnTo, wechatError } = await searchParams;
  if (!isLocale(locale)) notFound();
  const accountDestination = signedInLoginDestination(await isRequestAuthenticated(), locale);
  if (accountDestination) redirect(accountDestination);
  const otherLocale = locale === "zh" ? "en" : "zh";
  const accountMode = mode === "register" || mode === "recovery" || mode === "wechat-bind" ? mode : "login";
  const returnTo = safeReturnTo(requestedReturnTo, locale);
  const otherReturnTo = returnTo.replace(`/${locale}`, `/${otherLocale}`);
  const languageParameters = new URLSearchParams({ returnTo: otherReturnTo });
  if (accountMode !== "login") languageParameters.set("mode", accountMode);
  const languageHref = `/${otherLocale}/login?${languageParameters}`;

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
        <Link className="language-switch" href={languageHref} hrefLang={otherLocale} scroll={false} aria-label={words(locale, "切换为英文", "Switch to Simplified Chinese")}>
          <span className="language-symbol" aria-hidden="true"><span>A</span><span>文</span></span>
          <span>{locale === "zh" ? "EN" : "中文"}</span>
        </Link>
        <Link className="auth-back-link" href={`/${locale}`}>{words(locale, "返回网站", "Back to website")}</Link>
      </nav>
    </header>

    <section className="auth-portal-content" aria-labelledby="login-title">
      <div className="auth-portal-heading">
        <h1 id="login-title">{words(locale, "继续你的留学规划", "Continue planning your studies")}</h1>
        <p>{words(locale, "一个账户，集中管理你的院校选择、申请进度与顾问支持。", "Use one account to manage your university shortlist, application progress and adviser support.")}</p>
      </div>

      <div className="auth-login-card">
        <AuthAccountPanel locale={locale} initialMode={accountMode} returnTo={returnTo} wechatError={wechatError} />
      </div>
    </section>

    <footer className="auth-portal-footer">
      <span>UDAJO 洋豆角</span>
      <span>{words(locale, "清晰规划，安心申请。", "Plan clearly. Apply with support.")} · <Link href={`/${locale}/privacy`}>{words(locale, "隐私政策", "Privacy policy")}</Link> · <Link href={`/${locale}/terms`}>{words(locale, "用户协议", "User agreement")}</Link></span>
    </footer>
  </main>;
}
