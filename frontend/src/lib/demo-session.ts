export const DEMO_SESSION_COOKIE = "udajo-demo-session";
export const DEMO_SESSION_VALUE = "member-preview-v1";

export function isDemoSessionValue(value: string | undefined) {
  return value === DEMO_SESSION_VALUE;
}
