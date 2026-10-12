import { type Locale, words } from "@/lib/site";

export function AuthSuccessFeedback({ locale, kind }: { locale: Locale; kind: "login" | "registration" | "logout" }) {
  const login = kind === "login";
  const logout = kind === "logout";
  return <div className="auth-success-feedback" role="status" aria-live="polite">
    <span className="auth-success-icon" aria-hidden="true"><span /></span>
    <p className="auth-success-eyebrow">{words(locale, "操作成功", "Success")}</p>
    <h3>{login ? words(locale, "欢迎回来", "Welcome back") : logout ? words(locale, "已安全退出", "Signed out successfully") : words(locale, "账户已创建", "Your account is ready")}</h3>
    <p>{login
      ? words(locale, "正在为你打开个人账户…", "Opening your account…")
      : logout
        ? words(locale, "感谢使用洋豆角，正在返回首页…", "Thanks for visiting UDAJO. Returning you home…")
      : words(locale, "接下来请验证邮箱，完成账户启用。", "Next, verify your email to activate your account.")}</p>
    <span className="auth-success-progress" aria-hidden="true"><i /><i /><i /></span>
  </div>;
}
