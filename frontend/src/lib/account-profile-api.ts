import { adminWrite, type AdminApiResult } from "./admin-catalog-api.ts";
import { parseAccount, type AccountProfile } from "./auth-api.ts";

export type ProfileChanges = { fullName: string; avatarAction: string; expectedUpdatedAt?: string; contentType?: string; contentBase64?: string };
export async function saveOwnProfile(baseUrl: string | undefined, changes: ProfileChanges): Promise<AdminApiResult<AccountProfile>> {
  // Explicit allowlist: the self-service endpoint never accepts a target user ID.
  const result = await adminWrite<unknown>(baseUrl, "/api/v1/account/profile", "PATCH", {
    fullName: changes.fullName, avatarAction: changes.avatarAction, expectedUpdatedAt: changes.expectedUpdatedAt,
    ...(changes.avatarAction === "REPLACE" ? { contentType: changes.contentType, contentBase64: changes.contentBase64 } : {}),
  });
  if (result.status !== "ready") return result;
  const account = parseAccount(result.value);
  return account ? { status: "ready", value: account } : { status: "error", message: "保存结果无法识别，请刷新后核对资料" };
}
