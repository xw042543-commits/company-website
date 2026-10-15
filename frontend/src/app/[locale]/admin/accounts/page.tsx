import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminAccountPanel } from "@/components/admin-account-panel";
import { isLocale } from "@/lib/site";
import { loadProxySessionAccess, proxyRedirectPath } from "@/lib/proxy-policy";
import { serverApiBaseUrl } from "@/lib/runtime-config";
export const dynamic = "force-dynamic";
export default async function AdminAccountsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Check the canonical route again at rendering time, including encoded URLs
  // and client-side navigation that may reuse an earlier proxy response.
  const path = `/${locale}/admin/accounts`;
  const access = await loadProxySessionAccess(path, serverApiBaseUrl, (await cookies()).toString(), process.env.NODE_ENV);
  const destination = proxyRedirectPath(path, "", access);
  if (destination) redirect(destination);
  return <AdminAccountPanel locale={locale} />;
}
