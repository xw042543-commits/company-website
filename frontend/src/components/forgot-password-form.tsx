"use client";

import { type FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const [identifier, setIdentifier] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await requestPasswordReset(browserApiBaseUrl(), {
      identifier: identifier.trim(), locale,
    });
    setPending(false);
    setMessage(result.status === "accepted"
      ? { tone: "success", text: words(locale, "如果该账户存在，我们会发送密码重设说明。", "If the account exists, password reset instructions will be sent.") }
      : authMessage(locale, result));
  }

  return <form className="login-form" onSubmit={handleSubmit}>
    <div className="field">
      <label htmlFor="recovery-identifier">{words(locale, "邮箱或手机号码", "Email or phone number")}</label>
      <input id="recovery-identifier" type="text" autoComplete="username" maxLength={160} required value={identifier} onChange={(event) => { setIdentifier(event.target.value); setMessage(null); }} placeholder={words(locale, "请输入注册邮箱或手机号码", "Enter your registered email or phone number")} />
    </div>
    <button className="full-width" type="submit" disabled={pending}>{pending ? words(locale, "正在提交…", "Submitting…") : words(locale, "发送重设说明", "Send reset instructions")}</button>
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
  </form>;
}
