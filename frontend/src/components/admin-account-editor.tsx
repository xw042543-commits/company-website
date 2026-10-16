"use client";
import { adminWrite } from "@/lib/admin-catalog-api";
import { accountStatuses, type ManagedAccount } from "@/lib/admin-account-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { ProfileEditor } from "./profile-editor";

export function AdminAccountEditor({ account, onCancel, onSaved }: { account: ManagedAccount; onCancel: () => void; onSaved: (account: ManagedAccount) => void }) {
  return <ProfileEditor account={account} onCancel={onCancel} onSaved={onSaved} title="编辑账号" statusLabel={accountStatuses[account.status]}
    saveProfile={body => adminWrite<ManagedAccount>(browserApiBaseUrl(), `/api/v1/admin/accounts/${account.id}/profile`, "PATCH", body)} />;
}
