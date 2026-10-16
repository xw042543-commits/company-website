"use client";
import { accountPermissions, canChangePermission, permissionOptions, type AccountPermission, type ManagedAccount } from "@/lib/admin-account-api";
import styles from "./admin-account-panel.module.css";

export function AccountPermissionSwitches({ account, self, busy, onChange }: {
  account: ManagedAccount; self: number; busy: boolean;
  onChange: (permission: AccountPermission, enabled: boolean) => void;
}) {
  return <div className={styles.permissionControls} role="group" aria-label={`${account.fullName}的权限`}>
    {permissionOptions.map(option => <label key={option.value}>
      <input type="checkbox" checked={accountPermissions(account).includes(option.value)}
        aria-label={`${account.fullName}：${option.label}`} disabled={busy || !canChangePermission(account, self, option.value)}
        onChange={event => onChange(option.value, event.target.checked)} />{option.label}
    </label>)}
    {account.advanced && <small>高级授权独立保留，不受这两个开关影响。</small>}
    {account.status !== "ACTIVE" && account.status !== "DELETED" && <small>配置权限不会启用账号或完成账号验证。</small>}
  </div>;
}
