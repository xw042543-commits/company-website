import { notFound } from "next/navigation";
import { AdminCoursePanel } from "@/components/admin-course-panel";
import { isLocale } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function AdminCoursesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  return <AdminCoursePanel locale={locale}/>;
}
