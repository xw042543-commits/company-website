import { notFound, redirect } from "next/navigation";

import { programmeDetailPath } from "@/lib/programme-routes";
import { isLocale } from "@/lib/site";

type LegacyProgrammePageProps = {
  params: Promise<{ locale: string; slug: string; programmeId: string }>;
};

export default async function LegacyProgrammePage({ params }: LegacyProgrammePageProps) {
  const { locale, slug, programmeId } = await params;
  if (!isLocale(locale)) notFound();
  redirect(programmeDetailPath(locale, slug, programmeId));
}
