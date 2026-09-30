"use client";

import { useState } from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { WechatQrPanel } from "@/components/wechat-qr-panel";
import { type Locale, words } from "@/lib/site";

type AccountMode = "login" | "register" | "recovery";

export function AuthAccountPanel({ locale, initialMode = "login", returnTo }: { locale: Locale; initialMode?: AccountMode; returnTo?: string }) {
  const [mode, setMode] = useState<AccountMode>(initialMode);
  const registering = mode === "register";
  const recovering = mode === "recovery";
  const title = registering
    ? words(locale, "注册新账户", "Create account")
    : recovering
      ? words(locale, "重设密码", "Reset password")
      : words(locale, "登录", "Sign in");

  return <div className={`auth-account-layout${recovering ? " auth-account-layout-focused" : ""}`}>
    {!recovering && <WechatQrPanel locale={locale} mode={registering ? "register" : "login"} />}
    <section className="auth-form-column" aria-labelledby="account-form-title">
    <div className="auth-form-heading">
      <div>
        <p className="auth-column-label">{words(locale, "UDAJO 账户", "UDAJO account")}</p>
        <h2 id="account-form-title">{title}</h2>
      </div>
      <button className="auth-form-switch" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? words(locale, "注册新账户", "Create account") : words(locale, "返回登录", "Back to sign in")}
      </button>
    </div>

    {registering
      ? <RegisterForm locale={locale} returnTo={returnTo} />
      : recovering
        ? <ForgotPasswordForm locale={locale} />
        : <LoginForm locale={locale} returnTo={returnTo} onForgotPassword={() => setMode("recovery")} />}

    <div className="auth-form-support">
      <Link href={`/${locale}/about#enquiry`}>{words(locale, "需要帮助？联系顾问", "Need help? Contact an adviser")}</Link>
    </div>
    </section>
  </div>;
}
