"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { bindWechatAccount } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";

export function WechatBindForm({ locale, returnTo }: { locale: Locale; returnTo: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await bindWechatAccount(browserApiBaseUrl(), {
      identifier: identifier.trim(), password, rememberMe: false,
    });
    setPending(false);
    if (result.status === "ready") {
      router.push(returnTo);
      router.refresh();
      return;
    }
    setMessage(authMessage(locale, result));
  }

  return <form className="login-form account-login-form wechat-bind-form" onSubmit={submit}>
    <p className="wechat-bind-guidance">{words(locale,
      "请使用已验证的邮箱或手机号账号完成绑定。没有账号时，请先注册并完成验证。",
      "Use a verified email or phone account to finish linking. If you are new, register and verify your account first.")}</p>
    <div className="field">
      <label htmlFor="wechat-bind-identifier">{words(locale, "邮箱或手机号码", "Email or phone number")}</label>
      <input id="wechat-bind-identifier" autoComplete="username" required maxLength={160}
        value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
    </div>
    <div className="field">
      <label htmlFor="wechat-bind-password">{words(locale, "密码", "Password")}</label>
      <input id="wechat-bind-password" type="password" autoComplete="current-password" required minLength={8}
        maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
    </div>
    <button className="full-width" type="submit" disabled={pending}>
      {pending ? words(locale, "正在绑定…", "Linking…") : words(locale, "绑定并登录", "Link and sign in")}
    </button>
    <p className="wechat-register-guidance"><Link href={`/${locale}/login?mode=register&returnTo=${encodeURIComponent(returnTo)}`}>
      {words(locale, "没有账号？先注册", "No account? Register first")}
    </Link></p>
    {message && <p className={`login-status auth-status-${message.tone}`} role="alert">{message.text}</p>}
  </form>;
}
