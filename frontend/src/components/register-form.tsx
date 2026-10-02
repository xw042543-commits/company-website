"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthSuccessFeedback } from "@/components/auth-success-feedback";
import { FormProgress } from "@/components/form-progress";
import { registerAccount } from "@/lib/auth-api";
import { authMessage, registrationDestination, type AuthMessage } from "@/lib/auth-form-state";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

export function RegisterForm({ locale }: { locale: Locale; returnTo?: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const completed = [fullName, identifier, password, confirmation].filter((value) => value.trim()).length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage({ tone: "error", text: words(locale, "两次输入的密码不一致。", "The passwords do not match.") });
      return;
    }
    setPending(true);
    setMessage(null);
    const result = await registerAccount(browserApiBaseUrl(), {
      fullName: fullName.trim(),
      email: identifier.trim(),
      phone: null,
      password,
      agreementAccepted,
      privacyAccepted,
      locale,
    });
    setPending(false);
    if (result.status === "accepted") {
      const destination = registrationDestination(locale, result.verificationMethod);
      const query = `?email=${encodeURIComponent(identifier.trim())}&sent=1`;
      setRegistrationComplete(true);
      window.setTimeout(() => router.push(`${destination}${query}`), 1100);
      return;
    }
    setMessage(authMessage(locale, result));
  }

  if (registrationComplete) return <AuthSuccessFeedback locale={locale} kind="registration" />;

  return <form className="login-form" onSubmit={handleSubmit}>
    <FormProgress completed={completed} total={4} locale={locale} />
    <div className="field">
      <label htmlFor="register-name">{words(locale, "姓名", "Full name")}</label>
      <input id="register-name" type="text" autoComplete="name" maxLength={100} required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={words(locale, "请输入姓名", "Enter your full name")} />
    </div>
    <div className="field">
      <label htmlFor="register-identifier">{words(locale, "邮箱", "Email address")}</label>
      <input id="register-identifier" type="email" inputMode="email" autoComplete="email" maxLength={160} required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={words(locale, "请输入邮箱", "Enter your email address")} />
    </div>
    <div className="field">
      <label htmlFor="register-password">{words(locale, "创建密码", "Create password")}</label>
      <div className="password-input-wrap">
        <input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={words(locale, "至少 12 个字符", "At least 12 characters")} />
        <button className="password-toggle" type="button" aria-controls="register-password" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? words(locale, "隐藏", "Hide") : words(locale, "显示", "Show")}</button>
      </div>
    </div>
    <div className="field">
      <label htmlFor="register-confirm-password">{words(locale, "确认密码", "Confirm password")}</label>
      <input id="register-confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setMessage(null); }} placeholder={words(locale, "再次输入密码", "Enter the password again")} aria-invalid={Boolean(confirmation && password !== confirmation)} />
    </div>

    <div className="auth-consents">
      <label className="auth-checkbox"><input type="checkbox" required checked={agreementAccepted} onChange={(event) => setAgreementAccepted(event.target.checked)} /> <span>{words(locale, "我已阅读并同意", "I have read and agree to the ")}<Link href={`/${locale}/terms`}>{words(locale, "《用户协议》", "User Agreement")}</Link>{words(locale, "。", ".")}</span></label>
      <label className="auth-checkbox"><input type="checkbox" required checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} /> <span>{words(locale, "我已阅读并同意", "I have read and agree to the ")}<Link href={`/${locale}/privacy`}>{words(locale, "《隐私政策》", "Privacy Policy")}</Link>{words(locale, "。", ".")}</span></label>
    </div>

    <button className="full-width" type="submit" disabled={pending}>{pending ? words(locale, "正在创建账户…", "Creating account…") : words(locale, "创建账户", "Create account")}</button>
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
  </form>;
}
