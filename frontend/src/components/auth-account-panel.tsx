"use client";

import { useState } from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { WechatQrPanel } from "@/components/wechat-qr-panel";
import { WechatBindForm } from "@/components/wechat-bind-form";
import { type Locale, words } from "@/lib/site";

type AccountMode = "login" | "register" | "recovery" | "wechat-bind";

export function AuthAccountPanel({ locale, initialMode = "login", returnTo, wechatError }: { locale: Locale; initialMode?: AccountMode; returnTo?: string; wechatError?: string }) {
  const [mode, setMode] = useState<AccountMode>(initialMode);
  const registering = mode === "register";
  const recovering = mode === "recovery";
  const bindingWechat = mode === "wechat-bind";
  const title = registering
    ? words(locale, "注册新账户", "Create account")
    : bindingWechat
      ? words(locale, "绑定微信账号", "Link WeChat account")
      : recovering
      ? words(locale, "重设密码", "Reset password")
      : words(locale, "登录", "Sign in");

  return <div className={`auth-account-layout${recovering ? " auth-account-layout-focused" : ""}`}>
    {!recovering && <WechatQrPanel locale={locale} mode={registering ? "register" : "login"} returnTo={returnTo} />}
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

    {wechatError && mode === "login" && <p className="login-status auth-status-error" role="alert">
      {words(locale, "微信授权未完成，请重试或使用账号密码登录。", "WeChat authorization was not completed. Try again or use your password.")}
    </p>}

    {registering
      ? <RegisterForm locale={locale} returnTo={returnTo} />
      : bindingWechat
        ? <WechatBindForm locale={locale} returnTo={returnTo ?? `/${locale}/account`} />
      : recovering
        ? <ForgotPasswordForm locale={locale} />
        : <LoginForm locale={locale} returnTo={returnTo} onForgotPassword={() => setMode("recovery")} />}

    <div className="auth-form-support">
      <Link href={`/${locale}/about#enquiry`}>{words(locale, "需要帮助？联系顾问", "Need help? Contact an adviser")}</Link>
    </div>
    </section>
  </div>;
}
