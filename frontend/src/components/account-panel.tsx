"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { changePassword, deleteAccount, getAccount, logout, type AccountProfile } from "@/lib/auth-api";
import { authMessage, type AuthMessage } from "@/lib/auth-form-state";
import { type Locale, words } from "@/lib/site";

export function AccountPanel({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [pendingAction, setPendingAction] = useState<"password" | "logout" | "delete" | null>(null);

  useEffect(() => {
    let active = true;
    void getAccount(process.env.NEXT_PUBLIC_API_BASE_URL).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.status === "ready") setAccount(result.account);
      else if (result.status === "unauthorized") router.replace(`/${locale}/login`);
      else setMessage(authMessage(locale, result));
    });
    return () => { active = false; };
  }, [locale, router]);

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("password");
    setMessage(null);
    const result = await changePassword(process.env.NEXT_PUBLIC_API_BASE_URL, { currentPassword, newPassword });
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
    const result = await logout(process.env.NEXT_PUBLIC_API_BASE_URL);
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
    const result = await deleteAccount(process.env.NEXT_PUBLIC_API_BASE_URL, { currentPassword: deletePassword, confirmation: deleteConfirmation });
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

  return <div className="account-panel">
    <section className="account-summary" aria-labelledby="account-summary-title">
      <div><h2 id="account-summary-title">{account.fullName}</h2><p>{words(locale, "账户建立于", "Account created")} {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", { dateStyle: "medium" }).format(new Date(account.createdAt))}</p></div>
      <button type="button" className="secondary" disabled={pendingAction !== null} onClick={handleLogout}>{pendingAction === "logout" ? words(locale, "正在退出…", "Signing out…") : words(locale, "退出登录", "Sign out")}</button>
      <dl>
        <div><dt>{words(locale, "邮箱", "Email")}</dt><dd>{account.email ?? words(locale, "未设置", "Not set")} · {account.emailVerified ? words(locale, "已验证", "Verified") : words(locale, "未验证", "Not verified")}</dd></div>
        <div><dt>{words(locale, "手机", "Phone")}</dt><dd>{account.phone ?? words(locale, "未设置", "Not set")} · {account.phoneVerified ? words(locale, "已验证", "Verified") : words(locale, "未验证", "Not verified")}</dd></div>
      </dl>
    </section>

    <section className="account-section" aria-labelledby="password-title">
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
    </section>
    {message && <p className={`login-status auth-status-${message.tone}`} role={message.tone === "error" ? "alert" : "status"} aria-live="polite">{message.text}</p>}
  </div>;
}
