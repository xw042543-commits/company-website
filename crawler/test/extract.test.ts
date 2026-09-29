import assert from "node:assert/strict";
import test from "node:test";
import { extractProgrammes, extractUniversity } from "../src/extract.ts";
import { isPrivateAddress } from "../src/network.ts";
import { mayFetch, parseRobots } from "../src/robots.ts";
import type { PageSnapshot, SourceDefinition } from "../src/types.ts";

const source: SourceDefinition = { sourceKey: "example-u", displayName: "Example U", seedUrls: ["https://example.edu/programmes"], allowedHosts: ["example.edu"], countryRaw: "Malaysia" };
const page: PageSnapshot = {
  url: source.seedUrls[0], fetchedAt: "2026-09-19T00:00:00.000Z", status: 200, contentType: "text/html", sha256: "abc",
  title: "Example University",
  html: `<title>Example University</title><meta name="description" content="Official profile"><script type="application/ld+json">{"@graph":[{"@type":"CollegeOrUniversity","name":"Example University","description":"Official profile","logo":"/logo.png","address":{"addressLocality":"Kuala Lumpur","addressCountry":"Malaysia"}},{"@type":"Course","name":"Bachelor of Computing","description":"Three-year degree","educationalLevel":"Bachelor","attendanceMode":"On campus","timeToComplete":"3 years","inLanguage":["English","Malay"],"startDate":"2027-09-01","offers":{"lowPrice":"12000","highPrice":"15000","priceCurrency":"MYR"}}]}</script>`,
};

test("extracts candidates without inventing formal dictionary codes", () => {
  const university = extractUniversity(page, source); const [programme] = extractProgrammes(page, source);
  assert.equal(university.countryCode, null); assert.equal(university.status, "DRAFT");
  assert.equal(university.cityEn, "Kuala Lumpur"); assert.equal(university.countryRaw, "Malaysia");
  assert.equal(programme.studyLevelCode, null); assert.equal(programme.courseModeCode, null);
  assert.equal(programme.durationMonths, null); assert.equal(programme.durationDisplay, "3 years");
  assert.equal(programme.tuition.feePeriod, "UNKNOWN"); assert.equal(programme.tuition.rmbMin, null);
  assert.equal(programme.tuition.min, 12000); assert.equal(programme.tuition.max, 15000);
  assert.deepEqual(programme.languages, [{ code: null, rawText: "English" }, { code: null, rawText: "Malay" }]);
  assert.deepEqual(programme.intakes, [{ displayText: "2027-09-01", date: "2027-09-01" }]);
});

test("does not treat a catalogue page title and meta description as university facts", () => {
  const unstructured = { ...page, html: `<title>Browse 500 programmes</title><meta name="description" content="Find a course">` };
  const university = extractUniversity(unstructured, source);
  assert.equal(university.nameEn, "Example U"); assert.equal(university.descriptionEn, null);
});

test("extracts Taylor's ordinary HTML programme cards without assigning formal codes", () => {
  const taylors = { ...source, sourceKey: "taylors-university" };
  const listing = { ...page, html: `<a href="/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html"><h4>Bachelor of Computer Science (Honours)</h4><p>Official course description.</p></a>` };
  const [programme] = extractProgrammes(listing, taylors);
  assert.equal(programme.nameEn, "Bachelor of Computer Science (Honours)");
  assert.equal(programme.descriptionEn, "Official course description.");
  assert.equal(programme.studyLevelRaw, "Undergraduate");
  assert.equal(programme.studyLevelCode, null); assert.equal(programme.tuition.min, null);
});

test("extracts UM faculty course cards and keeps the faculty as raw classification", () => {
  const um = { ...source, sourceKey: "university-of-malaya" };
  const listing = { ...page, html: `<li class="my-bc-item my-bc-active"><a href="faculty-of-computer-science"><i></i>Faculty of Computer Science</a></li><div class="course-card coursework" data-mode="fulltime"><a href="bachelor-of-computer-science-data-science">Bachelor of Computer Science (Data Science)</a></div>` };
  const [programme] = extractProgrammes(listing, um);
  assert.equal(programme.nameEn, "Bachelor of Computer Science (Data Science)");
  assert.equal(programme.subjectCategoryRaw, "Faculty of Computer Science");
  assert.equal(programme.subjectCategoryCode, null); assert.equal(programme.courseModeRaw, null);
});

test("honours the longest robots rule", () => {
  const policy = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/catalog\nCrawl-delay: 2", "YangdoujiaoResearchBot/0.1");
  assert.equal(mayFetch(policy, new URL("https://example.edu/private/a")), false);
  assert.equal(mayFetch(policy, new URL("https://example.edu/private/catalog/a")), true);
  assert.equal(policy.crawlDelayMs, 2000);
});

test("blocks local and private network addresses", () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.1", "::1", "fd00::1", "::ffff:192.168.1.1"]) assert.equal(isPrivateAddress(address), true);
  assert.equal(isPrivateAddress("8.8.8.8"), false);
});
