import { notFound } from "next/navigation";
import { AdminAccountPanel } from "@/components/admin-account-panel";
import { isLocale } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function AdminAccountsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AdminAccountPanel locale={locale} />;
}
