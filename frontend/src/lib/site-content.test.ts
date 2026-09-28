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
  assert.match(about, /id="enquiry"/);
  assert.match(about, /品牌使命/);
  assert.match(about, /品牌愿景/);
  assert.doesNotMatch(about, /company-services/);
});

test("legacy consultation route redirects to the about enquiry section", () => {
  const consultation = read("../app/[locale]/consultation/page.tsx");
  assert.match(consultation, /redirect\(`\/\$\{locale\}\/about#enquiry`\)/);
});

test("homepage uses the approved positioning and enquiry destination", () => {
  const home = read("../app/[locale]/page.tsx");
  assert.match(home, /科学规划/);
  assert.match(home, /全球第一家留学生综合服务平台/);
  assert.match(home, /留学热门院校/);
  assert.match(home, /留学常见问题解答/);
  assert.doesNotMatch(home, /\$\{locale\}\/consultation/);
});

test("directory and planning pages use the approved headings", () => {
  const planning = read("../app/[locale]/planning/page.tsx");
  const universities = read("../app/[locale]/universities/page.tsx");
  assert.match(planning, /规划专业/);
  assert.match(planning, /选专业定方向/);
  assert.match(universities, /留学目的地/);
});

test("footer offers a bilingual contact link to the enquiry section", () => {
  const chrome = read("../components/site-chrome.tsx");
  const home = read("../app/[locale]/page.tsx");
  assert.match(chrome, /联系我们/);
  assert.match(chrome, /Contact us/);
  assert.match(chrome, /`\/\$\{locale\}\/about#enquiry`/);
  assert.match(chrome, /footer-contact-action/);
  assert.doesNotMatch(home, /className="home-cta"/);
});
