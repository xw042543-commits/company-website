export type AuthSession = {
  authenticated: boolean;
  userId: number | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
};

export type AccountProfile = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
};

export type RegisterAccountRequest = {
  fullName: string;
  email: string | null;
  phone: string | null;
  password: string;
  agreementAccepted: boolean;
  privacyAccepted: boolean;
  locale: string;
};

export type LoginRequest = { identifier: string; password: string; rememberMe: boolean };
export type VerifyEmailRequest = { token: string };
export type VerifyPhoneRequest = { phone: string; code: string };
export type PasswordResetRequest = { identifier: string; locale: string };
export type ResetPasswordRequest = { token: string; newPassword: string };
export type ChangePasswordRequest = { currentPassword: string; newPassword: string };
export type DeleteAccountRequest = { currentPassword: string; confirmation: string };

type FailureResult =
  | { status: "validation-error"; fieldErrors: Record<string, string> }
  | { status: "unauthorized" }
  | { status: "rate-limited" }
  | { status: "unavailable" }
  | { status: "error" };

export type MutationResult = { status: "ready" } | { status: "accepted" } | FailureResult;
export type CsrfResult = { status: "ready"; headerName: string; token: string } | FailureResult;
export type LoginResult = { status: "ready"; session: AuthSession } | FailureResult;
export type SessionResult = { status: "ready"; session: AuthSession } | FailureResult;
export type AccountResult = { status: "ready"; account: AccountProfile } | FailureResult;
export type RegistrationResult =
  | { status: "accepted"; verificationMethod: "EMAIL" | "PHONE" }
  | FailureResult;

type Parser<T> = (payload: unknown) => T | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function parseBaseUrl(baseUrl: string | undefined): URL | null {
  if (!baseUrl) return null;
  try {
    const parsed = new URL(baseUrl);
    if (!(["http:", "https:"] as string[]).includes(parsed.protocol)
      || parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    parsed.pathname = parsed.pathname.replace(/\/$/, "") || "/";
    return parsed;
  } catch {
    return null;
  }
}

function endpoint(baseUrl: URL, path: string): URL {
  return new URL(path, `${baseUrl.origin}/`);
}

function parseCsrf(payload: unknown): { headerName: string; token: string } | null {
  if (!isRecord(payload)
    || !hasExactKeys(payload, ["headerName", "token"])
    || typeof payload.headerName !== "string" || !payload.headerName.trim()
    || typeof payload.token !== "string" || !payload.token.trim()) return null;
  return { headerName: payload.headerName, token: payload.token };
}

function parseSession(payload: unknown): AuthSession | null {
  if (!isRecord(payload)
    || !hasExactKeys(payload, ["authenticated", "userId", "fullName", "email", "phone"])
    || typeof payload.authenticated !== "boolean"
    || !isNullableString(payload.fullName)
    || !isNullableString(payload.email)
    || !isNullableString(payload.phone)) return null;

  if (payload.authenticated) {
    if (!isPositiveInteger(payload.userId) || !payload.fullName?.trim()) return null;
  } else if (payload.userId !== null || payload.fullName !== null || payload.email !== null || payload.phone !== null) {
    return null;
  }
  return payload as AuthSession;
}

function parseAccount(payload: unknown): AccountProfile | null {
  if (!isRecord(payload)
    || !hasExactKeys(payload, ["id", "fullName", "email", "phone", "emailVerified", "phoneVerified", "createdAt"])
    || !isPositiveInteger(payload.id)
    || typeof payload.fullName !== "string" || !payload.fullName.trim()
    || !isNullableString(payload.email)
    || !isNullableString(payload.phone)
    || typeof payload.emailVerified !== "boolean"
    || typeof payload.phoneVerified !== "boolean"
    || typeof payload.createdAt !== "string"
    || Number.isNaN(Date.parse(payload.createdAt))) return null;
  return payload as AccountProfile;
}

function parseRegistration(payload: unknown): { verificationMethod: "EMAIL" | "PHONE" } | null {
  if (!isRecord(payload)
    || !hasExactKeys(payload, ["verificationMethod", "message"])
    || (payload.verificationMethod !== "EMAIL" && payload.verificationMethod !== "PHONE")
    || typeof payload.message !== "string" || !payload.message.trim()) return null;
  return { verificationMethod: payload.verificationMethod };
}

function parseFieldErrors(payload: unknown): Record<string, string> {
  if (!isRecord(payload) || !isRecord(payload.fieldErrors)) return {};
  const errors: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload.fieldErrors)) {
    if (key.trim() && typeof value === "string") errors[key] = value;
  }
  return errors;
}

async function failure(response: Response): Promise<FailureResult> {
  if (response.status === 401 || response.status === 403) return { status: "unauthorized" };
  if (response.status === 429) return { status: "rate-limited" };
  if (response.status === 502 || response.status === 503 || response.status === 504) return { status: "unavailable" };
  if (response.status === 400) {
    try {
      return { status: "validation-error", fieldErrors: parseFieldErrors(await response.json()) };
    } catch {
      return { status: "validation-error", fieldErrors: {} };
    }
  }
  return { status: "error" };
}

async function readJson<T>(response: Response, parse: Parser<T>): Promise<T | null> {
  try {
    return parse(await response.json());
  } catch {
    return null;
  }
}

export async function getCsrfToken(
  baseUrl: string | undefined,
  request: typeof fetch = fetch,
): Promise<CsrfResult> {
  const base = parseBaseUrl(baseUrl);
  if (!base || typeof request !== "function") return { status: "error" };
  try {
    const response = await request(endpoint(base, "/api/v1/auth/csrf"), {
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return failure(response);
    const parsed = await readJson(response, parseCsrf);
    return parsed ? { status: "ready", ...parsed } : { status: "error" };
  } catch {
    return { status: "unavailable" };
  }
}

async function authWrite<T>(
  baseUrl: string | undefined,
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body: unknown,
  expectedStatus: 200 | 202 | 204,
  parse: Parser<T> | null,
  request: typeof fetch,
): Promise<MutationResult | ({ status: "ready"; value: T }) | ({ status: "accepted"; value: T })> {
  const base = parseBaseUrl(baseUrl);
  if (!base || typeof request !== "function") return { status: "error" };
  const csrf = await getCsrfToken(baseUrl, request);
  if (csrf.status !== "ready") return csrf.status === "error" ? { status: "error" } : { status: "unavailable" };

  try {
    const response = await request(endpoint(base, path), {
      method,
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(5_000),
    });
    if (response.status !== expectedStatus) return failure(response);
    if (!parse) return expectedStatus === 202 ? { status: "accepted" } : { status: "ready" };
    const value = await readJson(response, parse);
    if (!value) return { status: "error" };
    return expectedStatus === 202 ? { status: "accepted", value } : { status: "ready", value };
  } catch {
    return { status: "unavailable" };
  }
}

async function authRead<T>(
  baseUrl: string | undefined,
  path: string,
  parse: Parser<T>,
  request: typeof fetch,
): Promise<{ status: "ready"; value: T } | FailureResult> {
  const base = parseBaseUrl(baseUrl);
  if (!base || typeof request !== "function") return { status: "error" };
  try {
    const response = await request(endpoint(base, path), {
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return failure(response);
    const value = await readJson(response, parse);
    return value ? { status: "ready", value } : { status: "error" };
  } catch {
    return { status: "unavailable" };
  }
}

export async function login(baseUrl: string | undefined, body: LoginRequest, request: typeof fetch = fetch): Promise<LoginResult> {
  const result = await authWrite(baseUrl, "/api/v1/auth/login", "POST", body, 200, parseSession, request);
  return result.status === "ready" && "value" in result
    ? { status: "ready", session: result.value }
    : result as FailureResult;
}

export async function registerAccount(baseUrl: string | undefined, body: RegisterAccountRequest, request: typeof fetch = fetch): Promise<RegistrationResult> {
  const result = await authWrite(baseUrl, "/api/v1/auth/register", "POST", body, 202, parseRegistration, request);
  return result.status === "accepted" && "value" in result
    ? { status: "accepted", verificationMethod: result.value.verificationMethod }
    : result as FailureResult;
}

export async function getSession(baseUrl: string | undefined, request: typeof fetch = fetch): Promise<SessionResult> {
  const result = await authRead(baseUrl, "/api/v1/auth/session", parseSession, request);
  return result.status === "ready" ? { status: "ready", session: result.value } : result;
}

export async function getAccount(baseUrl: string | undefined, request: typeof fetch = fetch): Promise<AccountResult> {
  const result = await authRead(baseUrl, "/api/v1/account", parseAccount, request);
  return result.status === "ready" ? { status: "ready", account: result.value } : result;
}

export async function verifyEmail(baseUrl: string | undefined, body: VerifyEmailRequest, request: typeof fetch = fetch): Promise<MutationResult> {
  return authWrite(baseUrl, "/api/v1/auth/verify-email", "POST", body, 204, null, request) as Promise<MutationResult>;
}

export async function verifyPhone(baseUrl: string | undefined, body: VerifyPhoneRequest, request: typeof fetch = fetch): Promise<MutationResult> {
  return authWrite(baseUrl, "/api/v1/auth/verify-phone", "POST", body, 204, null, request) as Promise<MutationResult>;
}

export async function logout(baseUrl: string | undefined, request: typeof fetch = fetch): Promise<MutationResult> {
  return authWrite(baseUrl, "/api/v1/auth/logout", "POST", undefined, 204, null, request) as Promise<MutationResult>;
}

export async function requestPasswordReset(baseUrl: string | undefined, body: PasswordResetRequest, request: typeof fetch = fetch): Promise<MutationResult> {
  return authWrite(baseUrl, "/api/v1/auth/forgot-password", "POST", body, 202, null, request) as Promise<MutationResult>;
}

export async function resetPassword(baseUrl: string | undefined, body: ResetPasswordRequest, request: typeof fetch = fetch): Promise<MutationResult> {
  return authWrite(baseUrl, "/api/v1/auth/reset-password", "POST", body, 204, null, request) as Promise<MutationResult>;
}

export async function changePassword(baseUrl: string | undefined, body: ChangePasswordRequest, request: typeof fetch = fetch): Promise<MutationResult> {
  return authWrite(baseUrl, "/api/v1/account/password", "PUT", body, 204, null, request) as Promise<MutationResult>;
}

export async function deleteAccount(baseUrl: string | undefined, body: DeleteAccountRequest, request: typeof fetch = fetch): Promise<MutationResult> {
  return authWrite(baseUrl, "/api/v1/account", "DELETE", body, 204, null, request) as Promise<MutationResult>;
}
