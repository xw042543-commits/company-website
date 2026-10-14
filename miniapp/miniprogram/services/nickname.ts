import { request, type HttpClient } from './http';
import type { AccountSummary } from './auth';
import type { Result } from '../utils/result';

export function createNicknameService(send: HttpClient['request'] = request) {
  return async (value: string): Promise<Result<AccountSummary>> => {
    const displayName = value.trim();
    const characters = Array.from(displayName);
    const hasControl = characters.some((character) => { const code = character.codePointAt(0)!; return code < 32 || (code >= 127 && code <= 159); });
    if (!displayName || characters.length > 32 || hasControl) {
      return { ok: false, error: { kind: 'validation', code: 'INVALID_NICKNAME' } };
    }
    return send<AccountSummary>({ method: 'PUT', path: '/api/v1/miniapp/account/nickname',
      authenticated: true, data: { displayName }, requestKey: 'account-nickname' });
  };
}

export const updateNickname = createNicknameService();
