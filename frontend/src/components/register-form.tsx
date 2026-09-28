"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormProgress } from "@/components/form-progress";
import { registerAccount } from "@/lib/auth-api";
import { authMessage, registrationDestination, type AuthMessage } from "@/lib/auth-form-state";
import { type Locale, words } from "@/lib/site";

export function RegisterForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [method, setMethod] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  const completed = [fullName, identifier, password, confirmation].filter((value) => value.trim()).length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage({ tone: "error", text: words(locale, "两次输入的密码不一致。", "The passwords do not match.") });
      return;
    }
    setPending(true);
    setMessage(null);
    const result = await registerAccount(process.env.NEXT_PUBLIC_API_BASE_URL, {
      fullName: fullName.trim(),
      email: method === "EMAIL" ? identifier.trim() : null,
      phone: method === "PHONE" ? identifier.trim() : null,
      password,
      agreementAccepted,
      privacyAccepted,
      locale,
    });
    setPending(false);
    if (result.status === "accepted") {
      const destination = registrationDestination(locale, result.verificationMethod);
      const query = result.verificationMethod === "PHONE" ? `?phone=${encodeURIComponent(identifier.trim())}` : "";
      router.push(`${destination}${query}`);
      return;
    }
    setMessage(authMessage(locale, result));
  }

  return <form className="login-form" onSubmit={handleSubmit}>
    <FormProgress completed={completed} total={4} locale={locale} />
    <fieldset className="auth-choice">
      <legend>{words(locale, "验证方式", "Verification method")}</legend>
      <label><input type="radio" name="registration-method" value="EMAIL" checked={method === "EMAIL"} onChange={() => { setMethod("EMAIL"); setIdentifier(""); setMessage(null); }} /> {words(locale, "邮箱", "Email")}</label>
      <label><input type="radio" name="registration-method" value="PHONE" checked={method === "PHONE"} onChange={() => { setMethod("PHONE"); setIdentifier(""); setMessage(null); }} /> {words(locale, "手机号", "Phone")}</label>
    </fieldset>

    <div className="field">
      <label htmlFor="register-name">{words(locale, "姓名", "Full name")}</label>
      <input id="register-name" type="text" autoComplete="name" maxLength={100} required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={words(locale, "请输入姓名", "Enter your full name")} />
    </div>
    <div className="field">
      <label htmlFor="register-identifier">{method === "EMAIL" ? words(locale, "邮箱", "Email address") : words(locale, "手机号码", "Phone number")}</label>
      <input id="register-identifier" type={method === "EMAIL" ? "email" : "tel"} inputMode={method === "EMAIL" ? "email" : "tel"} autoComplete={method === "EMAIL" ? "email" : "tel"} maxLength={160} required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={method === "EMAIL" ? words(locale, "请输入邮箱", "Enter your email address") : words(locale, "例如 +60123456789", "For example +60123456789")} />
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
      <label className="auth-checkbox"><input type="checkbox" required checked={agreementAccepted} onChange={(event) => setAgreementAccepted(event.target.checked)} /> <span>{words(locale, "我同意用户服务条款。", "I agree to the user terms of service.")}</span></label>
      <label className="auth-checkbox"><input type="checkbox" required checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} /> <span>{words(locale, "我已阅读并同意隐私政策。", "I have read and agree to the privacy policy.")}</span></label>
    </div>

    <button className="full-width" type="submit" disabled={pending}>{pending ? words(locale, "正在创建账户…", "Creating account…") : words(locale, "创建账户", "Create account")}</button>
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
  </form>;
}
