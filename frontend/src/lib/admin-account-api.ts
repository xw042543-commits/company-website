export type ManagedAccount = {
  id: number; fullName: string; avatarUrl?: string | null; email: string | null; phone: string | null;
  role: string; status: string; advanced: boolean; createdAt: string; updatedAt: string;
};
export const accountStatuses: Record<string, string> = { ACTIVE: "正常", PENDING_VERIFICATION: "待验证", DISABLED: "已禁用", DELETED: "已注销" };
export function accountIdentity(account: Pick<ManagedAccount, "role" | "advanced">) {
  if (account.role === "ADMIN") return account.advanced ? "高级管理员" : "普通管理员";
  return account.role === "ADVISER" ? "顾问" : "普通用户";
}
export function accountListPath(q: string, status: string, identity: string, page: number) {
  return `/api/v1/admin/accounts?${new URLSearchParams({ q, status, identity, page: String(page), size: "20" })}`;
}
export function canChangeIdentity(account: ManagedAccount, self: number) {
  return account.id !== self && !account.advanced && account.status !== "DELETED"
    && (account.role === "ADMIN" || (account.role === "USER" && account.status === "ACTIVE"));
}
