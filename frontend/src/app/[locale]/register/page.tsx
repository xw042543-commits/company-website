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
        <p className="page-intro">{words(locale, "未来可使用账户保存留学偏好、查看申请进度并接收顾问更新。", "Your future account will let you save study preferences, follow application progress and receive adviser updates.")}</p>
        <div className="account-policy">
          <h2>{words(locale, "员工与管理员账户", "Staff and administrator accounts")}</h2>
          <p>{words(locale, "为保护咨询和营运资料，员工与管理员不能自行注册。账户将由获授权的管理员邀请并分配权限。", "To protect enquiry and operational data, staff and administrators cannot self-register. An authorized administrator will invite them and assign their permissions.")}</p>
        </div>
      </section>
      <section className="login-panel" aria-label={words(locale, "注册表单", "Registration form")}>
        <div className="login-panel-heading">
          <p className="eyebrow">{words(locale, "新用户", "New account")}</p>
          <h2>{words(locale, "开始建立账户", "Get started")}</h2>
          <p>{words(locale, "此页面目前用于确认注册流程和界面。", "This page currently previews the registration flow and interface.")}</p>
        </div>
        <RegisterForm locale={locale} />
        <div className="login-help"><p>{words(locale, "已经有账户？", "Already have an account?")}</p><Link href={`/${locale}/login`}>{words(locale, "返回登录", "Return to sign in")}</Link></div>
      </section>
    </div>
  </main>;
}
