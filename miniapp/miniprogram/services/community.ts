import { request, type RequestOptions } from './http';
import { sessionStore } from '../stores/session';
import type { Result } from '../utils/result';
import { isCommunityId, isCommunityTimestamp as timestamp } from '../utils/community-validation';
export { isCommunityId } from '../utils/community-validation';

export type CommunityContentStatus = 'PUBLISHED' | 'PENDING_REVIEW' | 'HIDDEN' | 'DELETED' | 'REJECTED';
export type CommunityTargetType = 'POST' | 'COMMENT';
export type CommunityReportReason = 'SPAM' | 'HARASSMENT' | 'SCAM' | 'INAPPROPRIATE_CONTENT' | 'OTHER';
export interface CursorPage<T> { readonly items: readonly T[]; readonly nextCursor: string | null }
interface Author { readonly authorName: string; readonly authorAvatarUrl: string | null }
export interface CommunityPostSummary extends Author {
  readonly id: string; readonly bodyPreview: string; readonly commentCount: number; readonly likeCount: number;
  readonly publishedAt: string; readonly likedByMe: boolean;
}
export interface CommunityPostDetail extends Author {
  readonly id: string; readonly body: string; readonly commentCount: number; readonly likeCount: number;
  readonly publishedAt: string; readonly likedByMe: boolean; readonly ownedByMe: boolean;
}
export interface CommunityComment extends Author {
  readonly id: string; readonly body: string; readonly createdAt: string; readonly likeCount: number;
  readonly likedByMe: boolean; readonly ownedByMe: boolean; readonly replies: readonly CommunityComment[]; readonly repliesNextCursor: string | null;
}
export interface CommunityCreationResponse {
  readonly id: string; readonly postId: string | null; readonly parentCommentId: string | null; readonly body: string;
  readonly status: CommunityContentStatus; readonly createdAt: string; readonly publishedAt: string | null;
}
export interface CommunityReportResponse {
  readonly id: string; readonly targetType: CommunityTargetType; readonly targetId: string;
  readonly status: 'OPEN' | 'RESOLVED_ACTIONED' | 'RESOLVED_REJECTED'; readonly createdAt: string;
}
export interface CommunityMyPost {
  readonly id: string; readonly body: string; readonly status: CommunityContentStatus; readonly statusMessage: string;
  readonly createdAt: string; readonly publishedAt: string | null; readonly commentCount: number; readonly likeCount: number;
}
export interface CommunityMyComment {
  readonly id: string; readonly postId: string; readonly parentCommentId: string | null; readonly body: string;
  readonly status: CommunityContentStatus; readonly statusMessage: string; readonly createdAt: string; readonly likeCount: number;
}
export interface PageInput { readonly cursor?: string | null; readonly size?: number; readonly requestScope: string }
export interface FeedInput extends PageInput { readonly sort: 'latest' | 'hot' }
export interface CommentPageInput extends PageInput { readonly postId: string }
export interface ReplyPageInput extends CommentPageInput { readonly parentCommentId: string }
export interface PostSubmission { readonly body: string; readonly idempotencyKey: string }
export interface CommentSubmission extends PostSubmission { readonly postId: string; readonly parentCommentId?: string | null }
export interface ReactionInput { readonly targetType: CommunityTargetType; readonly targetId: string; readonly liked: boolean }
export interface ReportSubmission {
  readonly targetType: CommunityTargetType; readonly targetId: string; readonly reasonCode: CommunityReportReason;
  readonly note?: string; readonly idempotencyKey: string;
}
type RecordValue = Record<string, unknown>;
type Validator = (value: unknown) => boolean;
const STATUSES: readonly unknown[] = ['PUBLISHED', 'PENDING_REVIEW', 'HIDDEN', 'DELETED', 'REJECTED'];
const STATUS_MESSAGES: Readonly<Record<CommunityContentStatus, string>> = {
  PUBLISHED: '已发布', PENDING_REVIEW: '审核中', HIDDEN: '内容暂不可公开展示',
  DELETED: '已删除', REJECTED: '内容未通过审核',
};
const REASONS: readonly unknown[] = ['SPAM', 'HARASSMENT', 'SCAM', 'INAPPROPRIATE_CONTENT', 'OTHER'];

function exact(value: unknown, keys: readonly string[]): value is RecordValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
function text(value: unknown, max: number, min = 1): value is string {
  if (typeof value !== 'string' || value.includes('\0')) return false;
  const points = [...value];
  return points.length >= min && points.length <= max
    && points.every((point) => !/^[\uD800-\uDFFF]$/.test(point));
}
function count(value: unknown): boolean { return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2147483647; }
function opaqueCursor(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/.test(value)) return false;
  const payload = value.split('.')[0] ?? '';
  const remainder = payload.length % 4;
  // Unpadded Base64URL leaves four unused low bits for 2 chars, two for 3 chars.
  // Checking those bits keeps the cursor opaque and requires no browser/Node codecs.
  return remainder === 0 || (remainder === 2 && /[AQgw]$/.test(payload))
    || (remainder === 3 && /[AEIMQUYcgkosw048]$/.test(payload));
}
function nullableCursor(value: unknown): boolean { return value === null || opaqueCursor(value); }
function avatar(value: unknown): boolean {
  // Null uses the existing brand fallback; no local URL/asset contract exists for saved avatars.
  if (value === null) return true;
  if (typeof value !== 'string' || value.length > 2048 || /[\s\\<>"']/.test(value)
    || [...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
    || /%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return false;
  const parts = /^https:\/\/([^/?#]+)(?:[/?#][^\s]*)?$/.exec(value);
  if (!parts) return false;
  const authority = parts[1] ?? '';
  const host = /^([a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::([0-9]{1,5}))?$/i.exec(authority);
  if (!host || !host[1]?.split('.').every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) return false;
  return host[2] === undefined || (Number(host[2]) >= 1 && Number(host[2]) <= 65535);
}
function author(v: RecordValue): boolean { return text(v.authorName, 100) && avatar(v.authorAvatarUrl); }
function post(v: unknown, full: boolean): boolean {
  const body = full ? 'body' : 'bodyPreview';
  const keys = ['id', 'authorName', 'authorAvatarUrl', body, 'commentCount', 'likeCount', 'publishedAt', 'likedByMe'];
  if (full) keys.push('ownedByMe');
  return exact(v, keys)
    && isCommunityId(v.id) && author(v) && text(v[body], full ? 2000 : 200) && count(v.commentCount)
    && count(v.likeCount) && timestamp(v.publishedAt) && typeof v.likedByMe === 'boolean'
    && (!full || typeof v.ownedByMe === 'boolean');
}
function comment(v: unknown, root: boolean): boolean {
  return exact(v, ['id', 'authorName', 'authorAvatarUrl', 'body', 'createdAt', 'likeCount', 'likedByMe', 'ownedByMe', 'replies', 'repliesNextCursor'])
    && isCommunityId(v.id) && author(v) && text(v.body, 1000) && timestamp(v.createdAt) && count(v.likeCount)
    && typeof v.likedByMe === 'boolean' && typeof v.ownedByMe === 'boolean' && Array.isArray(v.replies) && v.replies.length <= (root ? 3 : 0)
    && v.replies.every((reply) => comment(reply, false)) && nullableCursor(v.repliesNextCursor)
    && (root ? v.repliesNextCursor === null || v.replies.length === 3 : v.repliesNextCursor === null);
}
function creation(v: unknown): boolean {
  if (!exact(v, ['id', 'postId', 'parentCommentId', 'body', 'status', 'createdAt', 'publishedAt'])) return false;
  const isPost = v.postId === null;
  return isCommunityId(v.id) && (isPost || isCommunityId(v.postId)) && (v.parentCommentId === null || (!isPost && isCommunityId(v.parentCommentId)))
    && text(v.body, isPost ? 2000 : 1000) && (v.status === 'PUBLISHED' || v.status === 'PENDING_REVIEW') && timestamp(v.createdAt)
    && (isPost && v.status === 'PUBLISHED' ? timestamp(v.publishedAt) : v.publishedAt === null);
}
function report(v: unknown): boolean {
  return exact(v, ['id', 'targetType', 'targetId', 'status', 'createdAt']) && isCommunityId(v.id) && isCommunityId(v.targetId)
    && targetType(v.targetType) && ['OPEN', 'RESOLVED_ACTIONED', 'RESOLVED_REJECTED'].includes(v.status as string) && timestamp(v.createdAt);
}
function personal(v: unknown, isPost: boolean): boolean {
  return exact(v, isPost ? ['id', 'body', 'status', 'statusMessage', 'createdAt', 'publishedAt', 'commentCount', 'likeCount']
    : ['id', 'postId', 'parentCommentId', 'body', 'status', 'statusMessage', 'createdAt', 'likeCount'])
    && isCommunityId(v.id) && text(v.body, isPost ? 2000 : 1000) && STATUSES.includes(v.status)
    && v.statusMessage === STATUS_MESSAGES[v.status as CommunityContentStatus]
    && timestamp(v.createdAt) && count(v.likeCount) && (isPost ? count(v.commentCount) && (v.publishedAt === null || timestamp(v.publishedAt))
      : isCommunityId(v.postId) && (v.parentCommentId === null || isCommunityId(v.parentCommentId)));
}
function parsed<T>(value: unknown, validate: Validator): Result<T> {
  return validate(value) ? { ok: true, value: value as T } : invalidResponse();
}
function page<T>(value: unknown, validate: Validator, max = 50): Result<CursorPage<T>> {
  return parsed(value, (v) => exact(v, ['items', 'nextCursor']) && Array.isArray(v.items) && v.items.length <= max
    && v.items.every(validate) && nullableCursor(v.nextCursor));
}
function invalidResponse(): Result<never> { return { ok: false, error: { kind: 'unexpected', code: 'INVALID_COMMUNITY_RESPONSE' } }; }
function invalidInput(): Result<never> { return { ok: false, error: { kind: 'validation', code: 'INVALID_COMMUNITY_INPUT' } }; }
export const parsePostPage = (v: unknown, max = 50) => page<CommunityPostSummary>(v, (p) => post(p, false), max);
export const parsePostDetail = (v: unknown) => parsed<CommunityPostDetail>(v, (p) => post(p, true));
export const parseCommentPage = (v: unknown, max = 50) => page<CommunityComment>(v, (c) => comment(c, true), max);
export const parseReplyPage = (v: unknown, max = 50) => page<CommunityComment>(v, (c) => comment(c, false), max);
export const parseCreationResponse = (v: unknown) => parsed<CommunityCreationResponse>(v, creation);
export const parseReportResponse = (v: unknown) => parsed<CommunityReportResponse>(v, report);
export const parseMyPostPage = (v: unknown, max = 50) => page<CommunityMyPost>(v, (p) => personal(p, true), max);
export const parseMyCommentPage = (v: unknown, max = 50) => page<CommunityMyComment>(v, (c) => personal(c, false), max);

function targetType(value: unknown): value is CommunityTargetType { return value === 'POST' || value === 'COMMENT'; }
function submissionKey(value: unknown): value is string { return typeof value === 'string' && /^[A-Za-z0-9._:-]{1,64}$/.test(value); }
function query(input: PageInput): string | null {
  const size = input.size ?? 20;
  if (!Number.isInteger(size) || size < 1 || size > 50 || (input.cursor !== undefined && input.cursor !== null && !opaqueCursor(input.cursor))) return null;
  return `size=${encodeURIComponent(String(size))}${input.cursor == null ? '' : `&cursor=${encodeURIComponent(input.cursor)}`}`;
}
function requestScope(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
}

/** Call once when starting a new submission; retain this UUID through every retry. Not an authentication credential. */
export function createSubmissionKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === 'x' ? random : (random & 3) | 8).toString(16);
  });
}

/** Creates a non-secret, process-local coordinate used only to isolate one Page instance's cancellable reads. */
export function createCommunityRequestScope(): string { return createSubmissionKey(); }

export function createCommunityService(
  send: (options: RequestOptions) => Promise<Result<unknown>> = request,
  signedIn: () => boolean = () => sessionStore.getSnapshot().status === 'authenticated',
) {
  async function call<T>(options: RequestOptions, parse: (v: unknown) => Result<T>): Promise<Result<T>> {
    const result = await send(options);
    return result.ok ? parse(result.value) : result;
  }
  const publicRead = <T>(path: RequestOptions['path'], requestKey: string, parse: (v: unknown) => Result<T>) =>
    call({ method: 'GET', path, requestKey, authenticated: signedIn() }, parse);
  const voidResponse = (v: unknown): Result<void> => v === undefined || v === null || v === '' ? { ok: true, value: undefined } : invalidResponse();
  return {
    async listPosts(input: FeedInput): Promise<Result<CursorPage<CommunityPostSummary>>> {
      const q = query(input);
      if (q === null || !requestScope(input.requestScope) || (input.sort !== 'latest' && input.sort !== 'hot')) return invalidInput();
      return publicRead(`/api/v1/community/posts?sort=${encodeURIComponent(input.sort)}&${q}`, `community-feed:${input.requestScope}:${input.sort}`, (v) => parsePostPage(v, input.size ?? 20));
    },
    async loadPost(id: string, scope: string): Promise<Result<CommunityPostDetail>> {
      if (!isCommunityId(id) || !requestScope(scope)) return invalidInput();
      return publicRead(`/api/v1/community/posts/${encodeURIComponent(id)}`, `community-detail:${scope}:${id}`, (v) => {
        const parsed = parsePostDetail(v);
        return parsed.ok && parsed.value.id !== id ? invalidResponse() : parsed;
      });
    },
    async listComments(input: CommentPageInput): Promise<Result<CursorPage<CommunityComment>>> {
      const q = query(input);
      if (q === null || !requestScope(input.requestScope) || !isCommunityId(input.postId)) return invalidInput();
      return publicRead(`/api/v1/community/posts/${encodeURIComponent(input.postId)}/comments?${q}`, `community-comments:${input.requestScope}:${input.postId}`, (v) => parseCommentPage(v, input.size ?? 20));
    },
    async listReplies(input: ReplyPageInput): Promise<Result<CursorPage<CommunityComment>>> {
      const q = query(input);
      if (q === null || !requestScope(input.requestScope) || !isCommunityId(input.postId) || !isCommunityId(input.parentCommentId)) return invalidInput();
      return publicRead(`/api/v1/community/posts/${encodeURIComponent(input.postId)}/comments/${encodeURIComponent(input.parentCommentId)}/replies?${q}`, `community-replies:${input.requestScope}:${input.postId}:${input.parentCommentId}`, (v) => parseReplyPage(v, input.size ?? 20));
    },
    async listMyPosts(input: PageInput): Promise<Result<CursorPage<CommunityMyPost>>> {
      const q = query(input); if (q === null || !requestScope(input.requestScope)) return invalidInput();
      return call({ method: 'GET', path: `/api/v1/community/me/posts?${q}`, authenticated: true, requestKey: `community-me-posts:${input.requestScope}` }, (v) => parseMyPostPage(v, input.size ?? 20));
    },
    async listMyComments(input: PageInput): Promise<Result<CursorPage<CommunityMyComment>>> {
      const q = query(input); if (q === null || !requestScope(input.requestScope)) return invalidInput();
      return call({ method: 'GET', path: `/api/v1/community/me/comments?${q}`, authenticated: true, requestKey: `community-me-comments:${input.requestScope}` }, (v) => parseMyCommentPage(v, input.size ?? 20));
    },
    async createPost(input: PostSubmission): Promise<Result<CommunityCreationResponse>> {
      if (!submissionKey(input.idempotencyKey) || !text(input.body, 2000) || !input.body.trim()) return invalidInput();
      return call({ method: 'POST', path: '/api/v1/community/posts', data: { body: input.body }, authenticated: true, idempotencyKey: input.idempotencyKey }, (v) => {
        const parsed = parseCreationResponse(v);
        return parsed.ok && parsed.value.postId !== null ? invalidResponse() : parsed;
      });
    },
    async createComment(input: CommentSubmission): Promise<Result<CommunityCreationResponse>> {
      if (!submissionKey(input.idempotencyKey) || !isCommunityId(input.postId) || !text(input.body, 1000) || !input.body.trim()
        || (input.parentCommentId != null && !isCommunityId(input.parentCommentId))) return invalidInput();
      return call({ method: 'POST', path: `/api/v1/community/posts/${encodeURIComponent(input.postId)}/comments`, data: { body: input.body, parentCommentId: input.parentCommentId ?? null }, authenticated: true, idempotencyKey: input.idempotencyKey }, (v) => {
        const parsed = parseCreationResponse(v);
        return parsed.ok && (parsed.value.postId !== input.postId || parsed.value.parentCommentId !== (input.parentCommentId ?? null)) ? invalidResponse() : parsed;
      });
    },
    async deletePost(id: string): Promise<Result<void>> {
      if (!isCommunityId(id)) return invalidInput();
      return call({ method: 'DELETE', path: `/api/v1/community/posts/${encodeURIComponent(id)}`, authenticated: true }, voidResponse);
    },
    async deleteComment(id: string): Promise<Result<void>> {
      if (!isCommunityId(id)) return invalidInput();
      return call({ method: 'DELETE', path: `/api/v1/community/comments/${encodeURIComponent(id)}`, authenticated: true }, voidResponse);
    },
    async setReaction(input: ReactionInput): Promise<Result<void>> {
      if (!targetType(input.targetType) || !isCommunityId(input.targetId) || typeof input.liked !== 'boolean') return invalidInput();
      return call({ method: input.liked ? 'PUT' : 'DELETE', path: `/api/v1/community/${input.targetType === 'POST' ? 'posts' : 'comments'}/${encodeURIComponent(input.targetId)}/like`, authenticated: true }, voidResponse);
    },
    async reportTarget(input: ReportSubmission): Promise<Result<CommunityReportResponse>> {
      if (!submissionKey(input.idempotencyKey) || !targetType(input.targetType) || !isCommunityId(input.targetId)
        || !REASONS.includes(input.reasonCode) || (input.note !== undefined && !text(input.note, 500, 0))) return invalidInput();
      return call({ method: 'POST', path: '/api/v1/community/reports', authenticated: true, idempotencyKey: input.idempotencyKey,
        data: { targetType: input.targetType, targetId: input.targetId, reasonCode: input.reasonCode, ...(input.note === undefined ? {} : { note: input.note }) } }, (v) => {
        const parsed = parseReportResponse(v);
        return parsed.ok && (parsed.value.targetId !== input.targetId || parsed.value.targetType !== input.targetType) ? invalidResponse() : parsed;
      });
    },
  };
}
const community = createCommunityService();
export const listCommunityPosts = community.listPosts;
export const loadCommunityPost = community.loadPost;
export const listCommunityComments = community.listComments;
export const listCommunityReplies = community.listReplies;
export const listMyCommunityPosts = community.listMyPosts;
export const listMyCommunityComments = community.listMyComments;
export const createCommunityPost = community.createPost;
export const createCommunityComment = community.createComment;
export const deleteCommunityPost = community.deletePost;
export const deleteCommunityComment = community.deleteComment;
export const setCommunityReaction = community.setReaction;
export const reportCommunityTarget = community.reportTarget;
