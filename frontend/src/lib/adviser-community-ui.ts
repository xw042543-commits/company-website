import type { ModerationCommand, ModerationContentStatus, ModerationDetail, ModerationPostMetadata, ModerationQueueFilters, ModerationQueueItem, ModerationResult } from "./adviser-community-api.ts";
import type { AdviserFailure } from "./adviser-consultation-api.ts";
import { type Locale, words } from "./site.ts";

export function moderationWaitingHint(locale: Locale, item: Pick<ModerationQueueItem, "status" | "targetType" | "slaState">):
  { text: string; ariaLabel: string } | null {
  if (item.status !== "PENDING_REVIEW") return null;
  const labels = {
    ON_TIME: words(locale, "等待审核 · 未满 12 小时", "Awaiting review · under 12 hours"),
    WARNING: words(locale, "等待审核 · 已满 12 小时", "Awaiting review · at least 12 hours"),
    OVERDUE: words(locale, "审核超时 · 已满 24 小时", "Review overdue · at least 24 hours"),
  };
  const text = labels[item.slaState];
  const target = item.targetType === "POST" ? words(locale, "帖子", "Post") : words(locale, "评论", "Comment");
  return { text, ariaLabel: `${target}${locale === "zh" ? "：" : ": "}${text}` };
}

export function moderationPostContext(locale: Locale, post: ModerationPostMetadata): string {
  const labels: Record<string, [string, string]> = { GENERAL: ['日常交流', 'Daily life'], NEWCOMER: ['新生报到', 'New arrivals'],
    HOUSING: ['租房室友', 'Housing & roommates'], MARKETPLACE: ['二手闲置', 'Secondhand'], STUDY: ['学习求助', 'Study help'], MEETUP: ['周末搭子', 'Weekend meetups'] };
  const label = labels[post.category ?? 'GENERAL'] ?? labels.GENERAL;
  return [words(locale, label[0], label[1]), post.universityName].filter(Boolean).join(' · ');
}

export function moderationReasonLabel(locale: Locale, reason: string): string {
  const w = (zh: string, en: string) => words(locale, zh, en);
  return ({
    SPAM: w("垃圾信息", "Spam"), HARASSMENT: w("骚扰", "Harassment"), SCAM: w("诈骗", "Scam"),
    INAPPROPRIATE_CONTENT: w("不当内容", "Inappropriate content"), OTHER: w("其他", "Other"),
    POLICY_VIOLATION: w("违反社区规则", "Policy violation"), APPEAL_ACCEPTED: w("申诉成立", "Appeal accepted"),
    REVIEW_APPROVED: w("审核通过", "Review approved"), REPORT_UNFOUNDED: w("举报不成立", "Report unfounded"),
    REPORT_THRESHOLD: w("举报数量达到保护阈值", "Report threshold reached"),
  })[reason] ?? w("未知原因", "Unknown reason");
}

export function moderationCommandLabel(locale: Locale, command: string): string {
  const w = (zh: string, en: string) => words(locale, zh, en);
  return ({ HIDE: w("隐藏内容", "Hide content"), RESTORE: w("恢复内容", "Restore content"),
    REJECT: w("拒绝发布", "Reject content"), REJECT_REPORT: w("驳回举报", "Reject reports"), MUTE: w("禁言作者", "Mute author"), BAN: w("封禁作者", "Ban author"),
    RELEASE: w("解除作者封禁／禁言", "Lift author restrictions"), AUTO_HIDE: w("系统自动隐藏", "Automatically hidden"),
  })[command] ?? w("未知操作", "Unknown action");
}

export const reportReasons = ["SPAM", "HARASSMENT", "SCAM", "INAPPROPRIATE_CONTENT", "OTHER"] as const;
const enforcementReasons = ["SPAM", "HARASSMENT", "SCAM", "INAPPROPRIATE_CONTENT", "POLICY_VIOLATION"];
export function reasonsForCommand(command: ModerationCommand): string[] {
  return command === "RELEASE" ? ["APPEAL_ACCEPTED"] : command === "RESTORE" ? ["APPEAL_ACCEPTED", "REVIEW_APPROVED"]
    : command === "REJECT_REPORT" ? ["REPORT_UNFOUNDED"] : enforcementReasons;
}

export function muteExpiry(value: string, now = Date.now()): string | null {
  const expiry = value ? Date.parse(value) : now + 24 * 60 * 60 * 1000;
  return Number.isFinite(expiry) && expiry > now && expiry <= now + 30 * 24 * 60 * 60 * 1000
    ? new Date(expiry).toISOString() : null;
}

export function canSubmitModeration(input: {
  command: ModerationCommand; reasonCode: string; version: number; confirmed?: boolean;
  busy?: boolean; needsReload?: boolean; expiry?: string; now?: number; contentStatus?: ModerationContentStatus; authorRestricted?: boolean;
}): boolean {
  return !input.busy && !input.needsReload && Number.isSafeInteger(input.version) && input.version >= 0
    && input.version < Number.MAX_SAFE_INTEGER && reasonsForCommand(input.command).includes(input.reasonCode)
    && (!["HIDE", "REJECT", "BAN"].includes(input.command) || input.confirmed === true)
    && (input.command !== "REJECT" || input.contentStatus === "PENDING_REVIEW")
    && (input.command !== "RELEASE" || input.authorRestricted === true)
    && (input.command !== "MUTE" || muteExpiry(input.expiry ?? "", input.now) !== null);
}

export function afterModerationFailure<T extends { selectedId: string; refreshDetail: boolean }>(state: T, failure: AdviserFailure) {
  return failure.status === "conflict" ? { ...state, refreshDetail: true, needsReload: true } : { ...state, refreshDetail: false };
}

export async function resolveModerationHistoryPage(previous: ModerationDetail, page: ModerationDetail,
  reloadHead: () => Promise<ModerationResult<ModerationDetail>>): Promise<ModerationResult<ModerationDetail>> {
  // A continuation at a new version omits the latest decisions; only a fresh head can unlock moderation.
  if (previous.version !== page.version) return reloadHead();
  return { status: "ready", value: { ...page,
    actions: [...previous.actions, ...page.actions.filter((action) => !previous.actions.some((item) => item.id === action.id))],
  } };
}

export type QueueFilterDraft = { status: "PENDING" | "PROCESSED" | "HIDDEN"; targetType: string; reasonCode: string; from: string; to: string };
export function moderationQueueFilters(draft: QueueFilterDraft): ModerationQueueFilters | null {
  const result: ModerationQueueFilters = { status: draft.status, size: 20 };
  if (!["PENDING", "PROCESSED", "HIDDEN"].includes(draft.status)
    || (draft.targetType && !["POST", "COMMENT"].includes(draft.targetType))
    || (draft.reasonCode && !reportReasons.some((reason) => reason === draft.reasonCode))) return null;
  if (draft.targetType) result.targetType = draft.targetType;
  if (draft.reasonCode) result.reasonCode = draft.reasonCode;
  for (const key of ["from", "to"] as const) {
    if (!draft[key]) continue;
    if (!Number.isFinite(Date.parse(draft[key]))) return null;
    result[key] = new Date(draft[key]).toISOString();
  }
  return result.from && result.to && Date.parse(result.from) > Date.parse(result.to) ? null : result;
}

export function moderationErrorText(locale: Locale, status: string): string {
  switch (status) {
    case "unauthorized": return words(locale, "登录已过期，请重新登录。", "Your session expired. Please sign in again.");
    case "forbidden": return words(locale, "无权访问审核工作区。", "Access denied for this moderation workspace.");
    case "not-found": return words(locale, "未找到此内容，请刷新队列。", "Content was not found. Refresh the queue.");
    case "rate-limited": return words(locale, "请求过于频繁，请稍后重试。", "Too many requests. Please retry shortly.");
    case "validation-error": return words(locale, "请检查筛选时间、处理原因或禁言到期时间。", "Check the filter dates, decision reason or mute expiry.");
    case "conflict": return words(locale, "其他顾问已处理此内容，请核对最新详情。", "This content was handled by another adviser. Review the latest details.");
    default: return words(locale, "暂时无法载入或更新内容，请重试。", "Unable to load or update content. Please retry.");
  }
}
