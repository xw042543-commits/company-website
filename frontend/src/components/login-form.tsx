"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Locale, words } from "@/lib/site";

export function LoginForm({ locale }: { locale: Locale }) {
  const [showPassword, setShowPassword] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const accountRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function handlePreview() {
    if (accountRef.current) accountRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
    setShowPassword(false);
    setReviewed(true);
  }

  return <div className="login-form" onChange={() => setReviewed(false)} aria-describedby="login-preview-notice">
    <p id="login-preview-notice" className="login-notice">
      <strong>{words(locale, "登录界面预览", "Login interface preview")}</strong>
      <span>{words(locale, "安全登录服务尚未接入。请勿输入真实密码；此页面不会发送或保存任何登录资料。", "Secure account access is not connected yet. Do not enter a real password; this page will not send or store any login details.")}</span>
    </p>

    <div className="field">
      <label htmlFor="account-id">{words(locale, "邮箱或用户名", "Email or username")}</label>
      <input ref={accountRef} id="account-id" type="text" autoComplete="off" maxLength={160} placeholder={words(locale, "请输入邮箱或用户名", "Enter your email or username")} />
    </div>

    <div className="field">
      <div className="field-label-row">
        <label htmlFor="account-password">{words(locale, "密码", "Password")}</label>
        <Link href={`/${locale}/forgot-password`}>{words(locale, "忘记密码？", "Forgot password?")}</Link>
      </div>
      <div className="password-input-wrap">
        <input ref={passwordRef} id="account-password" type={showPassword ? "text" : "password"} autoComplete="off" maxLength={128} placeholder={words(locale, "请输入密码", "Enter your password")} />
        <button className="password-toggle" type="button" aria-controls="account-password" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>
          {showPassword ? words(locale, "隐藏", "Hide") : words(locale, "显示", "Show")}
        </button>
      </div>
    </div>

    <button className="full-width" type="button" onClick={handlePreview}>{words(locale, "预览登录操作", "Preview sign in")}</button>
    <p className="login-support-note">{words(locale, "安全登录服务接入后，此按钮将验证账户并进入对应页面。", "Once secure authentication is connected, this button will verify the account and open the appropriate area.")}</p>
    {reviewed && <p className="login-status" role="status" aria-live="polite">{words(locale, "预览完成。登录资料已从页面清除，没有发送或保存。", "Preview complete. The login details were cleared and nothing was sent or stored.")}</p>}
  </div>;
}
