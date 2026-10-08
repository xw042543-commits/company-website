import { createAuthGateway, type AccountSummary, type AuthGateway, type SessionPayload } from '../services/auth';
import type { Result } from '../utils/result';

export const REFRESH_TOKEN_STORAGE_KEY = 'udajo.miniapp.refresh-token.v1';

export interface SessionSnapshot {
  readonly status: 'unknown' | 'anonymous' | 'authenticated';
  readonly account: AccountSummary | null;
}

export interface SessionStorage {
  get(key: string): string | null;
  set(key: string, value: string): unknown;
  remove(key: string): unknown;
}

export interface SessionStore {
  getSnapshot(): SessionSnapshot;
  getAccessToken(): string | null;
  subscribe(listener: (snapshot: SessionSnapshot) => void): () => void;
  restore(): Promise<Result<AccountSummary>>;
  login(): Promise<Result<AccountSummary>>;
  refresh(): Promise<Result<AccountSummary>>;
  ensureAuthenticated(): Promise<Result<AccountSummary>>;
  logout(): Promise<void>;
}

export function createSessionStore(auth: AuthGateway, storage: SessionStorage): SessionStore {
  let snapshot: SessionSnapshot = { status: 'unknown', account: null };
  let accessToken: string | null = null;
  let refreshInFlight: Promise<Result<AccountSummary>> | null = null;
  const listeners = new Set<(value: SessionSnapshot) => void>();

  const publish = (next: SessionSnapshot): void => {
    snapshot = next;
    listeners.forEach((listener) => listener(snapshot));
  };
  const clear = (): void => {
    accessToken = null;
    safeRemove(storage);
    publish({ status: 'anonymous', account: null });
  };
  const accept = (session: SessionPayload): Result<AccountSummary> => {
    accessToken = session.accessToken;
    storage.set(REFRESH_TOKEN_STORAGE_KEY, session.refreshToken);
    publish({ status: 'authenticated', account: session.account });
    return { ok: true, value: session.account };
  };
  const refresh = (): Promise<Result<AccountSummary>> => {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
      const token = safeGet(storage);
      if (!token) {
        clear();
        return failure('AUTHENTICATION_REQUIRED');
      }
      const result = await auth.refresh(token);
      if (!result.ok) {
        clear();
        return result;
      }
      return accept(result.value);
    })().finally(() => { refreshInFlight = null; });
    return refreshInFlight;
  };

  return {
    getSnapshot: () => snapshot,
    getAccessToken: () => accessToken,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async restore() {
      if (!safeGet(storage)) {
        clear();
        return failure('AUTHENTICATION_REQUIRED');
      }
      return refresh();
    },
    async login() {
      const result = await auth.login();
      if (!result.ok) {
        clear();
        return result;
      }
      return accept(result.value);
    },
    refresh,
    async ensureAuthenticated() {
      if (snapshot.status === 'authenticated' && snapshot.account) {
        return { ok: true, value: snapshot.account };
      }
      return safeGet(storage) ? refresh() : this.login();
    },
    async logout() {
      const token = safeGet(storage);
      try {
        if (token) await auth.logout(token);
      } catch {
        // Local credentials must still be removed when the network is unavailable.
      } finally {
        clear();
      }
    },
  };
}

const wechatStorage: SessionStorage = {
  get(key) {
    const value = wx.getStorageSync<string>(key);
    return typeof value === 'string' && value ? value : null;
  },
  set: (key, value) => wx.setStorageSync(key, value),
  remove: (key) => wx.removeStorageSync(key),
};

export const sessionStore = createSessionStore(createAuthGateway(), wechatStorage);

function safeGet(storage: SessionStorage): string | null {
  try { return storage.get(REFRESH_TOKEN_STORAGE_KEY); } catch { return null; }
}

function safeRemove(storage: SessionStorage): void {
  try { storage.remove(REFRESH_TOKEN_STORAGE_KEY); } catch { /* already cleared in memory */ }
}

function failure(code: string): Result<never> {
  return { ok: false, error: { kind: 'unauthorized', code } };
}
