import { currentRuntimeConfig, type RuntimeConfig } from '../config/runtime';
import type { AppError, Result } from '../utils/result';
import { isCommunityTimestamp } from '../utils/community-validation';

export interface RequestOptions {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly path: `/api/${string}`;
  readonly data?: unknown;
  readonly idempotencyKey?: string;
  readonly authenticated?: boolean;
  readonly requestKey?: string;
}

export interface TransportSuccess {
  readonly statusCode: number;
  readonly data: unknown;
  readonly header: Record<string, string>;
  readonly cookies: string[];
}

export interface TransportFailure {
  readonly errMsg: string;
}

export interface TransportOptions {
  readonly url: string;
  readonly method: RequestOptions['method'];
  readonly data?: unknown;
  readonly header: Record<string, string>;
  readonly timeout: number;
  readonly success: (response: TransportSuccess) => void;
  readonly fail: (failure: TransportFailure) => void;
}

export interface TransportTask {
  abort(): void;
}

export type HttpTransport = (options: TransportOptions) => TransportTask;

export interface HttpClient {
  request<T>(options: RequestOptions): Promise<Result<T>>;
}

interface ActiveRequest {
  readonly owner: symbol;
  supersede(): void;
}

let accessTokenReader: () => string | null = () => null;
let unauthorizedHandler: (() => Promise<boolean>) | null = null;

export function setAccessTokenReader(reader: () => string | null): void {
  accessTokenReader = reader;
}

export function setUnauthorizedHandler(handler: () => Promise<boolean>): void {
  unauthorizedHandler = handler;
}

export function createHttpClient(
  runtime: RuntimeConfig,
  transport: HttpTransport,
  tokenReader: () => string | null = () => null,
  onUnauthorized: (() => Promise<boolean>) | null = null,
): HttpClient {
  const active = new Map<string, ActiveRequest>();
  return {
    request<T>(options: RequestOptions): Promise<Result<T>> {
      if (!isSafePath(options.path)) {
        return Promise.resolve(failure('validation', 'INVALID_REQUEST_PATH'));
      }
      const owner = Symbol(options.requestKey ?? 'request');
      let settled = false;
      let currentTask: TransportTask | null = null;

      return new Promise<Result<T>>((resolve) => {
        const finish = (result: Result<T>) => {
          if (settled) return;
          settled = true;
          if (options.requestKey && active.get(options.requestKey)?.owner === owner) {
            active.delete(options.requestKey);
          }
          resolve(result);
        };
        const finishUnexpectedFailure = () => finish(failure('unexpected', 'REQUEST_FAILED'));
        const supersede = () => {
          const task = currentTask;
          finish(failure('unexpected', 'REQUEST_SUPERSEDED'));
          try { task?.abort(); } catch { /* Aborting is best effort after settlement. */ }
        };
        if (options.requestKey) {
          active.get(options.requestKey)?.supersede();
          active.set(options.requestKey, { owner, supersede });
        }

        const handleResult = async (result: Result<T>, retried: boolean): Promise<void> => {
          if (settled) return;
          if (!retried && options.authenticated && !result.ok
            && result.error.kind === 'unauthorized' && onUnauthorized) {
            const refreshed = await onUnauthorized();
            if (settled) return;
            if (refreshed) { await attempt(true); return; }
          }
          finish(result);
        };
        const attempt = async (retried: boolean): Promise<void> => {
          if (settled) return;
          const header: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          };
          if (options.authenticated) {
            const token = tokenReader();
            if (!token) {
              if (!retried && onUnauthorized) {
                const refreshed = await onUnauthorized();
                if (settled) return;
                if (refreshed) { await attempt(true); return; }
              }
              finish(failure('unauthorized', 'AUTHENTICATION_REQUIRED'));
              return;
            }
            header.Authorization = `Bearer ${token}`;
          }
          if (options.idempotencyKey) header['Idempotency-Key'] = options.idempotencyKey;
          currentTask = transport({
            url: `${runtime.apiOrigin}${options.path}`,
            method: options.method,
            ...(options.data === undefined ? {} : { data: options.data }),
            header,
            timeout: runtime.requestTimeoutMs,
            success: (response) => {
              void handleResult(mapResponse<T>(response, options.path), retried).catch(finishUnexpectedFailure);
            },
            fail: () => finish(failure('unavailable', 'NETWORK_UNAVAILABLE')),
          });
        };
        void attempt(false).catch(finishUnexpectedFailure);
      });
    },
  };
}

let applicationClient: HttpClient | null = null;

export function request<T>(options: RequestOptions): Promise<Result<T>> {
  applicationClient ??= createHttpClient(
    currentRuntimeConfig(),
    wechatTransport,
    () => accessTokenReader(),
    async () => unauthorizedHandler ? unauthorizedHandler() : false,
  );
  return applicationClient.request<T>(options);
}

const wechatTransport: HttpTransport = (options) => wx.request({
  url: options.url,
  method: options.method,
  ...(options.data === undefined ? {} : {
    data: options.data as string | WechatMiniprogram.IAnyObject | ArrayBuffer,
  }),
  header: options.header,
  timeout: options.timeout,
  success: (response) => options.success({
    statusCode: response.statusCode,
    data: response.data,
    header: normalizeHeaders(response.header),
    cookies: response.cookies ?? [],
  }),
  fail: (failureResult) => options.fail({ errMsg: failureResult.errMsg }),
});

function isSafePath(path: string): boolean {
  return path.startsWith('/api/')
    && !path.includes('..')
    && !path.includes('\\')
    && !path.includes('://');
}

function mapResponse<T>(response: TransportSuccess, path: string): Result<T> {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return { ok: true, value: response.data as T };
  }
  if (path.startsWith('/api/v1/community/')) {
    const error = communityError(response);
    if (error) return error;
  }
  if (response.statusCode === 400) return failure('validation', 'REQUEST_REJECTED');
  if (response.statusCode === 401) return failure('unauthorized', 'AUTHENTICATION_REQUIRED');
  if (response.statusCode === 403) return failure('forbidden', 'ACCESS_DENIED');
  if (response.statusCode === 429) return failure('rate-limited', 'RATE_LIMITED');
  if (response.statusCode >= 500) return failure('unavailable', 'SERVICE_UNAVAILABLE');
  return failure('unexpected', 'UNEXPECTED_RESPONSE');
}

// Only stable public codes are propagated. Never expose server messages, trace IDs or field errors.
function communityError(response: TransportSuccess): Result<never> | null {
  const codes: Readonly<Record<number, readonly string[]>> = {
    400: ['INVALID_COMMUNITY_CURSOR', 'INVALID_COMMUNITY_SORT', 'INVALID_COMMUNITY_PAGE_SIZE', 'INVALID_COMMUNITY_BODY', 'INVALID_COMMUNITY_ID', 'INVALID_COMMUNITY_PARENT', 'INVALID_COMMUNITY_REPORT', 'INVALID_IDEMPOTENCY_KEY', 'COMMUNITY_CONTENT_REJECTED'],
    403: ['COMMUNITY_USER_RESTRICTED', 'COMMUNITY_NOT_OWNER'],
    404: ['COMMUNITY_POST_NOT_FOUND', 'COMMUNITY_POST_HIDDEN', 'COMMUNITY_POST_DELETED', 'COMMUNITY_COMMENT_NOT_FOUND'],
    409: ['COMMUNITY_HOT_SNAPSHOT_EXPIRED', 'COMMUNITY_TARGET_UNAVAILABLE', 'IDEMPOTENCY_CONFLICT'],
    429: ['COMMUNITY_RATE_LIMITED'],
    503: ['COMMUNITY_DISABLED', 'COMMUNITY_WRITE_UNAVAILABLE', 'COMMUNITY_HOT_SNAPSHOT_UNAVAILABLE', 'COMMUNITY_HOT_SNAPSHOT_TOO_LARGE'],
  };
  const data = response.data;
  if (!data || typeof data !== 'object' || !('code' in data) || typeof data.code !== 'string'
    || !codes[response.statusCode]?.includes(data.code)) return null;
  const kind: AppError['kind'] = response.statusCode === 400 ? 'validation' : response.statusCode === 403 ? 'forbidden'
    : response.statusCode === 429 ? 'rate-limited' : response.statusCode === 503 ? 'unavailable' : 'unexpected';
  if (response.statusCode === 403 && data.code === 'COMMUNITY_USER_RESTRICTED' && 'details' in data) {
    const details = data.details;
    if (details !== null && typeof details === 'object' && !Array.isArray(details)
      && Object.keys(details).length === 2 && Object.hasOwn(details, 'restrictionKind') && Object.hasOwn(details, 'endsAt')
      && 'restrictionKind' in details && 'endsAt' in details
      && (details.restrictionKind === 'MUTE' || details.restrictionKind === 'BAN')
      && (details.endsAt === null || (details.restrictionKind === 'MUTE' && isCommunityTimestamp(details.endsAt)))) {
      return { ok: false, error: { kind: 'forbidden', code: 'COMMUNITY_USER_RESTRICTED',
        details: { restrictionKind: details.restrictionKind, endsAt: details.endsAt } } };
    }
  }
  return failure(kind, data.code);
}

function failure(kind: AppError['kind'], code: string): Result<never> {
  return { ok: false, error: { kind, code } };
}

function normalizeHeaders(headers: WechatMiniprogram.IAnyObject): Record<string, string> {
  return Object.fromEntries(Object.entries(headers).map(([name, value]) => [name, String(value)]));
}
