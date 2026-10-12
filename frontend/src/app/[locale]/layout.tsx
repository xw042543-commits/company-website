import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { isRequestAuthenticated } from "@/lib/server-auth";
import { isLocale } from "@/lib/site";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const signedIn = await isRequestAuthenticated();

  return <SiteChrome locale={locale} signedIn={signedIn}>{children}</SiteChrome>;
}
