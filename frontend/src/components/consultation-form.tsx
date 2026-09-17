"use client";

import { useState } from "react";
import { Locale, levels, words } from "@/lib/site";

// Stage-one form review only. Never send personal data through a GET URL,
// localStorage, analytics, console output, or an unapproved API endpoint.
export function ConsultationForm({ locale }: { locale: Locale }) {
  const [checked, setChecked] = useState(false);
  return <form className="consultation-form" onSubmit={event => { event.preventDefault(); setChecked(true); }} onChange={() => setChecked(false)}>
    <p id="preview-warning" className="form-notice">{words(locale, "此表单仅供结构审核，请勿填写真实个人资料。当前不会发送或保存资料。", "For form review only. Do not enter real personal information. Nothing is sent or saved.")}</p>
    <div className="form-grid" aria-describedby="preview-warning">
      <div className="field"><label htmlFor="name">{words(locale, "姓名", "Name")}</label><input id="name" autoComplete="off" maxLength={100} /></div>
      <div className="field"><label htmlFor="contact">{words(locale, "手机或微信", "Phone number or WeChat")}</label><input id="contact" autoComplete="off" maxLength={100} /></div>
      <div className="field"><label htmlFor="school">{words(locale, "意向学校", "Intended university")}</label><input id="school" maxLength={200} autoComplete="off" /></div>
      <div className="field"><label htmlFor="course">{words(locale, "意向专业", "Intended course")}</label><input id="course" maxLength={200} autoComplete="off" /></div>
      <div className="field"><label htmlFor="qualification">{words(locale, "学历层次", "Qualification level")}</label><select id="qualification" defaultValue=""><option value="">{words(locale, "请选择", "Please select")}</option>{levels.map(([id, zh, en]) => <option key={id} value={id}>{words(locale, zh, en)}</option>)}</select></div>
    </div>
    <div className="field"><label htmlFor="notes">{words(locale, "备注", "Notes")}</label><textarea id="notes" rows={5} maxLength={2000} autoComplete="off" /></div>
    <div className="consent"><input type="checkbox" id="privacy" disabled aria-describedby="privacy-pending" /><label htmlFor="privacy">{words(locale, "隐私同意", "Privacy consent")}</label></div>
    <p id="privacy-pending" className="muted">{words(locale, "隐私声明与必填规则待确认，暂不接受同意或提交。", "Privacy wording and required-field rules await approval. Consent and submission are not available yet.")}</p>
    <div className="form-actions"><button type="submit" className="secondary">{words(locale, "检查表单预览", "Check form preview")}</button><button type="button" disabled>{words(locale, "提交咨询（暂不可用）", "Submit enquiry (unavailable)")}</button></div>
    {checked && <p role="status" className="form-notice">{words(locale, "这只是表单预览，未提交或保存任何咨询。正式字段校验将在规则确认后接入。", "This is a form preview. No enquiry was submitted or saved. Field validation will be connected after the rules are approved.")}</p>}
  </form>;
}
