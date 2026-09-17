import { notFound } from "next/navigation";
import { ConsultationForm } from "@/components/consultation-form";
import { isLocale, words } from "@/lib/site";
export default async function Consultation({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="container page-main"><p className="eyebrow">{words(locale, "留学咨询", "STUDY ABROAD ENQUIRY")}</p><h1>{words(locale, "咨询", "Enquire")}</h1><div className="detail-layout"><section><h2>{words(locale, "咨询资料", "Enquiry details")}</h2><ConsultationForm locale={locale} /></section><aside className="detail-aside"><h2>{words(locale, "扫码联系老师", "Contact an adviser")}</h2><div className="qr-placeholder">{words(locale, "二维码待提供", "QR code to be supplied")}</div><p>{words(locale, "咨询联系人及处理时间待确认。", "Contact details and response times await confirmation.")}</p></aside></div></main>;
}
