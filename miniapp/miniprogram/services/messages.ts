import { request, type RequestOptions } from './http';
import { isCommunityId, isCommunityTimestamp } from '../utils/community-validation';
import type { Result } from '../utils/result';

export type MessageCategory = 'COMMUNITY' | 'SYSTEM' | 'APPLICATION';
export type InboxCategory = 'ALL' | MessageCategory;
export interface InboxMessage {
  readonly id: string; readonly category: MessageCategory; readonly title: string; readonly body: string;
  readonly createdAt: string; readonly readAt: string | null;
  readonly targetType: 'COMMUNITY_POST' | 'NONE'; readonly targetId: string | null;
}
export interface InboxPage {
  readonly items: readonly InboxMessage[]; readonly page: number; readonly pageSize: number;
  readonly totalItems: number; readonly totalPages: number; readonly unreadCount: number;
}
export interface InboxQuery { readonly category: InboxCategory; readonly page: number; readonly size: number }
export interface MessagesService {
  list(query: InboxQuery): Promise<Result<InboxPage>>;
  unreadCount(): Promise<Result<number>>;
  markRead(id: string): Promise<Result<void>>;
}
type MessageRequester = (options: RequestOptions) => Promise<Result<unknown>>;
export function isInboxCategory(value: unknown): value is InboxCategory {
  return value === 'ALL' || value === 'COMMUNITY' || value === 'SYSTEM' || value === 'APPLICATION';
}
export function createMessagesService(send: MessageRequester = request): MessagesService {
  return {
    async list(query) {
      if (!isInboxCategory(query.category) || !integer(query.page) || query.page < 1 || !integer(query.size) || query.size < 1 || query.size > 48) return invalid('INVALID_INBOX_QUERY');
      const result = await send({ method: 'GET', path: `/api/v1/miniapp/me/messages?category=${query.category}&page=${query.page}&size=${query.size}`, authenticated: true });
      if (!result.ok) return result;
      const value = result.value;
      if (!object(value) || !Array.isArray(value.items) || !value.items.every(isMessage)
        || value.items.length > query.size || value.page !== query.page || value.pageSize !== query.size
        || !integer(value.totalItems) || !integer(value.totalPages) || !integer(value.unreadCount)
        || value.totalPages !== Math.ceil(value.totalItems / query.size)
        || value.items.some((item) => query.category !== 'ALL' && item.category !== query.category)) return invalid();
      return { ok: true, value: value as unknown as InboxPage };
    },
    async unreadCount() {
      const result = await send({ method: 'GET', path: '/api/v1/miniapp/me/messages/unread-count', authenticated: true });
      if (!result.ok) return result;
      if (!object(result.value) || !integer(result.value.unreadCount)) return invalid();
      return { ok: true, value: result.value.unreadCount };
    },
    async markRead(id) {
      if (!isCommunityId(id)) return invalid('INVALID_INBOX_ID');
      const result = await send({ method: 'PUT', path: `/api/v1/miniapp/me/messages/${id}/read`, authenticated: true });
      return result.ok ? { ok: true, value: undefined } : result;
    },
  };
}
export const messagesService = createMessagesService();
function isMessage(value: unknown): value is InboxMessage {
  return object(value) && isCommunityId(value.id) && isInboxCategory(value.category) && value.category !== 'ALL'
    && text(value.title) && text(value.body) && isCommunityTimestamp(value.createdAt)
    && (value.readAt === null || isCommunityTimestamp(value.readAt))
    && ((value.targetType === 'NONE' && value.targetId === null)
      || (value.category === 'COMMUNITY' && value.targetType === 'COMMUNITY_POST' && isCommunityId(value.targetId)));
}
function object(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function integer(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0; }
function invalid(code = 'INVALID_INBOX_RESPONSE'): Result<never> { return { ok: false, error: { kind: 'validation', code } }; }
