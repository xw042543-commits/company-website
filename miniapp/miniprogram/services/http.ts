import { currentRuntimeConfig, type RuntimeConfig } from '../config/runtime';
import type { AppError, Result } from '../utils/result';

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
        const supersede = () => {
          const task = currentTask;
          finish(failure('unexpected', 'REQUEST_SUPERSEDED'));
          task?.abort();
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
            success: (response) => { void handleResult(mapResponse<T>(response), retried); },
            fail: () => finish(failure('unavailable', 'NETWORK_UNAVAILABLE')),
          });
        };
        void attempt(false);
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

function mapResponse<T>(response: TransportSuccess): Result<T> {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return { ok: true, value: response.data as T };
  }
  if (response.statusCode === 400) return failure('validation', 'REQUEST_REJECTED');
  if (response.statusCode === 401) return failure('unauthorized', 'AUTHENTICATION_REQUIRED');
  if (response.statusCode === 403) return failure('forbidden', 'ACCESS_DENIED');
  if (response.statusCode === 429) return failure('rate-limited', 'RATE_LIMITED');
  if (response.statusCode >= 500) return failure('unavailable', 'SERVICE_UNAVAILABLE');
  return failure('unexpected', 'UNEXPECTED_RESPONSE');
}

function failure(kind: AppError['kind'], code: string): Result<never> {
  return { ok: false, error: { kind, code } };
}

function normalizeHeaders(headers: WechatMiniprogram.IAnyObject): Record<string, string> {
  return Object.fromEntries(Object.entries(headers).map(([name, value]) => [name, String(value)]));
}
