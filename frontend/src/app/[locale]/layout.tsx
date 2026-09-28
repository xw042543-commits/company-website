import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { isLocale } from "@/lib/site";

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <SiteChrome locale={locale}>{children}</SiteChrome>;
}
