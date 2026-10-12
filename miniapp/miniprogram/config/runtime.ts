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

interface ApiOrigin {
  protocol: string;
  hostname: string;
  port: string;
  origin: string;
}

function parseOrigin(raw: string): ApiOrigin {
  // Only bare HTTP(S) origins are supported, not general browser URLs.
  // Native WeChat does not provide the browser URL constructor.
  const match = /^(https?):\/\/([a-z0-9.-]+)(?::([0-9]{1,5}))?\/?$/i.exec(raw);
  if (!match || !match[1] || !match[2]) throw new Error('Unsafe API origin');
  const protocol = `${match[1].toLowerCase()}:`;
  const hostname = match[2].toLowerCase();
  const number = match[3] ? Number(match[3]) : undefined;
  if (number !== undefined && (number < 1 || number > 65535)) throw new Error('Unsafe API origin');
  const isDefault = number === (protocol === 'https:' ? 443 : 80);
  const port = number === undefined || isDefault ? '' : String(number);
  return { protocol, hostname, port, origin: `${protocol}//${hostname}${port ? `:${port}` : ''}` };
}

function isAllowedLocalOrigin(parsed: ApiOrigin): boolean {
  if (parsed.protocol === 'https:' && parsed.origin === PRODUCTION_ORIGIN) return true;
  return parsed.protocol === 'http:'
    && (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')
    && (parsed.port === '8080' || parsed.port === '');
}
