import type { AppError, CommunityRestrictionDetails } from './result';
import type { Result } from './result';
import type { CommunityContentStatus } from '../services/community';

export interface Identified { readonly id: string }
export interface FeedPageInput<T extends Identified> {
  readonly activeRequest: number;
  readonly resultRequest: number;
  readonly current: readonly T[];
  readonly incoming: readonly T[];
  readonly reset: boolean;
  readonly loadingMore?: boolean;
}

export interface SubmissionState {
  readonly body: string; // Exact request fingerprint, not necessarily visible body text.
  readonly key: string | null;
  readonly completed: boolean;
}

export type SubmissionFinish = 'completed' | 'uncertain' | 'authentication';

const STATUS_COPY: Readonly<Record<CommunityContentStatus, string>> = {
  PUBLISHED: '已发布',
  PENDING_REVIEW: '审核中',
  HIDDEN: '内容暂不可公开展示',
  DELETED: '已删除',
  REJECTED: '内容未通过审核',
};

export function applyFeedPage<T extends Identified>(input: FeedPageInput<T>): { applied: boolean; items: readonly T[] } {
  if (input.activeRequest !== input.resultRequest || input.loadingMore) {
    return { applied: false, items: input.current };
  }
  if (input.reset) return { applied: true, items: input.incoming };
  const items = new Map(input.current.map((item) => [item.id, item]));
  input.incoming.forEach((item) => items.set(item.id, item));
  return { applied: true, items: [...items.values()] };
}

export function shouldRestartHotFeed(sort: 'latest' | 'hot', cursor: string | null, error: AppError): boolean {
  return sort === 'hot' && cursor !== null && error.code === 'COMMUNITY_HOT_SNAPSHOT_EXPIRED';
}

export function codePointLength(value: string): number { return [...value].length; }

export function canUseCommunityWrite(status: 'unknown' | 'anonymous' | 'authenticated'): boolean {
  return status === 'authenticated';
}

export function canDeleteOwnedContent(id: string, ownedIds: ReadonlySet<string>): boolean {
  return ownedIds.has(id);
}

export function mergeCommunityItems<T extends Identified>(current: readonly T[], incoming: readonly T[]): readonly T[] {
  const items = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => items.set(item.id, item));
  return [...items.values()];
}

export function unwrapCommunityRoute(result: Result<string>): string | null {
  return result.ok ? result.value : null;
}

export function createSubmissionState(body = ''): SubmissionState {
  return { body, key: null, completed: false };
}

export function prepareSubmission(state: SubmissionState, createKey: () => string): SubmissionState {
  return state.key ? state : { ...state, key: createKey(), completed: false };
}

export function finishSubmission(state: SubmissionState, result: SubmissionFinish): SubmissionState {
  return { ...state, completed: result === 'completed' };
}

export function editSubmission(state: SubmissionState, body: string): SubmissionState {
  if (body === state.body) return state;
  return { body, key: null, completed: false };
}

export function statusCopy(status: string): string {
  return STATUS_COPY[status as CommunityContentStatus] ?? '状态暂不可用';
}

export function restrictionCopy(details: CommunityRestrictionDetails | null): string {
  if (!details) return '暂时无法完成此操作，请稍后重试。';
  if (details.restrictionKind === 'BAN') return '你的账号已被永久限制参与U圈互动。';
  if (details.endsAt === null) return '你的账号暂时无法参与U圈互动。';
  return `你暂时无法参与U圈互动，限制至${formatCommunityTime(details.endsAt)}。`;
}

export function errorCopy(error: AppError): string {
  if (error.code === 'COMMUNITY_USER_RESTRICTED') {
    return restrictionCopy('details' in error ? error.details : null);
  }
  if (error.kind === 'unauthorized') return '请先登录后再继续。';
  if (error.kind === 'rate-limited') return '操作有些频繁，请稍后再试。';
  if (error.kind === 'unavailable') return '网络或服务暂时不可用，请稍后重试。';
  if (error.code === 'COMMUNITY_CONTENT_REJECTED') return '内容未通过安全检查，请修改后重试。';
  if (error.code === 'COMMUNITY_NOT_OWNER') return '只能管理自己发布的内容。';
  return '暂时无法完成此操作，请稍后重试。';
}

export function formatCommunityTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知时间';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
