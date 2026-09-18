import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isLocale, words } from "@/lib/site";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main id="main" className="login-page">
    <div className="container login-layout">
      <section className="login-introduction" aria-labelledby="login-title">
        <p className="section-label">{words(locale, "UDAJO 账户", "UDAJO accounts")}</p>
        <h1 id="login-title">{words(locale, "账户登录", "Sign in to your account")}</h1>
        <p className="page-intro">{words(locale, "同一个安全入口将服务学生、客户、员工与管理员。账户权限会在未来由系统自动识别。", "One secure entry point will serve students, clients, staff and administrators. The system will identify account permissions automatically in a future release.")}</p>

        <div className="login-audience" aria-label={words(locale, "未来账户功能", "Planned account features")}>
          <article>
            <p className="login-audience-label">{words(locale, "学生与客户", "Students and clients")}</p>
            <h2>{words(locale, "跟进你的留学规划", "Follow your study journey")}</h2>
            <p>{words(locale, "未来可查看已保存的偏好、申请进度与顾问更新。", "Planned access includes saved preferences, application progress and adviser updates.")}</p>
          </article>
          <article>
            <p className="login-audience-label">{words(locale, "员工与管理员", "Staff and administrators")}</p>
            <h2>{words(locale, "管理咨询与网站资料", "Manage enquiries and website content")}</h2>
            <p>{words(locale, "未来可查看咨询、已审核内容、资料管理与营运概览。", "Planned access includes enquiries, reviewed content, data management and an operational overview.")}</p>
          </article>
        </div>
      </section>

      <section className="login-panel" aria-label={words(locale, "登录表单", "Sign-in form")}>
        <div className="login-panel-heading">
          <p className="eyebrow">{words(locale, "安全账户入口", "Secure account access")}</p>
          <h2>{words(locale, "欢迎回来", "Welcome back")}</h2>
          <p>{words(locale, "登录功能目前处于界面预览阶段。", "Sign-in is currently available as an interface preview.")}</p>
        </div>
        <LoginForm locale={locale} />
        <div className="login-help">
          <p>{words(locale, "还没有学生或客户账户？", "New student or client?")}</p>
          <div className="login-help-links">
            <Link href={`/${locale}/register`}>{words(locale, "注册账户", "Create an account")}</Link>
            <Link href={`/${locale}/consultation`}>{words(locale, "联系顾问", "Contact an adviser")}</Link>
          </div>
        </div>
      </section>
    </div>
  </main>;
}
