"use client";

import { FormEvent, useState } from "react";
import { FormProgress } from "@/components/form-progress";
import { applicationLevelLabel } from "@/data/company-profile";
import { Locale, levels, words } from "@/lib/site";

export function ConsultationForm({ locale }: { locale: Locale }) {
  const [reviewed, setReviewed] = useState(false);
  const [completed, setCompleted] = useState(0);

  function updateProgress(event: FormEvent<HTMLFormElement>) {
    setReviewed(false);
    const data = new FormData(event.currentTarget);
    const fields = ["name", "contact", "intendedSchool", "intendedCourse", "qualification", "notes"];
    setCompleted(fields.filter((field) => String(data.get(field) ?? "").trim()).length);
  }

  return <form className="consultation-form" onSubmit={event => { event.preventDefault(); setReviewed(true); }} onInput={updateProgress} onChange={updateProgress}>
    <p id="form-availability" className="form-notice">{words(locale, "咨询表单目前仅供预览。请勿填写真实个人资料；此页面不会发送或保存任何内容。", "The enquiry form is currently available in preview mode only. Do not enter real personal information; nothing entered here will be sent or stored.")}</p>
    <FormProgress completed={completed} total={6} locale={locale} />
    <div className="form-grid" aria-describedby="form-availability">
      <div className="field"><label htmlFor="name">{words(locale, "姓名", "Name")}</label><input id="name" name="name" autoComplete="off" maxLength={100} /></div>
      <div className="field"><label htmlFor="contact">{words(locale, "手机或微信", "Phone number or WeChat")}</label><input id="contact" name="contact" autoComplete="off" maxLength={100} /></div>
      <div className="field"><label htmlFor="school">{words(locale, "意向学校", "Intended university")}</label><input id="school" name="intendedSchool" maxLength={200} autoComplete="off" /></div>
      <div className="field"><label htmlFor="course">{words(locale, "意向专业", "Intended course")}</label><input id="course" name="intendedCourse" maxLength={200} autoComplete="off" /></div>
      <div className="field"><label htmlFor="qualification">{words(locale, applicationLevelLabel.zh, applicationLevelLabel.en)}</label><select id="qualification" name="qualification" defaultValue=""><option value="">{words(locale, "请选择", "Please select")}</option>{levels.map(([id, zh, en]) => <option key={id} value={id}>{words(locale, zh, en)}</option>)}</select></div>
    </div>
    <div className="field"><label htmlFor="notes">{words(locale, "备注", "Notes")}</label><textarea id="notes" name="notes" rows={5} maxLength={2000} autoComplete="off" /></div>
    <div className="consent"><input type="checkbox" id="privacy" name="privacyConsent" disabled aria-describedby="privacy-pending" /><label htmlFor="privacy">{words(locale, "隐私同意", "Privacy consent")}</label></div>
    <p id="privacy-pending" className="muted">{words(locale, "正式开放后，你需要阅读并同意隐私声明，才能提交咨询。", "When the form opens, you will need to review and accept the privacy notice before submitting an enquiry.")}</p>
    <div className="form-actions"><button type="submit" className="secondary">{words(locale, "检查填写内容", "Review your details")}</button><button type="button" disabled>{words(locale, "咨询提交暂未开放", "Enquiry submission unavailable")}</button></div>
    {reviewed && <p role="status" aria-live="polite" className="form-notice">{words(locale, "检查完成。没有任何内容被发送或保存。", "Review complete. Nothing was sent or saved.")}</p>}
  </form>;
}
