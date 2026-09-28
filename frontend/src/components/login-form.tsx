"use client";

import Link from "next/link";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { authEndpoints } from "@/lib/login-auth";
import { type Locale, words } from "@/lib/site";

const loginMethods = ["password", "phone"] as const;
type AccountLoginMethod = (typeof loginMethods)[number];

export function LoginForm({ locale, onForgotPassword }: { locale: Locale; onForgotPassword?: () => void }) {
  const [method, setMethod] = useState<AccountLoginMethod>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeRequested, setCodeRequested] = useState(false);
  const accountRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  function selectMethod(nextMethod: AccountLoginMethod) {
    setMethod(nextMethod);
    setReviewed(false);
    setPhoneError(false);
    setCodeRequested(false);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + loginMethods.length) % loginMethods.length;
    const nextMethod = loginMethods[nextIndex];
    selectMethod(nextMethod);
    window.requestAnimationFrame(() => document.getElementById(`login-tab-${nextMethod}`)?.focus());
  }

  function clearFields() {
    for (const input of [accountRef, passwordRef, phoneRef, codeRef]) {
      if (input.current) input.current.value = "";
    }
    setShowPassword(false);
  }

  function handlePreview() {
    clearFields();
    setReviewed(true);
  }

  function requestCode() {
    const digits = phoneRef.current?.value.replace(/\D/g, "") ?? "";
    if (digits.length < 8) {
      setPhoneError(true);
      phoneRef.current?.focus();
      return;
    }
    setPhoneError(false);
    setCodeRequested(true);
    setCountdown(60);
  }

  const methodLabels: Record<AccountLoginMethod, string> = {
    password: words(locale, "账户登录", "Account login"),
    phone: words(locale, "手机号登录", "Phone login"),
  };

  return <div className="login-form account-login-form">
    <div className="login-method-tabs" role="tablist" aria-label={words(locale, "选择登录方式", "Choose a sign-in method")}>
      {loginMethods.map((item, index) => <button
        key={item}
        id={`login-tab-${item}`}
        type="button"
        role="tab"
        aria-selected={method === item}
        aria-controls={`login-panel-${item}`}
        tabIndex={method === item ? 0 : -1}
        onClick={() => selectMethod(item)}
        onKeyDown={(event) => handleTabKeyDown(event, index)}
      >{methodLabels[item]}</button>)}
    </div>

    {method === "password" && <div id="login-panel-password" role="tabpanel" aria-labelledby="login-tab-password" data-endpoint={authEndpoints.password}>
      <div className="field">
        <label htmlFor="account-id">{words(locale, "邮箱或用户名", "Email or username")}</label>
        <input ref={accountRef} id="account-id" type="text" autoComplete="username" maxLength={160} placeholder={words(locale, "请输入邮箱或用户名", "Enter your email or username")} onInput={() => setReviewed(false)} />
      </div>

      <div className="field">
        <label htmlFor="account-password">{words(locale, "密码", "Password")}</label>
        <div className="password-input-wrap">
          <input ref={passwordRef} id="account-password" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={128} placeholder={words(locale, "请输入密码", "Enter your password")} onInput={() => setReviewed(false)} />
          <button className="password-toggle" type="button" aria-controls="account-password" aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? words(locale, "隐藏", "Hide") : words(locale, "显示", "Show")}
          </button>
        </div>
        {onForgotPassword
          ? <button className="forgot-password-link" type="button" onClick={onForgotPassword}>{words(locale, "忘记密码？", "Forgot password?")}</button>
          : <Link className="forgot-password-link" href={`/${locale}/forgot-password`}>{words(locale, "忘记密码？", "Forgot password?")}</Link>}
      </div>

      <button className="full-width" type="button" onClick={handlePreview}>{words(locale, "立即登录", "Sign in now")}</button>
    </div>}

    {method === "phone" && <div id="login-panel-phone" role="tabpanel" aria-labelledby="login-tab-phone" data-endpoint={authEndpoints.phone}>
      <div className="field">
        <label htmlFor="account-phone">{words(locale, "手机号码", "Phone number")}</label>
        <div className="phone-input-row">
          <select aria-label={words(locale, "国家或地区代码", "Country or region code")} defaultValue="+60">
            <option value="+60">MY +60</option>
            <option value="+86">CN +86</option>
          </select>
          <input ref={phoneRef} id="account-phone" type="tel" inputMode="tel" autoComplete="tel-national" maxLength={18} aria-invalid={phoneError} aria-describedby={phoneError ? "phone-error" : undefined} placeholder={words(locale, "请输入手机号码", "Enter phone number")} onInput={() => { setPhoneError(false); setReviewed(false); }} />
        </div>
        {phoneError && <p id="phone-error" className="field-error" role="alert">{words(locale, "请输入有效的手机号码。", "Enter a valid phone number.")}</p>}
      </div>

      <div className="field">
        <label htmlFor="verification-code">{words(locale, "验证码", "Verification code")}</label>
        <div className="verification-code-row">
          <input ref={codeRef} id="verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder={words(locale, "6 位验证码", "6-digit code")} onInput={() => setReviewed(false)} />
          <button className="secondary" type="button" disabled={countdown > 0} data-endpoint={authEndpoints.requestPhoneCode} onClick={requestCode}>
            {countdown > 0 ? words(locale, `${countdown} 秒后重发`, `Resend in ${countdown}s`) : words(locale, "发送验证码", "Send code")}
          </button>
        </div>
      </div>

      {codeRequested && <p className="login-status" role="status" aria-live="polite">{words(locale, "倒计时已开始，等待后端接入验证码服务。", "Countdown started, ready for the backend verification service.")}</p>}
      <button className="full-width" type="button" onClick={handlePreview}>{words(locale, "验证并登录", "Verify and sign in")}</button>
    </div>}

    <p className="auth-integration-note">{words(locale, "登录服务尚未接入，当前操作不会发送或保存资料。", "Authentication is not connected yet. Nothing entered here is sent or stored.")}</p>
    {reviewed && <p className="login-status" role="status" aria-live="polite">{words(locale, "预览操作完成，没有资料被发送或保存。", "Preview complete. No information was sent or stored.")}</p>}
  </div>;
}
