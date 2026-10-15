import { notFound } from "next/navigation";
import { AdminCatalogPanel } from "@/components/admin-catalog-panel";
import { isLocale } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AdminCatalogPanel locale={locale} />;
}
