import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");
const schoolCard = readFileSync(fileURLToPath(new URL("../components/school-card.tsx", import.meta.url)), "utf8");
const publicHome = readFileSync(fileURLToPath(new URL("../components/public-home.tsx", import.meta.url)), "utf8");
const memberHome = readFileSync(fileURLToPath(new URL("./[locale]/page.tsx", import.meta.url)), "utf8");
const siteHeader = readFileSync(fileURLToPath(new URL("../components/site-header.tsx", import.meta.url)), "utf8");
const filterPanel = readFileSync(fileURLToPath(new URL("../components/filter-panel.tsx", import.meta.url)), "utf8");
const comparisonTray = readFileSync(fileURLToPath(new URL("../components/comparison-tray.tsx", import.meta.url)), "utf8");
const saveToggle = readFileSync(fileURLToPath(new URL("../components/save-toggle.tsx", import.meta.url)), "utf8");
const searchAutocomplete = readFileSync(fileURLToPath(new URL("../components/search-autocomplete.tsx", import.meta.url)), "utf8");
const programmePage = readFileSync(fileURLToPath(new URL("./[locale]/universities/[slug]/programmes/[programmeId]/page.tsx", import.meta.url)), "utf8");
const universityDetailPage = readFileSync(fileURLToPath(new URL("./[locale]/universities/[slug]/page.tsx", import.meta.url)), "utf8");
const companyContacts = readFileSync(fileURLToPath(new URL("../components/company-contacts.tsx", import.meta.url)), "utf8");

test("adviser console keeps master-detail information readable and responsive", () => {
  for (const selector of [".adviser-console-shell", ".adviser-collection-state", ".adviser-master-detail",
    ".adviser-records", ".adviser-record", ".adviser-system-info"]) {
    assert.match(css, new RegExp(selector.replace(".", "\\.")));
  }
  assert.match(css, /\.adviser-master-detail\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(320px,\s*0\.72fr\)/);
  assert.match(css, /\.adviser-detail\s*\{[^}]*position:\s*sticky/);
  assert.match(css, /\.adviser-record[^{]*\{[^}]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\.adviser-portal [^{]*:focus-visible/);
  assert.match(css, /\.adviser-notes\s*\{[^}]*white-space:\s*pre-wrap/);
  assert.match(css, /@media \(max-width:\s*800px\)[\s\S]*?\.adviser-master-detail\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width:\s*800px\)[\s\S]*?min-height:\s*44px/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.adviser-record/);
});

test("global styles cover the rendered header and homepage layout", () => {
  for (const selector of [
    ".header-shell",
    ".pathway-grid",
    ".faq-layout",
    ".featured-carousel",
    ".comparison-panel",
    ".contact-card",
    ".programme-detail-list",
    ".programme-level-filters",
    ".public-home-hero",
    ".public-home-campus-grid",
    ".public-home-contact-desk",
    ".public-home-enquiry",
    ".public-home-school-grid",
  ]) {
    assert.match(css, new RegExp(`\\${selector}\\b`), `${selector} is missing from globals.css`);
  }

  assert.match(css, /\.hero-intro\s*\{[\s\S]*?font-size:\s*clamp\(1\.03rem,\s*1\.35vw,\s*1\.16rem\)/);
});

test("contact directory uses a lead contact and balanced adviser grid", () => {
  assert.match(companyContacts, /contact-card-primary/);
  assert.match(companyContacts, /contact-card-identity/);
  assert.match(css, /\.contact-card-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.contact-card-primary\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.contact-qr\s*\{[^}]*border-left:\s*1px solid/);
  assert.match(css, /@media \(max-width:\s*520px\)[\s\S]*?\.contact-qr\s*\{[^}]*border-left:\s*0/);
});

test("contact directory keeps adviser details readable", () => {
  assert.match(css, /\.contact-card h3\s*\{[^}]*font-size:\s*1\.28rem;[^}]*line-height:\s*1\.35/);
  assert.match(css, /\.contact-methods > div\s*\{[^}]*min-height:\s*64px;[^}]*font-size:\s*\.9rem/);
  assert.match(css, /\.contact-methods dd\s*\{[^}]*font-size:\s*\.94rem;[^}]*line-height:\s*1\.5/);
  assert.match(css, /\.contact-card-primary \.contact-methods > div\s*\{[^}]*display:\s*block;[^}]*padding:\s*18px 0 10px/);
});

test("public homepage uses a compact enquiry desk and responsive university cards", () => {
  assert.match(css, /\.public-home-contact-desk\s*\{[\s\S]*?grid-template-columns:/);
  assert.match(css, /\.public-home-contact-photo img\s*\{[\s\S]*?object-position:\s*center/);
  assert.match(css, /\.public-home-school-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3/);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.public-home-contact-desk/);
});

test("public homepage balances the process heading and emphasizes contact details", () => {
  assert.match(publicHome, /每一步都清楚/);
  assert.match(publicHome, /下一步怎么走/);
  assert.doesNotMatch(publicHome, /每一步，都知道接下来做什么/);
  assert.match(publicHome, /className="public-home-contact-action"/);
  assert.match(css, /\.public-home-process-heading\s*\{[\s\S]*?text-wrap:\s*balance/);
  assert.match(css, /\.public-home-contact-details\s*\{[\s\S]*?border:\s*1px solid/);
  assert.match(css, /\.public-home-contact-action\s*\{[\s\S]*?font-weight:\s*800/);
});

test("global styles include the shared motion and loading system", () => {
  for (const selector of [
    "[data-reveal]",
    ".form-progress",
    ".university-card-skeleton",
    ".university-logo-label",
    ".location-label",
  ]) {
    assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${selector} is missing from globals.css`);
  }

  assert.match(css, /prefers-reduced-motion:\s*reduce/, "reduced-motion support is missing");
});

test("university loading skeleton is scoped to data-heavy routes without visible copy", () => {
  const localeRoot = fileURLToPath(new URL("./[locale]/", import.meta.url));
  assert.equal(existsSync(`${localeRoot}/loading.tsx`), false, "locale-wide loading UI causes every navigation to flash university copy");

  for (const section of ["planning", "universities"]) {
    const loadingPath = `${localeRoot}/${section}/loading.tsx`;
    assert.equal(existsSync(loadingPath), true, `${section} needs a route-scoped loading boundary`);
    const source = readFileSync(loadingPath, "utf8");
    assert.match(source, /UniversityLoadingSkeleton/);
  }

  const skeleton = readFileSync(fileURLToPath(new URL("../components/university-loading-skeleton.tsx", import.meta.url)), "utf8");
  assert.match(skeleton, /aria-busy="true"/);
  assert.match(skeleton, /aria-hidden="true"/);
  assert.doesNotMatch(skeleton, /正在加载院校资料|Loading university information/);
});

test("directory logos use a centered safe area with a separate hover caption", () => {
  assert.match(schoolCard, /className="school-logo-block"/);
  assert.match(schoolCard, /className="school-logo-caption"/);
  assert.match(css, /\.school-image img\s*\{[\s\S]*?width:\s*82%[\s\S]*?height:\s*82%[\s\S]*?object-position:\s*center/);
  assert.match(css, /\.school-logo-caption\s*\{[\s\S]*?position:\s*static/);
  assert.match(css, /\.school-card:hover \.school-logo-caption/);
});

test("university result cards collapse matching programmes behind an accessible disclosure", () => {
  assert.match(schoolCard, /<details className="school-programme-disclosure">/);
  assert.match(schoolCard, /<summary>/);
  assert.match(schoolCard, /school-programme-chevron/);
  assert.match(schoolCard, /<Link className="school-card-action"/);
  assert.doesNotMatch(schoolCard, /<Link className="school-card-link"[^>]*><article/);
  assert.match(css, /\.school-programme-disclosure\s*\{/);
  assert.match(css, /\.school-programme-disclosure\[open\] \.school-programme-chevron/);
  assert.match(schoolCard, /className="school-card-secondary-actions"/);
  assert.match(schoolCard, /className="course-list-link"/);
  assert.match(schoolCard, /programmeDetailPath\(locale, school\?\.slug \?\? "preview", course\.id\)/);
  assert.match(css, /\.school-card-secondary-actions\s*\{[^}]*gap:\s*6px/);
  assert.match(css, /\.course-list-link:hover/);
});

test("save controls use a restrained bookmark icon", () => {
  assert.match(saveToggle, /className="save-toggle-icon"/);
  assert.doesNotMatch(saveToggle, /★|☆/);
  assert.match(css, /\.save-toggle-icon\s*\{[^}]*fill:\s*none/);
  assert.match(css, /\.save-toggle\.saved \.save-toggle-icon\s*\{[^}]*fill:\s*currentColor/);
});

test("account workspace uses restrained warm accents", () => {
  assert.match(css, /\.account-page\s*\{[^}]*radial-gradient/);
  assert.match(css, /\.account-summary\s*\{[^}]*border-color:\s*#decf9d[^}]*linear-gradient/);
  assert.match(css, /\.saved-items-section\s*\{[^}]*background:\s*linear-gradient/);
  assert.match(css, /\.saved-items-heading > span\s*\{[^}]*background:\s*#c9a653/);
  assert.match(css, /\.shortlist-summary\s*\{[^}]*grid-template-columns:\s*repeat\(3/);
  assert.match(css, /\.saved-plan-fields\s*\{[^}]*display:\s*grid/);
  assert.match(css, /\.consultation-history li\s*\{[^}]*grid-template-columns:/);
});

test("autocomplete suggestions keep words intact while highlighting matches", () => {
  assert.match(searchAutocomplete, /className="search-suggestion-label"/);
  assert.match(searchAutocomplete, /<mark>\{text\.slice/);
  assert.match(css, /\.search-suggestion-label\s*\{[^}]*display:\s*inline/);
  assert.match(css, /\.search-suggestion mark\s*\{[^}]*background:\s*transparent[^}]*color:\s*var\(--brand-action\)/);
});

test("signed-in homepage uses the approved positioning with a restrained action hero", () => {
  assert.match(memberHome, /className="member-home-hero"/);
  assert.match(memberHome, /全球第一家留学生综合服务平台/);
  assert.match(memberHome, /科学规划留学院校专业/);
  assert.match(memberHome, /科学定位留学人生发展/);
  assert.match(memberHome, /Explore · Compare · Decide/);
  assert.match(memberHome, /Find the right university and programme/);
  assert.match(memberHome, /Compare universities, programmes and entry requirements\./);
  assert.match(memberHome, /Plan your next steps with support from an adviser\./);
  assert.doesNotMatch(memberHome, /The world’s first all-in-one platform for international students/);
  assert.doesNotMatch(memberHome, /把留学目标变成清晰的行动计划/);
  assert.match(memberHome, /\/universities\/campuses\/apu-campus\.webp/);
  assert.match(memberHome, /className="member-search-panel/);
  assert.match(css, /\.member-home-hero-grid\s*\{[\s\S]*?grid-template-columns:/);
  assert.match(css, /\.member-home-copy h1\s*\{[^}]*font-size:\s*clamp\(2\.2rem,\s*3vw,\s*3\.45rem\)/);
  assert.match(css, /\.member-home-copy-en h1\s*\{[^}]*max-width:\s*16ch/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.member-home-copy h1\s*\{[^}]*font-size:\s*clamp\(1\.95rem,\s*7vw,\s*2\.2rem\)/);
  assert.match(css, /\.member-home-positioning\s*\{[^}]*font-size:\s*clamp\(1rem,\s*1\.2vw,\s*1\.125rem\)/);
  assert.match(css, /\.member-home-visual img\s*\{[\s\S]*?object-fit:\s*cover/);
  assert.match(memberHome, /className="directory-view-all"/);
  assert.match(css, /\.directory-view-all\s*\{[^}]*border:\s*1px solid/);
});

test("featured university actions use solid buttons without arrows", () => {
  const featuredCarousel = readFileSync(fileURLToPath(new URL("../components/featured-university-carousel.tsx", import.meta.url)), "utf8");
  assert.match(featuredCarousel, /className="button full-width"/);
  assert.doesNotMatch(featuredCarousel, /→/);
  assert.doesNotMatch(featuredCarousel, /button secondary full-width/);
});

test("member search panel reserves its full height instead of being covered by the next section", () => {
  const panelRule = css.match(/\.member-search-panel\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.doesNotMatch(panelRule, /transform:\s*translateY/);
  assert.match(css, /\.member-search-band\s*\{[^}]*padding-block:\s*26px/);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.member-search-band\s*\{[^}]*padding-block:\s*22px/);
});

test("sticky header uses restrained dimensional styling", () => {
  assert.match(siteHeader, /\/brand\/udajo-logo-transparent\.png/);
  assert.doesNotMatch(siteHeader, /\/brand\/udajo-logo\.jpg/);
  assert.match(css, /\.site-header\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0/);
  assert.match(css, /\.site-header\s*\{[\s\S]*?linear-gradient/);
  assert.match(css, /\.site-header\s*\{[\s\S]*?box-shadow:/);
  assert.match(css, /\.brand img\s*\{[\s\S]*?filter:\s*drop-shadow/);
  assert.match(css, /\.navigation a:hover\s*\{[\s\S]*?transform:\s*translateY/);
  assert.match(css, /\.site-header \.login-link\s*\{[\s\S]*?box-shadow:/);
});

test("university directory search stays opaque and flush beneath the header", () => {
  assert.match(css, /\.directory-search-sticky\s*\{[^}]*position:\s*sticky;[^}]*z-index:\s*5;[^}]*top:\s*82px/);
  assert.match(css, /\.directory-search-sticky\s*\{[^}]*background:\s*var\(--paper\)/);
  assert.doesNotMatch(css, /\.directory-search-sticky\s*\{[^}]*color-mix\([^}]*transparent/);
  assert.match(css, /@media \(max-width:\s*1400px\)[\s\S]*?\.directory-search-sticky\s*\{[^}]*top:\s*80px/);
});

test("benefits use a colorful four-point layout that responds without cards", () => {
  assert.match(css, /\.benefits\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.benefits \.benefit-visible\s*\{[^}]*--benefit-accent:/);
  assert.match(css, /\.benefits \.benefit-fair\s*\{[^}]*--benefit-accent:/);
  assert.match(css, /\.benefits \.benefit-support\s*\{[^}]*--benefit-accent:/);
  assert.match(css, /@media \(max-width:\s*520px\)[\s\S]*?\.benefits\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test("application process uses five colorful connected milestones", () => {
  assert.match(css, /\.process\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.process-step-advise\s*\{[^}]*--step-accent:/);
  assert.match(css, /\.process-step-arrive\s*\{[^}]*--step-accent:/);
  assert.match(css, /\.process-step:not\(:last-child\)::after/);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.process\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test("university profiles use an engaging branded hero and scannable facts", () => {
  assert.match(universityDetailPage, /className="university-hero-mark"/);
  assert.match(universityDetailPage, /className="university-fact-strip"/);
  assert.match(universityDetailPage, /className="university-overview-grid"/);
  assert.match(universityDetailPage, /className="enquiry-card-label"/);
  assert.match(css, /\.university-detail-header\s*\{[^}]*grid-template-columns:/);
  assert.match(css, /\.university-fact-strip\s*\{[^}]*grid-template-columns:\s*repeat\(3/);
  assert.match(css, /\.university-overview-grid\s*\{[^}]*grid-template-columns:/);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.university-fact-strip\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test("catalog filters stay compact and removable across tablet layouts", () => {
  assert.match(filterPanel, /className="active-filter-chips"/);
  assert.match(filterPanel, /withoutFilter\(name\)/);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.listing-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.mobile-filter-toggle\s*\{[^}]*display:\s*flex/);
});

test("comparison tray stays viewport-fixed and adapts on small screens", () => {
  assert.match(comparisonTray, /createPortal\(/);
  assert.match(comparisonTray, /document\.body/);
  assert.match(css, /\.comparison-tray\s*\{[^}]*position:\s*fixed/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.comparison-tray\s*\{/);
});

test("programme detail hero keeps its copy, actions, and campus image aligned on small screens", () => {
  assert.match(programmePage, /getUniversityProgramme/);
  assert.match(programmePage, /findLocalProgrammeBySlug/);
  assert.match(css, /\.programme-hero-copy > h1\s*\{[^}]*overflow-wrap:\s*anywhere;[^}]*text-wrap:\s*balance/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.programme-hero-actions\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.programme-hero-visual\.has-photo\s*\{[^}]*aspect-ratio:\s*16 \/ 9/);
  assert.match(css, /@media \(max-width: 390px\)[\s\S]*?\.programme-hero-actions\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(programmePage, /className="programme-section-nav"/);
  assert.match(programmePage, /"介绍", "Introduction"/);
  assert.match(programmePage, /"基本信息", "Course details"/);
  assert.match(programmePage, /"录取要求", "Entry requirements"/);
  assert.match(programmePage, /"课程安排", "Programme structure"/);
  assert.match(programmePage, /"未来职业方向", "Career directions"/);
  assert.doesNotMatch(programmePage, /className="programme-header-facts"/);
  assert.match(programmePage, /"收藏课程", "Save programme"/);
  assert.match(programmePage, /className="programme-data-table"/);
  assert.match(programmePage, /className="container programme-trust-summary"/);
  assert.match(css, /\.programme-trust-summary\s*\{[^}]*grid-template-columns:\s*repeat\(2/);
  assert.match(programmePage, /className="programme-applicant-note"/);
  assert.doesNotMatch(programmePage, /"中国学生", "Applicants from China"/);
  assert.doesNotMatch(programmePage, /label=\{words\(locale, "注册费"/);
  assert.match(css, /\.programme-data-table\s*\{[^}]*border-collapse:\s*collapse/);
  assert.match(programmePage, /className="programme-mobile-actions"/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.programme-mobile-actions\s*\{[^}]*position:\s*fixed/);
});

test("footer uses a spacious editorial layout with responsive link columns", () => {
  assert.match(css, /\.site-footer\s*\{[^}]*background:\s*#f7f3e9/);
  assert.match(css, /\.footer-main\s*\{[^}]*grid-template-columns:/);
  assert.match(css, /\.footer-navigation\s*\{[^}]*grid-template-columns:\s*repeat\(3/);
  assert.match(css, /\.footer-socials > a[^}]*border-radius:\s*50%/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.footer-navigation\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/);
});

test("university result cards keep logos compact at narrow desktop and mobile widths", () => {
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.school-card\s*\{[^}]*grid-template-columns:\s*88px minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.school-image\s*\{[^}]*width:\s*88px;[^}]*height:\s*88px/);
  assert.doesNotMatch(css, /@media \(max-width: 520px\)[\s\S]*?\.school-image\s*\{[^}]*height:\s*150px/);
});
