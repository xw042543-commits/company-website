"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useState } from "react";
import { login } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

const loginMethods = ["password", "phone"] as const;
type AccountLoginMethod = (typeof loginMethods)[number];

type LoginFormProps = {
  locale: Locale;
  returnTo?: string;
  onForgotPassword?: () => void;
};

export function LoginForm({ locale, returnTo, onForgotPassword }: LoginFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<AccountLoginMethod>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  function selectMethod(nextMethod: AccountLoginMethod) {
    setMethod(nextMethod);
    setIdentifier("");
    setMessage(null);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextMethod = loginMethods[(index + direction + loginMethods.length) % loginMethods.length];
    selectMethod(nextMethod);
    window.requestAnimationFrame(() => document.getElementById(`login-tab-${nextMethod}`)?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await login(browserApiBaseUrl(), {
      identifier: identifier.trim(), password, rememberMe,
    });
    setPending(false);
    if (result.status === "ready") {
      setMessage(authMessage(locale, result));
      router.push(returnTo ?? `/${locale}/account`);
      router.refresh();
      return;
    }
    setMessage(authMessage(locale, result));
  }

  const methodLabels: Record<AccountLoginMethod, string> = {
    password: words(locale, "邮箱登录", "Email sign in"),
    phone: words(locale, "手机号登录", "Phone sign in"),
  };

  return <form className="login-form account-login-form" onSubmit={handleSubmit}>
    <div className="login-method-tabs" role="tablist" aria-label={words(locale, "选择登录方式", "Choose a sign-in method")}>
      {loginMethods.map((item, index) => <button
        key={item}
        id={`login-tab-${item}`}
        type="button"
        role="tab"
        aria-selected={method === item}
        aria-controls={`login-panel-${item}`}
        tabIndex={method === item ? 0 : -1}
        onClick={() => selectMethod(item)}
        onKeyDown={(event) => handleTabKeyDown(event, index)}
      >{methodLabels[item]}</button>)}
    </div>

    <div id={`login-panel-${method}`} role="tabpanel" aria-labelledby={`login-tab-${method}`}>
      <div className="field">
        <label htmlFor="account-id">{method === "phone" ? words(locale, "手机号码", "Phone number") : words(locale, "邮箱", "Email address")}</label>
        <input id="account-id" name="identifier" type={method === "phone" ? "tel" : "email"} inputMode={method === "phone" ? "tel" : "email"} autoComplete={method === "phone" ? "tel" : "email"} maxLength={160} required value={identifier} onChange={(event) => { setIdentifier(event.target.value); setMessage(null); }} placeholder={method === "phone" ? words(locale, "例如 +60123456789", "For example +60123456789") : words(locale, "请输入注册邮箱", "Enter your registered email")} />
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
    </div>

    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
  </form>;
}
