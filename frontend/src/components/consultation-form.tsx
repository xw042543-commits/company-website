"use client";

import { FormEvent, useState } from "react";
import { FormProgress } from "@/components/form-progress";
import { applicationLevelLabel } from "@/data/company-profile";
import { submitConsultation, type ConsultationRequest } from "@/lib/consultation-api";
import { browserApiBaseUrl } from "@/lib/client-runtime";
import { Locale, levels, words } from "@/lib/site";

type FormStatus = { tone: "success" | "error"; text: string } | null;

function optional(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim() || null;
}

export function ConsultationForm({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const [completed, setCompleted] = useState(0);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  function updateProgress(event: FormEvent<HTMLFormElement>) {
    setStatus(null);
    const data = new FormData(event.currentTarget);
    const fields = compact ? ["name", "contact", "notes"] : ["name", "contact", "intendedSchool", "intendedCourse", "qualification", "notes"];
    setCompleted(fields.filter((field) => String(data.get(field) ?? "").trim()).length);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const qualification = optional(data, "qualification");
    const body: ConsultationRequest = {
      name: String(data.get("name") ?? "").trim(),
      contact: String(data.get("contact") ?? "").trim(),
      intendedSchool: optional(data, "intendedSchool"),
      intendedCourse: optional(data, "intendedCourse"),
      qualification: (["foundation", "bachelor", "master", "doctorate"] as const).find((level) => level === qualification) ?? null,
      notes: optional(data, "notes"),
      locale,
      privacyConsent: true,
    };

    setPending(true);
    setStatus(null);
    const result = await submitConsultation(browserApiBaseUrl(), body);
    setPending(false);
    if (result.status === "submitted") {
      form.reset();
      setCompleted(0);
      setStatus({
        tone: "success",
        text: words(locale, `咨询已提交。查询编号：${result.referenceCode}`, `Enquiry submitted. Reference: ${result.referenceCode}`),
      });
      return;
    }
    const text = result.status === "validation-error"
      ? words(locale, "请检查必填资料后再提交。", "Please check the required details and try again.")
      : result.status === "rate-limited"
        ? words(locale, "提交次数过多，请稍后再试。", "Too many submissions. Please try again later.")
        : result.status === "unavailable"
          ? words(locale, "在线提交暂时不可用，请通过页面上的邮箱联系顾问。", "Online submission is temporarily unavailable. Please contact an adviser using the email on this page.")
          : words(locale, "提交失败，请稍后再试。", "Submission failed. Please try again later.");
    setStatus({ tone: "error", text });
  }

  return <form className="consultation-form" onSubmit={submit} onInput={updateProgress} onChange={updateProgress}>
    <p id="form-availability" className="form-notice">{words(locale, "填写后提交，留学顾问将根据你的需求与你联系。", "Submit your details and an adviser will contact you about your study plans.")}</p>
    <FormProgress completed={completed} total={compact ? 3 : 6} locale={locale} />
    <div className="form-grid" aria-describedby="form-availability">
      <div className="field"><label htmlFor="name">{words(locale, "姓名", "Name")}</label><input id="name" name="name" autoComplete="name" maxLength={100} required /></div>
      <div className="field"><label htmlFor="contact">{words(locale, "手机或微信", "Phone number or WeChat")}</label><input id="contact" name="contact" autoComplete="tel" maxLength={100} required /></div>
      {!compact && <><div className="field"><label htmlFor="school">{words(locale, "意向学校", "Intended university")}</label><input id="school" name="intendedSchool" maxLength={200} autoComplete="off" /></div>
      <div className="field"><label htmlFor="course">{words(locale, "意向专业", "Intended course")}</label><input id="course" name="intendedCourse" maxLength={200} autoComplete="off" /></div>
      <div className="field"><label htmlFor="qualification">{words(locale, applicationLevelLabel.zh, applicationLevelLabel.en)}</label><select id="qualification" name="qualification" defaultValue=""><option value="">{words(locale, "请选择", "Please select")}</option>{levels.map(([id, zh, en]) => <option key={id} value={id}>{words(locale, zh, en)}</option>)}</select></div></>}
    </div>
    <div className="field"><label htmlFor="notes">{words(locale, compact ? "感兴趣的学历、专业或院校" : "备注", compact ? "Qualification, subject, or university of interest" : "Notes")}</label><textarea id="notes" name="notes" rows={compact ? 3 : 5} maxLength={2000} autoComplete="off" /></div>
    <div className="consent"><input type="checkbox" id="privacy" name="privacyConsent" required aria-describedby="privacy-notice" /><label htmlFor="privacy">{words(locale, "我同意洋豆角使用以上资料回复本次咨询。", "I agree that UDAJO may use these details to respond to this enquiry.")}</label></div>
    <p id="privacy-notice" className="muted">{words(locale, "资料仅用于处理本次留学咨询。", "Your details will be used only to handle this study enquiry.")}</p>
    <div className="form-actions"><button type="submit" disabled={pending}>{pending ? words(locale, "正在提交…", "Submitting…") : words(locale, "提交咨询", "Submit enquiry")}</button></div>
    {status && <p role="status" aria-live="polite" className={`form-notice form-status-${status.tone}`}>{status.text}</p>}
  </form>;
}
