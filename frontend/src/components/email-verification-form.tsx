"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { resendVerification, verifyEmail } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

export function EmailVerificationForm({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState(searchParams.get("email")?.trim() ?? "");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(searchParams.get("sent") === "1" ? 60 : 0);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function confirm() {
    if (!token && (!email.trim() || !/^[0-9]{6}$/.test(code))) {
      setMessage({ tone: "error", text: words(locale, "请输入注册邮箱和 6 位数字验证码。", "Enter your registered email and six-digit verification code.") });
      return;
    }
    setPending(true);
    const result = await verifyEmail(browserApiBaseUrl(), token ? { token } : { email: email.trim(), code });
    setPending(false);
    setVerified(result.status === "ready");
    setMessage(result.status === "ready"
      ? { tone: "success", text: words(locale, "邮箱验证成功，现在可以登录。", "Email verified. You can now sign in.") }
      : authMessage(locale, result));
  }

  async function resend() {
    if (!email.trim()) return;
    setPending(true);
    const result = await resendVerification(browserApiBaseUrl(), {
      identifier: email.trim(),
      locale,
    });
    setPending(false);
    setVerified(false);
    if (result.status === "accepted") setCooldown(60);
    setMessage(result.status === "accepted"
      ? { tone: "success", text: words(locale, "如果该邮箱可以继续验证，我们已发送新的 6 位验证码。", "If this email is eligible, a new six-digit verification code has been sent.") }
      : authMessage(locale, result));
  }

  return <div className="login-form">
    <p className="login-support-note">{words(locale, "请输入邮件中的 6 位数字验证码，验证码 5 分钟内有效。", "Enter the six-digit code from your email. It is valid for 5 minutes.")}</p>
    {!token && <div className="field"><label htmlFor="verification-email">{words(locale, "注册邮箱", "Registered email")}</label><input id="verification-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></div>}
    {!token && <div className="field"><label htmlFor="email-code">{words(locale, "6 位验证码", "Six-digit code")}</label><input id="email-code" type="text" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></div>}
    <button className="full-width" type="button" disabled={pending || (!token && (!email.trim() || code.length !== 6))} onClick={confirm}>{pending ? words(locale, "正在验证…", "Verifying…") : words(locale, "确认验证邮箱", "Verify email")}</button>
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
    {verified && <div className="login-help"><Link href={`/${locale}/login`}>{words(locale, "前往登录", "Continue to sign in")}</Link></div>}
    {token && <div className="field"><label htmlFor="resend-email">{words(locale, "没有收到邮件？输入注册邮箱", "No email? Enter your registered email")}</label><input id="resend-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></div>}
    <button className="secondary full-width" type="button" disabled={pending || cooldown > 0 || !email.trim()} onClick={resend}>{cooldown > 0 ? words(locale, `${cooldown} 秒后可重新发送`, `Resend in ${cooldown}s`) : words(locale, "重新发送验证码", "Resend verification code")}</button>
  </div>;
}
