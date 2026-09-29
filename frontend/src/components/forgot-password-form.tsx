"use client";

import { useRef, useState } from "react";
import { Locale, words } from "@/lib/site";

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const [reviewed, setReviewed] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  function handlePreview() {
    if (emailRef.current) emailRef.current.value = "";
    setReviewed(true);
  }

  return <div className="login-form" onChange={() => setReviewed(false)} aria-describedby="recovery-preview-notice">
    <p id="recovery-preview-notice" className="login-notice">
      <strong>{words(locale, "密码重设功能预览", "Password reset preview")}</strong>
      <span>{words(locale, "密码重设功能目前仅供预览。请勿填写真实邮箱；此页面不会发送邮件或保存任何资料。", "Password reset is currently available in preview mode only. Do not enter a real email address; no email will be sent and no details will be stored.")}</span>
    </p>
    <div className="field">
      <label htmlFor="recovery-email">{words(locale, "账户邮箱", "Account email")}</label>
      <input ref={emailRef} id="recovery-email" type="email" autoComplete="off" maxLength={160} placeholder={words(locale, "请输入注册邮箱", "Enter your registered email")} />
    </div>
    <button className="full-width" type="button" onClick={handlePreview}>{words(locale, "预览密码重设流程", "Preview password reset")}</button>
    <p className="login-support-note">{words(locale, "正式开放后，重设链接将设有有效期限并只能使用一次。", "When enabled, reset links will expire and can only be used once.")}</p>
    {reviewed && <p className="login-status" role="status" aria-live="polite">{words(locale, "预览完成。没有发送邮件，邮箱资料已从页面清除。", "Preview complete. No email was sent, and the address was cleared from the page.")}</p>}
  </div>;
}
