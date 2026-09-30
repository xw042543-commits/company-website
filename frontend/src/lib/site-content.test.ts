import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("primary navigation removes programmes and promotes account registration", () => {
  const site = read("./site.ts");
  const header = read("../components/site-header.tsx");
  assert.doesNotMatch(site, /\["programmes"/);
  assert.match(header, /login\?mode=register/);
  assert.match(header, /注册账户/);
  assert.doesNotMatch(header, /href={`\/\$\{locale\}\/consultation`}/);
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
  assert.match(home, /专业规划 · 清晰选择/);
  assert.match(home, /从选校到入学，全程安心规划/);
  assert.match(home, /From choosing a university and programme to preparing your application/);
  assert.doesNotMatch(home, /全球第一家/);
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
  assert.match(sections, /留学资讯与公司动态/);
  assert.match(sections, /Study abroad insights and company updates/);
  assert.match(results, /院校资料正在完善/);
  assert.match(results, /University information is being prepared/);
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

test("key planning and company pages use natural bilingual copy", () => {
  const about = read("../app/[locale]/about/page.tsx");
  const planning = read("../app/[locale]/planning/page.tsx");
  const login = read("../app/[locale]/login/page.tsx");

  assert.match(about, /让每位留学生在海外安心成长/);
  assert.match(about, /Helping students thrive abroad/);
  assert.match(planning, /明确专业与留学方向/);
  assert.match(planning, /Find programmes that fit your goals/);
  assert.match(login, /One account brings together/);
  assert.doesNotMatch(about, /exacting|supplied location/i);
});

test("language programme copy preserves the approved price and format", () => {
  const sections = read("../app/[locale]/[section]/page.tsx");

  assert.match(sections, /每期 4,980 元的封闭式雅思培训/);
  assert.match(sections, /closed learning environment at CNY 4,980 per session/);
  assert.doesNotMatch(sections, /4,980 元起|from CNY 4,980/);
});

test("directory and planning pages use clear bilingual headings", () => {
  const planning = read("../app/[locale]/planning/page.tsx");
  const universities = read("../app/[locale]/universities/page.tsx");
  assert.match(planning, /留学规划/);
  assert.match(planning, /明确专业与留学方向/);
  assert.match(universities, /留学目的地/);
});

test("footer offers a bilingual contact link to the enquiry section", () => {
  const chrome = read("../components/site-chrome.tsx");
  const home = read("../app/[locale]/page.tsx");
  assert.match(chrome, /联系我们/);
  assert.match(chrome, /Contact us/);
  assert.match(chrome, /`\/\$\{locale\}\/about#enquiry`/);
  assert.match(chrome, /footer-contact-link/);
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
});
