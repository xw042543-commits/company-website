import { adviserClient, type AdviserFailure } from "./adviser-consultation-api.ts";

export type ModerationTargetType = "POST" | "COMMENT";
export type ModerationContentStatus = "PENDING_REVIEW" | "PUBLISHED" | "HIDDEN" | "DELETED" | "REJECTED";
export type ModerationCommand = "HIDE" | "RESTORE" | "REJECT_REPORT" | "MUTE" | "BAN";
export type ModerationAction = Readonly<{ command: ModerationCommand; reasonCode: string; version: number; restrictionEndsAt?: string | null }>;
export type ModerationResult<T> = { status: "ready"; value: T } | AdviserFailure;
export type ModerationQueueItem = {
  targetType: ModerationTargetType; targetId: string; status: ModerationContentStatus; bodyPreview: string;
  version: number; openReportCount: number; createdAt: string;
};
export type ModerationQueue = { items: ModerationQueueItem[]; nextCursor: string | null };
export type ModerationReportSummary = { reasonCode: string; status: "OPEN" | "RESOLVED_ACTIONED" | "RESOLVED_REJECTED"; count: number };
export type ModerationHistoryAction = { id: string; command: ModerationCommand; reasonCode: string;
  previousStatus: ModerationContentStatus | null; nextStatus: ModerationContentStatus | null; createdAt: string };
export type ModerationDetail = {
  targetType: ModerationTargetType; targetId: string; status: ModerationContentStatus; body: string;
  postId: string | null; parentCommentId: string | null; version: number; openReportCount: number;
  reports: ModerationReportSummary[]; actions: ModerationHistoryAction[]; actionsNextCursor: string | null;
};
export type ModerationQueueFilters = {
  status?: string; targetType?: string; reasonCode?: string; from?: string; to?: string; cursor?: string; size?: number | string;
};
export type ModerationDetailFilters = { actionsCursor?: string };

const ROOT = "/api/v1/adviser/community/moderation";
const { record, exact, integer, timestamp, endpoint, failure, readJson, read } = adviserClient;
const contentStatuses = ["PENDING_REVIEW", "PUBLISHED", "HIDDEN", "DELETED", "REJECTED"];
const commands = ["HIDE", "RESTORE", "REJECT_REPORT", "MUTE", "BAN"];
const reportReasons = ["SPAM", "HARASSMENT", "SCAM", "INAPPROPRIATE_CONTENT", "OTHER"];
const decisionReasons = ["SPAM", "HARASSMENT", "SCAM", "INAPPROPRIATE_CONTENT", "POLICY_VIOLATION",
  "APPEAL_ACCEPTED", "REVIEW_APPROVED", "REPORT_UNFOUNDED"];
const token = (value: unknown, values: string[]): value is string => typeof value === "string" && values.includes(value);
const targetType = (value: unknown): value is ModerationTargetType => value === "POST" || value === "COMMENT";
const decimalId = (value: unknown): value is string => typeof value === "string" && /^[1-9][0-9]{0,18}$/.test(value)
  && (value.length < 19 || value <= "9223372036854775807");
const cursor = (value: unknown): value is string => typeof value === "string" && value.length > 0
  && value.length <= 4096 && !/[\x00-\x20\x7f]/.test(value);
const nullableCursor = (value: unknown) => value === null || cursor(value);
const bodyText = (value: unknown, max: number) => typeof value === "string" && value.trim().length > 0 && [...value].length <= max;
const previewText = (value: unknown) => typeof value === "string" && [...value].length <= 160;

function targetFields(value: Record<string, unknown>) {
  return targetType(value.targetType) && decimalId(value.targetId) && token(value.status, contentStatuses)
    && integer(value.version) && integer(value.openReportCount);
}
function parseItem(value: unknown): ModerationQueueItem | null {
  return record(value) && exact(value, ["targetType", "targetId", "status", "bodyPreview", "version", "openReportCount", "createdAt"])
    && targetFields(value) && previewText(value.bodyPreview) && timestamp(value.createdAt) ? value as ModerationQueueItem : null;
}
function parseQueue(value: unknown): ModerationQueue | null {
  return record(value) && exact(value, ["items", "nextCursor"]) && Array.isArray(value.items) && value.items.length <= 50
    && value.items.every((item) => parseItem(item) !== null) && nullableCursor(value.nextCursor) ? value as ModerationQueue : null;
}
function parseReport(value: unknown): ModerationReportSummary | null {
  return record(value) && exact(value, ["reasonCode", "status", "count"]) && token(value.reasonCode, reportReasons)
    && token(value.status, ["OPEN", "RESOLVED_ACTIONED", "RESOLVED_REJECTED"]) && integer(value.count, 1)
    ? value as ModerationReportSummary : null;
}
function parseHistory(value: unknown): ModerationHistoryAction | null {
  return record(value) && exact(value, ["id", "command", "reasonCode", "previousStatus", "nextStatus", "createdAt"])
    && decimalId(value.id) && token(value.command, commands) && token(value.reasonCode, decisionReasons)
    && (value.previousStatus === null || token(value.previousStatus, contentStatuses))
    && (value.nextStatus === null || token(value.nextStatus, contentStatuses)) && timestamp(value.createdAt)
    ? value as ModerationHistoryAction : null;
}
function parseDetail(value: unknown): ModerationDetail | null {
  if (!record(value) || !exact(value, ["targetType", "targetId", "status", "body", "postId", "parentCommentId", "version", "openReportCount", "reports", "actions", "actionsNextCursor"])
    || !targetFields(value) || !bodyText(value.body, value.targetType === "POST" ? 2000 : 1000)
    || (value.targetType === "POST" ? value.postId !== null || value.parentCommentId !== null
      : !decimalId(value.postId) || !(value.parentCommentId === null || decimalId(value.parentCommentId)))
    || !Array.isArray(value.reports) || !value.reports.every((report) => parseReport(report) !== null)
    || !Array.isArray(value.actions) || value.actions.length > 20 || !value.actions.every((action) => parseHistory(action) !== null)
    || !nullableCursor(value.actionsNextCursor)) return null;
  return value as ModerationDetail;
}

function queryFields(value: unknown, keys: string[]): Record<string, unknown> | null {
  if (value instanceof URLSearchParams) {
    if ([...value.keys()].some((key) => !keys.includes(key) || value.getAll(key).length !== 1)) return null;
    return Object.fromEntries(value);
  }
  return record(value) && Object.keys(value).every((key) => keys.includes(key)) ? value : null;
}
function queueQuery(filters: ModerationQueueFilters | URLSearchParams): URLSearchParams | null {
  const fields = queryFields(filters, ["status", "targetType", "reasonCode", "from", "to", "cursor", "size"]);
  if (!fields) return null;
  const status = fields.status === undefined ? "PENDING" : fields.status;
  const size = fields.size === undefined ? 20 : typeof fields.size === "string" && /^[1-9]\d*$/.test(fields.size) ? Number(fields.size) : fields.size;
  if (!token(status, ["PENDING", "HIDDEN", "PROCESSED"]) || !integer(size, 1) || size > 50
    || (fields.targetType !== undefined && !targetType(fields.targetType))
    || (fields.reasonCode !== undefined && !token(fields.reasonCode, reportReasons))
    || (fields.from !== undefined && !timestamp(fields.from)) || (fields.to !== undefined && !timestamp(fields.to))
    || (typeof fields.from === "string" && typeof fields.to === "string" && Date.parse(fields.from) > Date.parse(fields.to))
    || (fields.cursor !== undefined && !cursor(fields.cursor))) return null;
  const query = new URLSearchParams({ status, size: String(size) });
  for (const key of ["targetType", "reasonCode", "from", "to", "cursor"]) {
    if (typeof fields[key] === "string") query.set(key, fields[key]);
  }
  return query;
}
function validAction(value: unknown): value is ModerationAction {
  if (!record(value) || !exact(value, Object.hasOwn(value, "restrictionEndsAt")
    ? ["command", "reasonCode", "version", "restrictionEndsAt"] : ["command", "reasonCode", "version"])
    || !token(value.command, commands) || !token(value.reasonCode, decisionReasons)
    || !integer(value.version) || value.version === Number.MAX_SAFE_INTEGER) return false;
  const reason = value.command === "RESTORE" ? ["APPEAL_ACCEPTED", "REVIEW_APPROVED"].includes(value.reasonCode)
    : value.command === "REJECT_REPORT" ? value.reasonCode === "REPORT_UNFOUNDED"
      : ["SPAM", "HARASSMENT", "SCAM", "INAPPROPRIATE_CONTENT", "POLICY_VIOLATION"].includes(value.reasonCode);
  return reason && (value.command === "MUTE" ? timestamp(value.restrictionEndsAt)
    : value.restrictionEndsAt === undefined || value.restrictionEndsAt === null);
}

export async function loadCommunityModerationQueue(baseUrl: string | undefined, filters: ModerationQueueFilters | URLSearchParams = {},
  request: typeof fetch = fetch): Promise<ModerationResult<ModerationQueue>> {
  const url = endpoint(baseUrl, ROOT);
  if (!url || typeof request !== "function") return { status: "error" };
  const query = queueQuery(filters);
  if (!query) return { status: "validation-error" };
  url.search = query.toString();
  const result = await read(url, parseQueue, request);
  return result.status === "ready" && result.value.items.length > Number(query.get("size")) ? { status: "error" } : result;
}
export async function loadCommunityModerationDetail(baseUrl: string | undefined, type: ModerationTargetType, id: string,
  filters: ModerationDetailFilters | URLSearchParams = {}, request: typeof fetch = fetch): Promise<ModerationResult<ModerationDetail>> {
  const url = endpoint(baseUrl, ROOT);
  if (!url || typeof request !== "function") return { status: "error" };
  const fields = queryFields(filters, ["actionsCursor"]);
  if (!targetType(type) || !decimalId(id) || !fields || (fields.actionsCursor !== undefined && !cursor(fields.actionsCursor))) return { status: "validation-error" };
  url.pathname += `/${type}/${id}`;
  if (typeof fields.actionsCursor === "string") url.searchParams.set("actionsCursor", fields.actionsCursor);
  const result = await read(url, parseDetail, request);
  return result.status === "ready" && (result.value.targetType !== type || result.value.targetId !== id) ? { status: "error" } : result;
}
export async function submitCommunityModerationAction(baseUrl: string | undefined, type: ModerationTargetType, id: string,
  action: ModerationAction, request: typeof fetch = fetch): Promise<ModerationResult<ModerationDetail>> {
  const url = endpoint(baseUrl, ROOT), csrfUrl = endpoint(baseUrl, "/api/v1/auth/csrf");
  if (!url || !csrfUrl || typeof request !== "function") return { status: "error" };
  if (!targetType(type) || !decimalId(id) || !validAction(action)) return { status: "validation-error" };
  const csrf = await adviserClient.csrf(csrfUrl, request);
  if (csrf.status !== "ready") return csrf;
  url.pathname += `/${type}/${id}/actions`;
  try {
    const response = await request(url, { method: "POST", cache: "no-store", credentials: "include",
      headers: { "Content-Type": "application/json", [csrf.value.headerName]: csrf.value.token },
      body: JSON.stringify({ command: action.command, reasonCode: action.reasonCode, version: action.version,
        restrictionEndsAt: action.restrictionEndsAt ?? null }), signal: AbortSignal.timeout(5_000) });
    if (response.status !== 200) return failure(response.status);
    const value = await readJson(response, parseDetail);
    return value && value.targetType === type && value.targetId === id && value.version === action.version + 1
      ? { status: "ready", value } : { status: "error" };
  } catch { return { status: "unavailable" }; }
}
