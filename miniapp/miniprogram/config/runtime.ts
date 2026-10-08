export type RuntimeEnvironment = 'local' | 'preview' | 'production';

export interface RuntimeConfig {
  readonly apiOrigin: string;
  readonly requestTimeoutMs: 8000;
  readonly environment: RuntimeEnvironment;
}

const PRODUCTION_ORIGIN = 'https://yangdoujiao.com';
const LOCAL_ORIGIN = 'http://127.0.0.1:8080';

export function resolveRuntimeConfig(
  environment: RuntimeEnvironment,
  originOverride?: string,
): RuntimeConfig {
  const apiOrigin = originOverride ?? (environment === 'local' ? LOCAL_ORIGIN : PRODUCTION_ORIGIN);
  const parsed = parseOrigin(apiOrigin);

  if (environment !== 'local' && (parsed.protocol !== 'https:' || parsed.origin !== PRODUCTION_ORIGIN)) {
    throw new Error('Unsafe API origin');
  }
  if (environment === 'local' && !isAllowedLocalOrigin(parsed)) {
    throw new Error('Unsafe API origin');
  }

  return {
    apiOrigin: parsed.origin,
    requestTimeoutMs: 8000,
    environment,
  };
}

export function currentRuntimeConfig(): RuntimeConfig {
  const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
  if (envVersion === 'release') return resolveRuntimeConfig('production');
  if (envVersion === 'trial') return resolveRuntimeConfig('preview');
  return resolveRuntimeConfig('local', PRODUCTION_ORIGIN);
}

function parseOrigin(raw: string): URL {
  try {
    const parsed = new URL(raw);
    if (parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
      throw new Error('Unsafe API origin');
    }
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message === 'Unsafe API origin') throw error;
    throw new Error('Unsafe API origin');
  }
}

function isAllowedLocalOrigin(parsed: URL): boolean {
  if (parsed.protocol === 'https:' && parsed.origin === PRODUCTION_ORIGIN) return true;
  return parsed.protocol === 'http:'
    && (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')
    && (parsed.port === '8080' || parsed.port === '');
}
