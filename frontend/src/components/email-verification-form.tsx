"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resendVerification, verifyEmail } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { type Locale, words } from "@/lib/site";

export function EmailVerificationForm({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState(searchParams.get("email")?.trim() ?? "");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  async function confirm() {
    if (!token) {
      setMessage({ tone: "error", text: words(locale, "验证链接无效或不完整，请重新申请。", "The verification link is invalid or incomplete. Request a new one.") });
      return;
    }
    setPending(true);
    const result = await verifyEmail(process.env.NEXT_PUBLIC_API_BASE_URL, { token });
    setPending(false);
    setVerified(result.status === "ready");
    setMessage(result.status === "ready"
      ? { tone: "success", text: words(locale, "邮箱验证成功，现在可以登录。", "Email verified. You can now sign in.") }
      : authMessage(locale, result));
  }

  async function resend() {
    if (!email.trim()) return;
    setPending(true);
    const result = await resendVerification(process.env.NEXT_PUBLIC_API_BASE_URL, {
      identifier: email.trim(),
      locale,
    });
    setPending(false);
    setVerified(false);
    setMessage(result.status === "accepted"
      ? { tone: "success", text: words(locale, "如果该邮箱可以继续验证，我们已发送新的验证邮件。", "If this email is eligible, new verification instructions have been sent.") }
      : authMessage(locale, result));
  }

  return <div className="login-form">
    <p className="login-support-note">{words(locale, "为了保护账户，请确认后再完成邮箱验证。", "For account security, confirm before completing email verification.")}</p>
    <button className="full-width" type="button" disabled={pending || !token} onClick={confirm}>{pending ? words(locale, "正在验证…", "Verifying…") : words(locale, "确认验证邮箱", "Verify email")}</button>
    {!token && <p className="field-error" role="alert">{words(locale, "当前链接缺少验证凭证。", "This link is missing its verification token.")}</p>}
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
    {verified && <div className="login-help"><Link href={`/${locale}/login`}>{words(locale, "前往登录", "Continue to sign in")}</Link></div>}
    <div className="field"><label htmlFor="resend-email">{words(locale, "没有收到邮件？输入注册邮箱", "No email? Enter your registered email")}</label><input id="resend-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></div>
    <button className="secondary full-width" type="button" disabled={pending || !email.trim()} onClick={resend}>{words(locale, "重新发送验证邮件", "Resend verification email")}</button>
  </div>;
}
