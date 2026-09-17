import { notFound } from "next/navigation";
import { ConsultationForm } from "@/components/consultation-form";
import { isLocale, words } from "@/lib/site";

export default async function Consultation({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main id="main" className="container page-main">
    <p className="section-label">{words(locale, "获得申请协助", "Get application guidance")}</p>
    <h1>{words(locale, "留学咨询", "Study abroad enquiry")}</h1>
    <p className="page-intro">{words(locale, "告诉我们你的学习方向和目标院校。提交功能开放后，顾问将根据这些资料协助你。", "Tell us about your study interests and intended universities. Once submission opens, an adviser can use these details to guide you.")}</p>
    <div className="detail-layout"><section><h2>{words(locale, "咨询资料", "Enquiry details")}</h2><ConsultationForm locale={locale} /></section><aside className="detail-aside"><h2>{words(locale, "联系顾问", "Contact an adviser")}</h2><div className="qr-placeholder">{words(locale, "咨询二维码确认后将在此发布", "The enquiry QR code will appear after approval")}</div><p>{words(locale, "顾问联系方式和服务时间确认后将在此公布。", "Adviser contact details and service hours will be published after approval.")}</p></aside></div>
  </main>;
}
