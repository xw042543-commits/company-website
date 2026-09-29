import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SiteChrome } from "@/components/site-chrome";
import { DEMO_SESSION_COOKIE, isDemoSessionValue } from "@/lib/demo-session";
import { isLocale } from "@/lib/site";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const cookieStore = await cookies();
  const signedIn = isDemoSessionValue(cookieStore.get(DEMO_SESSION_COOKIE)?.value);

  return <SiteChrome locale={locale} signedIn={signedIn}>{children}</SiteChrome>;
}
