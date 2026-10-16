export type ManagedAccount = {
  id: number; fullName: string; avatarUrl?: string | null; email: string | null; phone: string | null;
  role: string; permissions?: string[]; status: string; advanced: boolean; createdAt: string; updatedAt: string;
};
export const permissionOptions = [{ value: "ADMIN", label: "普通管理员" }, { value: "ADVISER", label: "顾问" }] as const;
export type AccountPermission = typeof permissionOptions[number]["value"];
export function accountPermissions(account: { role: string; permissions?: string[] }): string[] {
  return account.permissions ?? (account.role === "ADMIN" || account.role === "ADVISER" ? [account.role] : []);
}
export const accountStatuses: Record<string, string> = { ACTIVE: "正常", PENDING_VERIFICATION: "待验证", DISABLED: "已禁用", DELETED: "已注销" };
export function accountIdentity(account: Pick<ManagedAccount, "role" | "advanced" | "permissions">) {
  const granted = accountPermissions(account);
  const labels = account.advanced ? ["高级管理员"] : [];
  for (const option of permissionOptions) if (granted.includes(option.value) && !(account.advanced && option.value === "ADMIN")) labels.push(option.label);
  return labels.join("、") || "普通用户";
}
export function accountListPath(q: string, status: string, identity: string, page: number) {
  return `/api/v1/admin/accounts?${new URLSearchParams({ q, status, identity, page: String(page), size: "20" })}`;
}
export function canChangePermission(account: ManagedAccount, self: number, permission: AccountPermission) {
  return self > 0 && account.status !== "DELETED" && permissionOptions.some(option => option.value === permission);
}
