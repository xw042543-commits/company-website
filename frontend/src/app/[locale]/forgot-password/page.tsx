import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/site";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  redirect(`/${locale}/login?mode=recovery`);
}
