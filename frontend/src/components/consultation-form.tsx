"use client";

import { useState } from "react";
import { Locale, levels, words } from "@/lib/site";

export function ConsultationForm({ locale }: { locale: Locale }) {
  const [reviewed, setReviewed] = useState(false);

  return <form className="consultation-form" onSubmit={event => { event.preventDefault(); setReviewed(true); }} onChange={() => setReviewed(false)}>
    <p id="form-availability" className="form-notice">{words(locale, "咨询提交功能正在接入。请勿填写真实个人资料，此页面目前不会发送或保存内容。", "Enquiry submission is being connected. Do not enter real personal information because this page does not currently send or save anything.")}</p>
    <div className="form-grid" aria-describedby="form-availability">
      <div className="field"><label htmlFor="name">{words(locale, "姓名", "Name")}</label><input id="name" name="name" autoComplete="off" maxLength={100} /></div>
      <div className="field"><label htmlFor="contact">{words(locale, "手机或微信", "Phone number or WeChat")}</label><input id="contact" name="contact" autoComplete="off" maxLength={100} /></div>
      <div className="field"><label htmlFor="school">{words(locale, "意向学校", "Intended university")}</label><input id="school" name="intendedSchool" maxLength={200} autoComplete="off" /></div>
      <div className="field"><label htmlFor="course">{words(locale, "意向专业", "Intended course")}</label><input id="course" name="intendedCourse" maxLength={200} autoComplete="off" /></div>
      <div className="field"><label htmlFor="qualification">{words(locale, "学历层次", "Qualification level")}</label><select id="qualification" name="qualification" defaultValue=""><option value="">{words(locale, "请选择", "Please select")}</option>{levels.map(([id, zh, en]) => <option key={id} value={id}>{words(locale, zh, en)}</option>)}</select></div>
    </div>
    <div className="field"><label htmlFor="notes">{words(locale, "备注", "Notes")}</label><textarea id="notes" name="notes" rows={5} maxLength={2000} autoComplete="off" /></div>
    <div className="consent"><input type="checkbox" id="privacy" name="privacyConsent" disabled aria-describedby="privacy-pending" /><label htmlFor="privacy">{words(locale, "隐私同意", "Privacy consent")}</label></div>
    <p id="privacy-pending" className="muted">{words(locale, "隐私声明与必填规则确认后，才会开放同意与提交。", "Consent and submission will be enabled after the privacy notice and required-field rules are approved.")}</p>
    <div className="form-actions"><button type="submit" className="secondary">{words(locale, "检查当前填写", "Review current entries")}</button><button type="button" disabled>{words(locale, "提交咨询，暂未开放", "Submit enquiry, unavailable")}</button></div>
    {reviewed && <p role="status" aria-live="polite" className="form-notice">{words(locale, "检查完成。没有任何内容被发送或保存。", "Review complete. Nothing was sent or saved.")}</p>}
  </form>;
}
