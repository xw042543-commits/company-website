"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { verifyPhone } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { type Locale, words } from "@/lib/site";

export function PhoneVerificationForm({ locale }: { locale: Locale }) {
  const initialPhone = useSearchParams().get("phone")?.trim() ?? "";
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await verifyPhone(process.env.NEXT_PUBLIC_API_BASE_URL, { phone: phone.trim(), code: code.trim() });
    setPending(false);
    setMessage(result.status === "ready"
      ? { tone: "success", text: words(locale, "手机号码验证成功，现在可以登录。", "Phone number verified. You can now sign in.") }
      : authMessage(locale, result));
  }

  return <form className="login-form" onSubmit={handleSubmit}>
    <div className="field"><label htmlFor="verify-phone">{words(locale, "手机号码", "Phone number")}</label><input id="verify-phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={18} value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
    <div className="field"><label htmlFor="verify-code">{words(locale, "短信验证码", "SMS verification code")}</label><input id="verify-code" type="text" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} /></div>
    <button className="full-width" type="submit" disabled={pending}>{pending ? words(locale, "正在验证…", "Verifying…") : words(locale, "验证手机号码", "Verify phone number")}</button>
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
    {message?.tone === "success" && <div className="login-help"><Link href={`/${locale}/login`}>{words(locale, "前往登录", "Continue to sign in")}</Link></div>}
  </form>;
}
