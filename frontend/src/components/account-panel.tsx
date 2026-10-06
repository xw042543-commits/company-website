"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { changePassword, deleteAccount, getAccount, logout, type AccountProfile } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { type Locale, words } from "@/lib/site";
import { SavedItemsPanel } from "@/components/saved-items-panel";

export function AccountPanel({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const [demoAccount, setDemoAccount] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [pendingAction, setPendingAction] = useState<"password" | "logout" | "delete" | null>(null);

  async function loadDemoAccount(): Promise<AccountProfile | null> {
    try {
      const response = await fetch("/api/demo-session", { credentials: "include", cache: "no-store" });
      if (!response.ok) return null;
      return await response.json() as AccountProfile;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      const demo = await loadDemoAccount();
      if (!active) return;
      if (demo) {
        setAccount(demo);
        setDemoAccount(true);
        setLoading(false);
        return;
      }
      const result = await getAccount(browserApiBaseUrl());
      if (!active) return;
      if (result.status === "ready") setAccount(result.account);
      else if (result.status === "unauthorized") router.replace(`/${locale}/login`);
      else setMessage(authMessage(locale, result));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [locale, router]);

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("password");
    setMessage(null);
    const result = await changePassword(browserApiBaseUrl(), { currentPassword, newPassword });
    setPendingAction(null);
    if (result.status === "ready") {
      router.replace(`/${locale}/login`);
      router.refresh();
      return;
    }
    setMessage(authMessage(locale, result));
  }

  async function handleLogout() {
    setPendingAction("logout");
    if (demoAccount) {
      await fetch("/api/demo-session", { method: "DELETE", credentials: "include" });
      setPendingAction(null);
      router.replace(`/${locale}/login`);
      router.refresh();
      return;
    }
    const result = await logout(browserApiBaseUrl());
    setPendingAction(null);
    if (result.status === "ready") {
      router.replace(`/${locale}/login`);
      router.refresh();
      return;
    }
    setMessage(authMessage(locale, result));
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("delete");
    setMessage(null);
    const result = await deleteAccount(browserApiBaseUrl(), { currentPassword: deletePassword, confirmation: deleteConfirmation });
    setPendingAction(null);
    if (result.status === "ready") {
      router.replace(`/${locale}`);
      router.refresh();
      return;
    }
    setMessage(authMessage(locale, result));
  }

  if (loading) return <p className="login-status" role="status" aria-live="polite">{words(locale, "正在载入账户…", "Loading your account…")}</p>;
  if (!account) return message && <p className="login-status auth-status-error" role="alert">{message.text}</p>;
  const wechatLastLogin = account.wechatLastLoginAt
    ? new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(account.wechatLastLoginAt))
    : null;

  return <div className="account-panel">
    <section className="account-summary" aria-labelledby="account-summary-title">
      <div><h2 id="account-summary-title">{account.fullName}</h2><p>{words(locale, "账户建立于", "Account created")} {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", { dateStyle: "medium" }).format(new Date(account.createdAt))}</p></div>
      <button type="button" className="secondary" disabled={pendingAction !== null} onClick={handleLogout}>{pendingAction === "logout" ? words(locale, "正在退出…", "Signing out…") : words(locale, "退出登录", "Sign out")}</button>
      <dl>
        <div><dt>{words(locale, "邮箱", "Email")}</dt><dd>{account.email ?? words(locale, "未设置", "Not set")} · {account.emailVerified ? words(locale, "已验证", "Verified") : words(locale, "未验证", "Not verified")}</dd></div>
        <div><dt>{words(locale, "手机", "Phone")}</dt><dd>{account.phone ?? words(locale, "未设置", "Not set")} · {account.phoneVerified ? words(locale, "已验证", "Verified") : words(locale, "未验证", "Not verified")}</dd></div>
        <div><dt>{words(locale, "微信", "WeChat")}</dt><dd className="account-provider-detail">
          <strong className={account.wechatLinked ? "is-linked" : undefined}>{account.wechatLinked ? words(locale, "已绑定", "Linked") : words(locale, "未绑定", "Not linked")}</strong>
          {wechatLastLogin ? <span>{words(locale, "最近登录", "Last sign-in")} {wechatLastLogin}</span> : null}
        </dd></div>
      </dl>
      {demoAccount && <p className="demo-account-note">{words(locale, "这是仅用于本地测试的演示账户，不会保存任何账户更改。", "This local demo account is for testing only and does not save account changes.")}</p>}
    </section>

    <SavedItemsPanel locale={locale} />

    {!demoAccount && <><section className="account-section" aria-labelledby="password-title">
      <h2 id="password-title">{words(locale, "修改密码", "Change password")}</h2>
      <p>{words(locale, "修改后所有设备都会退出登录。", "Changing your password signs you out on every device.")}</p>
      <form onSubmit={handlePassword}>
        <div className="field"><label htmlFor="current-password">{words(locale, "当前密码", "Current password")}</label><input id="current-password" type="password" autoComplete="current-password" required maxLength={128} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></div>
        <div className="field"><label htmlFor="new-password">{words(locale, "新密码", "New password")}</label><input id="new-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div>
        <button type="submit" disabled={pendingAction !== null}>{pendingAction === "password" ? words(locale, "正在更新…", "Updating…") : words(locale, "更新密码", "Update password")}</button>
      </form>
    </section>

    <section className="account-section account-danger" aria-labelledby="delete-title">
      <h2 id="delete-title">{words(locale, "注销账户", "Delete account")}</h2>
      <p>{words(locale, "此操作会停用账户并退出所有设备。请输入当前密码和大写 DELETE 确认。", "This disables your account and signs out every device. Enter your password and type DELETE to confirm.")}</p>
      <form onSubmit={handleDelete}>
        <div className="field"><label htmlFor="delete-password">{words(locale, "当前密码", "Current password")}</label><input id="delete-password" type="password" autoComplete="current-password" required maxLength={128} value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} /></div>
        <div className="field"><label htmlFor="delete-confirmation">{words(locale, "确认文字", "Confirmation text")}</label><input id="delete-confirmation" type="text" autoComplete="off" required pattern="DELETE" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder="DELETE" /></div>
        <button type="submit" className="danger-button" disabled={pendingAction !== null || deleteConfirmation !== "DELETE"}>{pendingAction === "delete" ? words(locale, "正在注销…", "Deleting…") : words(locale, "注销账户", "Delete account")}</button>
      </form>
    </section></>}
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
  </div>;
}
