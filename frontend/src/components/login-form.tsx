"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthSuccessFeedback } from "@/components/auth-success-feedback";
import { login } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

type LoginFormProps = {
  locale: Locale;
  returnTo?: string;
  onForgotPassword?: () => void;
};

export function LoginForm({ locale, returnTo, onForgotPassword }: LoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const [demoPending, setDemoPending] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await login(browserApiBaseUrl(), {
      identifier: identifier.trim(), password, rememberMe,
    });
    setPending(false);
    if (result.status === "ready") {
      setCompleted(true);
      window.setTimeout(() => {
        router.push(returnTo ?? `/${locale}/account`);
        router.refresh();
      }, 900);
      return;
    }
    setMessage(authMessage(locale, result));
  }

  async function startDemoSession() {
    setDemoPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/demo-session", { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("demo unavailable");
      router.push(returnTo ?? `/${locale}`);
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: words(locale, "本地演示登录暂时无法启动。", "The local demo session could not be started.") });
      setDemoPending(false);
    }
  }

  if (completed) return <AuthSuccessFeedback locale={locale} kind="login" />;

  return <form className="login-form account-login-form" onSubmit={handleSubmit}>
    <div>
      <div className="field">
        <label htmlFor="account-id">{words(locale, "邮箱", "Email address")}</label>
        <input id="account-id" name="identifier" type="email" inputMode="email" autoComplete="email" maxLength={160} required value={identifier} onChange={(event) => { setIdentifier(event.target.value); setMessage(null); }} placeholder={words(locale, "请输入注册邮箱", "Enter your registered email")} />
      </div>

      <div className="field">
        <label htmlFor="account-password">{words(locale, "密码", "Password")}</label>
        <div className="password-input-wrap">
          <input id="account-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={128} minLength={8} required value={password} onChange={(event) => { setPassword(event.target.value); setMessage(null); }} placeholder={words(locale, "请输入密码", "Enter your password")} />
          <button className="password-toggle" type="button" aria-controls="account-password" aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? words(locale, "隐藏", "Hide") : words(locale, "显示", "Show")}</button>
        </div>
        {onForgotPassword
          ? <button className="forgot-password-link" type="button" onClick={onForgotPassword}>{words(locale, "忘记密码？", "Forgot password?")}</button>
          : <Link className="forgot-password-link" href={`/${locale}/forgot-password`}>{words(locale, "忘记密码？", "Forgot password?")}</Link>}
      </div>

      <label className="auth-checkbox"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> <span>{words(locale, "保持登录", "Keep me signed in")}</span></label>
      <button className="full-width" type="submit" disabled={pending}>{pending ? words(locale, "正在登录…", "Signing in…") : words(locale, "立即登录", "Sign in now")}</button>
      {process.env.NODE_ENV !== "production" && <button className="full-width demo-login-button" type="button" disabled={demoPending} onClick={startDemoSession}>{demoPending ? words(locale, "正在进入演示…", "Opening demo…") : words(locale, "进入本地演示账户", "Open local demo account")}</button>}
    </div>

    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
  </form>;
}
