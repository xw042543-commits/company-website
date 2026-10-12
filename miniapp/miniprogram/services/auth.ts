import { request } from './http';
import type { Result } from '../utils/result';

export interface AccountSummary {
  readonly id: number;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly bindingStatus: 'LINKED' | 'UNLINKED';
}

export interface SessionPayload {
  readonly accessToken: string;
  readonly accessExpiresAt: string;
  readonly refreshToken: string;
  readonly refreshExpiresAt: string;
  readonly account: AccountSummary;
}

export interface AuthGateway {
  login(): Promise<Result<SessionPayload>>;
  refresh(refreshToken: string): Promise<Result<SessionPayload>>;
  logout(refreshToken: string): Promise<void>;
}

export function createAuthGateway(
  loginCode: () => Promise<string> = wechatLoginCode,
): AuthGateway {
  return {
    async login() {
      let code: string;
      try {
        code = await loginCode();
      } catch {
        return authFailure('WECHAT_LOGIN_UNAVAILABLE');
      }
      const result = await request<unknown>({
        method: 'POST',
        path: '/api/v1/miniapp/auth/login',
        data: { code },
      });
      return validateSession(result);
    },
    async refresh(refreshToken) {
      const result = await request<unknown>({
        method: 'POST',
        path: '/api/v1/miniapp/auth/refresh',
        data: { refreshToken },
      });
      return validateSession(result);
    },
    async logout(refreshToken) {
      await request<void>({
        method: 'POST',
        path: '/api/v1/miniapp/auth/logout',
        data: { refreshToken },
        authenticated: true,
      });
    },
  };
}

function wechatLoginCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (result) => result.code ? resolve(result.code) : reject(new Error('missing code')),
      fail: reject,
    });
  });
}

function validateSession(result: Result<unknown>): Result<SessionPayload> {
  if (!result.ok) return result;
  const value = result.value;
  if (!isObject(value) || !text(value.accessToken) || !text(value.accessExpiresAt)
    || !text(value.refreshToken) || !text(value.refreshExpiresAt) || !isAccount(value.account)) {
    return authFailure('INVALID_SESSION_RESPONSE');
  }
  return { ok: true, value: value as unknown as SessionPayload };
}

function isAccount(value: unknown): value is AccountSummary {
  return isObject(value) && typeof value.id === 'number' && text(value.displayName)
    && (value.avatarUrl === null || typeof value.avatarUrl === 'string')
    && (value.bindingStatus === 'LINKED' || value.bindingStatus === 'UNLINKED');
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function authFailure(code: string): Result<never> {
  return { ok: false, error: { kind: 'unauthorized', code } };
}
