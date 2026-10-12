"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { resetPassword } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  const token = useSearchParams().get("token")?.trim() ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || password !== confirmation) {
      setMessage({ tone: "error", text: !token ? words(locale, "重设链接无效或不完整。", "The reset link is invalid or incomplete.") : words(locale, "两次输入的密码不一致。", "The passwords do not match.") });
      return;
    }
    setPending(true);
    const result = await resetPassword(browserApiBaseUrl(), { token, newPassword: password });
    setPending(false);
    setMessage(result.status === "ready"
      ? { tone: "success", text: words(locale, "密码已更新，请重新登录。", "Your password has been updated. Please sign in again.") }
      : authMessage(locale, result));
  }

  return <form className="login-form" onSubmit={handleSubmit}>
    <div className="field"><label htmlFor="reset-password">{words(locale, "新密码", "New password")}</label><input id="reset-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
    <div className="field"><label htmlFor="reset-confirmation">{words(locale, "确认新密码", "Confirm new password")}</label><input id="reset-confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} aria-invalid={Boolean(confirmation && confirmation !== password)} /></div>
    <button className="full-width" type="submit" disabled={pending || !token}>{pending ? words(locale, "正在更新…", "Updating…") : words(locale, "更新密码", "Update password")}</button>
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
    {message?.tone === "success" && <div className="login-help"><Link href={`/${locale}/login`}>{words(locale, "返回登录", "Return to sign in")}</Link></div>}
  </form>;
}
