import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { formatEnglishDisplayText } from "./site.ts";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("primary navigation removes programmes and promotes account registration", () => {
  const site = read("./site.ts");
  const header = read("../components/site-header.tsx");
  assert.doesNotMatch(site, /\["programmes"/);
  assert.match(header, /login\?mode=register/);
  assert.match(header, /注册账户/);
  assert.doesNotMatch(header, /href={`\/\$\{locale\}\/consultation`}/);
});

test("language switching preserves the current scroll position", () => {
  const header = read("../components/site-header.tsx");
  assert.match(header, /className="language-switch"[^>]*scroll=\{false\}/);
});

test("about page contains the enquiry journey instead of the service strip", () => {
  const about = read("../app/[locale]/about/page.tsx");
  assert.match(about, /ConsultationForm/);
  assert.match(about, /CompanyContacts/);
  assert.match(about, /udajo-office\.webp/);
  assert.doesNotMatch(about, /udajo-office\.png|unoptimized/);
  assert.match(about, /id="enquiry"/);
  assert.match(about, /品牌使命/);
  assert.match(about, /品牌愿景/);
  assert.doesNotMatch(about, /company-services/);
});

test("legacy consultation route redirects to the about enquiry section", () => {
  const consultation = read("../app/[locale]/consultation/page.tsx");
  assert.match(consultation, /redirect\(`\/\$\{locale\}\/about#enquiry`\)/);
});

test("homepage uses professional bilingual positioning and enquiry destination", () => {
  const home = read("../app/[locale]/page.tsx");
  const publicHome = read("../components/public-home.tsx");
  assert.match(home, /if \(!signedIn\) return <PublicHome locale=\{locale\} \/>/);
  assert.match(publicHome, /public-home-hero/);
  assert.match(publicHome, /public-home-campus-grid/);
  assert.match(publicHome, /public-home-contact-desk/);
  assert.match(publicHome, /ConsultationForm/);
  assert.match(publicHome, /udajo-office\.webp/);
  assert.match(publicHome, /um-modern-campus\.webp/);
  assert.match(publicHome, /UNIVERSITY_CATALOG\.map/);
  assert.match(publicHome, /public-home-school-card/);
  assert.doesNotMatch(publicHome, /easyunime\.com/);
  assert.match(home, /科学规划｜科学定位/);
  assert.match(home, /全球第一家留学生综合服务平台/);
  assert.match(home, /科学规划留学院校专业/);
  assert.match(home, /科学定位留学人生发展/);
  assert.doesNotMatch(home, /把留学目标变成清晰的行动计划/);
  assert.match(home, /apu-campus\.webp/);
  assert.match(home, /留学热门院校/);
  assert.match(home, /留学常见问题解答/);
  assert.doesNotMatch(home, /\$\{locale\}\/consultation/);
});

test("public copy uses consistent professional bilingual terminology", () => {
  const site = read("./site.ts");
  const sections = read("../app/[locale]/[section]/page.tsx");
  const results = read("../components/results-state.tsx");
  const registration = read("../components/register-form.tsx");
  const recovery = read("../components/forgot-password-form.tsx");

  assert.match(site, /留学规划/);
  assert.match(site, /Study planning/);
  assert.match(sections, /关注第一手信息/);
  assert.match(sections, /First-hand updates/);
  assert.match(results, /院校资料正在完善/);
  assert.match(results, /University profiles coming soon/);
  assert.match(registration, /创建账户/);
  assert.match(registration, /Create account/);
  assert.match(recovery, /发送重设说明/);
  assert.match(recovery, /Send reset instructions/);
  assert.doesNotMatch([sections, results, registration, recovery].join("\n"), /正在接入|being connected|backend integration/i);
});

test("user-facing status copy avoids implementation language", () => {
  const sources = [
    read("../components/consultation-form.tsx"),
    read("../components/filter-panel.tsx"),
    read("../components/login-form.tsx"),
    read("../components/school-card.tsx"),
    read("../app/[locale]/universities/[slug]/page.tsx"),
  ].join("\n");

  assert.doesNotMatch(sources, /正在接入|尚未接入|等待后端|being connected|not connected|backend integration|awaiting approval|after approval/i);
  assert.doesNotMatch(read("../components/login-form.tsx"), /预览模式|preview mode/i);
});

test("enquiry form submits to the consultation API with explicit consent", () => {
  const form = read("../components/consultation-form.tsx");
  assert.match(form, /submitConsultation/);
  assert.match(form, /browserApiBaseUrl/);
  assert.match(form, /privacyConsent:\s*true/);
  assert.match(form, /type="submit"/);
  assert.match(form, /referenceCode/);
  assert.doesNotMatch(form, /preview mode only|仅供预览|consultation submission unavailable|咨询提交暂未开放/i);
  assert.doesNotMatch(form, /name="privacyConsent" disabled/);
});

test("key planning and company pages use natural bilingual copy", () => {
  const about = read("../app/[locale]/about/page.tsx");
  const planning = read("../app/[locale]/planning/page.tsx");
  const login = read("../app/[locale]/login/page.tsx");

  assert.match(about, /让留学变得更简单/);
  assert.match(about, /Clear guidance for studying abroad/);
  assert.match(planning, /选专业，定方向/);
  assert.match(planning, /Find a programme that suits you/);
  assert.match(login, /Continue planning your studies/);
  assert.doesNotMatch(about, /exacting|supplied location/i);
});

test("language programme copy preserves the approved price and format", () => {
  const sections = read("../app/[locale]/[section]/page.tsx");

  assert.match(sections, /每期 4,980 元的封闭式雅思培训/);
  assert.match(sections, /Intensive IELTS training costs CNY 4,980 per session/);
  assert.doesNotMatch(sections, /4,980 元起|from CNY 4,980/);
});

test("content pages expose the approved scholarship grid and news channels", () => {
  const sections = read("../app/[locale]/[section]/page.tsx");
  const styles = read("../app/globals.css");

  assert.match(sections, /scholarship-article-grid/);
  assert.match(sections, /留学政策/);
  assert.match(sections, /院校动态/);
  assert.match(sections, /洋豆角资讯/);
  assert.match(styles, /\.scholarship-article-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4/);
  assert.match(styles, /@media \(max-width:\s*620px\)[\s\S]*?\.scholarship-article-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test("English display copy normalizes imported all-caps titles", () => {
  assert.equal(
    formatEnglishDisplayText("BACHELOR OF ENTREPRENEURSHIP AND INNOVATION"),
    "Bachelor of Entrepreneurship and Innovation",
  );
  assert.equal(
    formatEnglishDisplayText("DOCTOR OF PHILOSOPHY (PHD)"),
    "Doctor of Philosophy (PhD)",
  );
  assert.equal(formatEnglishDisplayText("ON_CAMPUS"), "On Campus");
  assert.equal(formatEnglishDisplayText("Taylor's University"), "Taylor's University");
});

test("directory and planning pages use clear bilingual headings", () => {
  const planning = read("../app/[locale]/planning/page.tsx");
  const universities = read("../app/[locale]/universities/page.tsx");
  assert.match(planning, /规划专业/);
  assert.match(planning, /选专业，定方向/);
  assert.match(universities, /留学目的地/);
});

test("footer offers bilingual navigation, social links, and direct contact details", () => {
  const chrome = read("../components/site-chrome.tsx");
  const profile = read("../data/company-profile.ts");
  const home = read("../app/[locale]/page.tsx");
  assert.match(chrome, /联系顾问/);
  assert.match(chrome, /Contact an adviser/);
  assert.match(chrome, /`\/\$\{locale\}\/about#enquiry`/);
  assert.match(chrome, /footer-contact-link/);
  assert.match(chrome, /footer-navigation/);
  assert.match(chrome, /DouyinIcon/);
  assert.match(chrome, /WechatIcon/);
  assert.match(chrome, /companyProfile\.publicEmail/);
  assert.match(profile, /https:\/\/xhslink\.cn\/o\/1LJUVW7yRyw/);
  assert.match(profile, /https:\/\/v\.douyin\.com\/dIMeK5xqBAY\//);
  assert.doesNotMatch(chrome, /footer-contact-copy/);
  assert.doesNotMatch(home, /className="home-cta"/);
});

test("university details expose programme level filters and a data review note", () => {
  const detail = read("../app/[locale]/universities/[slug]/page.tsx");
  assert.match(detail, /programme-level-filters/);
  assert.match(detail, /本科/);
  assert.match(detail, /硕士/);
  assert.match(detail, /博士/);
  assert.match(detail, /费用与入学要求可能调整/);
  assert.match(detail, /programme-search/);
  assert.match(detail, /搜索此院校的课程/);
  assert.match(detail, /programme-requirements/);
  assert.match(detail, /<Link scroll=\{false\}[^>]*aria-current=\{!selectedLevel/);
  assert.match(detail, /<Link scroll=\{false\} key=\{level\}/);
  assert.match(detail, /university-detail-header/);
  assert.match(detail, /university-detail-nav/);
  assert.match(detail, /What to prepare/);
  assert.doesNotMatch(detail, /Adviser QR code coming soon/);
});
