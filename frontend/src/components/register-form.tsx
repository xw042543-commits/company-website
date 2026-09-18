"use client";

import { useRef, useState } from "react";
import { Locale, words } from "@/lib/site";

export function RegisterForm({ locale }: { locale: Locale }) {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "reviewed" | "mismatch">("idle");
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  function handlePreview() {
    if (passwordRef.current?.value !== confirmPasswordRef.current?.value) {
      setStatus("mismatch");
      return;
    }
    for (const input of [nameRef, emailRef, passwordRef, confirmPasswordRef]) {
      if (input.current) input.current.value = "";
    }
    setShowPassword(false);
    setStatus("reviewed");
  }

  return <div className="login-form" onChange={() => setStatus("idle")} aria-describedby="register-preview-notice">
    <p id="register-preview-notice" className="login-notice">
      <strong>{words(locale, "注册界面预览", "Registration interface preview")}</strong>
      <span>{words(locale, "账户服务尚未接入。请勿填写真实个人资料或密码；此页面不会发送或保存内容。", "Account services are not connected yet. Do not enter real personal details or passwords; this page will not send or store anything.")}</span>
    </p>

    <div className="field">
      <label htmlFor="register-name">{words(locale, "姓名", "Full name")}</label>
      <input ref={nameRef} id="register-name" type="text" autoComplete="off" maxLength={100} placeholder={words(locale, "请输入姓名", "Enter your full name")} />
    </div>
    <div className="field">
      <label htmlFor="register-email">{words(locale, "邮箱", "Email address")}</label>
      <input ref={emailRef} id="register-email" type="email" autoComplete="off" maxLength={160} placeholder={words(locale, "请输入邮箱", "Enter your email address")} />
    </div>
    <div className="field">
      <label htmlFor="register-password">{words(locale, "创建密码", "Create password")}</label>
      <div className="password-input-wrap">
        <input ref={passwordRef} id="register-password" type={showPassword ? "text" : "password"} autoComplete="off" maxLength={128} placeholder={words(locale, "至少 8 个字符", "At least 8 characters")} />
        <button className="password-toggle" type="button" aria-controls="register-password" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? words(locale, "隐藏", "Hide") : words(locale, "显示", "Show")}</button>
      </div>
    </div>
    <div className="field">
      <label htmlFor="register-confirm-password">{words(locale, "确认密码", "Confirm password")}</label>
      <input ref={confirmPasswordRef} id="register-confirm-password" type={showPassword ? "text" : "password"} autoComplete="off" maxLength={128} placeholder={words(locale, "再次输入密码", "Enter the password again")} aria-invalid={status === "mismatch"} aria-describedby={status === "mismatch" ? "password-mismatch" : undefined} />
      {status === "mismatch" && <p id="password-mismatch" className="field-error" role="alert">{words(locale, "两次输入的密码不一致。", "The passwords do not match.")}</p>}
    </div>

    <button className="full-width" type="button" onClick={handlePreview}>{words(locale, "预览注册操作", "Preview account creation")}</button>
    <p className="login-support-note">{words(locale, "正式开放时，注册还需要邮箱验证和隐私同意。", "Email verification and privacy consent will be required when registration opens.")}</p>
    {status === "reviewed" && <p className="login-status" role="status" aria-live="polite">{words(locale, "预览完成。资料已从页面清除，没有建立账户或保存内容。", "Preview complete. The details were cleared; no account was created and nothing was stored.")}</p>}
  </div>;
}
