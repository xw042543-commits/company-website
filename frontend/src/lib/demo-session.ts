export const DEMO_SESSION_COOKIE = "udajo_demo_session";
export function hasDevelopmentDemoSession(cookieHeader: string | null | undefined, environment = process.env.NODE_ENV): boolean {
  if (environment === "production" || !cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim() === `${DEMO_SESSION_COOKIE}=1`);
}

