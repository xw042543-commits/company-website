import { notFound } from "next/navigation";
import { AdminImportPanel } from "@/components/admin-import-panel";
import { isLocale } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function AdminImportsPage({params}: {params: Promise<{locale: string}>}) {const {locale}=await params;if(!isLocale(locale))notFound();return <AdminImportPanel locale={locale}/>;}
