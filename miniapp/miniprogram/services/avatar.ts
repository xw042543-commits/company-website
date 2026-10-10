import { request } from './http';
import type { AccountSummary } from './auth';
import type { Result } from '../utils/result';

const MAX_AVATAR_BYTES = 1024 * 1024;

export async function updateAvatar(filePath: string): Promise<Result<AccountSummary>> {
  try {
    const size = await fileSize(filePath);
    if (size <= 0 || size > MAX_AVATAR_BYTES) return failure('AVATAR_TOO_LARGE');
    const contentBase64 = await readBase64(filePath);
    return request<AccountSummary>({
      method: 'PUT', path: '/api/v1/miniapp/account/avatar', data: { contentBase64 },
      authenticated: true, requestKey: 'account-avatar',
    });
  } catch {
    return failure('AVATAR_READ_FAILED');
  }
}

export function removeAvatar(): Promise<Result<AccountSummary>> {
  return request<AccountSummary>({
    method: 'DELETE', path: '/api/v1/miniapp/account/avatar',
    authenticated: true, requestKey: 'account-avatar',
  });
}

function fileSize(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => wx.getFileSystemManager().stat({
    path: filePath,
    success: ({ stats }) => Array.isArray(stats) ? reject(new Error('invalid avatar')) : resolve(stats.size),
    fail: reject,
  }));
}

function readBase64(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => wx.getFileSystemManager().readFile({
    filePath, encoding: 'base64',
    success: ({ data }) => typeof data === 'string' ? resolve(data) : reject(new Error('invalid avatar')),
    fail: reject,
  }));
}

function failure(code: string): Result<never> {
  return { ok: false, error: { kind: 'validation', code } };
}
