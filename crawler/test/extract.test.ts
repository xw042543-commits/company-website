import assert from "node:assert/strict";
import test from "node:test";
import { extractProgrammes, extractUniversity } from "../src/extract.ts";
import { isPrivateAddress } from "../src/network.ts";
import { mayFetch, parseRobots } from "../src/robots.ts";
import { extractOfficialCourseTitles, validateOfficialCurriculum } from "../src/curriculum.ts";
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

test("deduplicates structured and ordinary candidates by canonical official URL", () => {
  const taylors = { ...source, sourceKey: "taylors-university" };
  const detailUrl = "https://example.edu/en/study/explore-all-programmes/computing/undergraduate/bachelor-of-computing.html";
  const listing = { ...page, html: `
    <script type="application/ld+json">{"@type":"Course","name":"Bachelor of Computing","url":"${detailUrl}?source=listing","timeToComplete":"3 years"}</script>
    <a href="${detailUrl}#overview"><h4>Bachelor of Computing</h4><p>Official card description.</p></a>` };
  const programmes = extractProgrammes(listing, taylors);
  assert.equal(programmes.length, 1);
  assert.equal(programmes[0].durationDisplay, "3 years");
  assert.equal(programmes[0].descriptionEn, "Official card description.");
});

test("extracts Taylor's official detail sections and international fee", () => {
  const taylors = { ...source, sourceKey: "taylors-university" };
  const detail = { ...page,
    url: "https://example.edu/en/study/explore-all-programmes/computing/undergraduate/bachelor-of-computing.html",
    title: "Bachelor of Computing",
    html: `<script type="application/ld+json">{"@type":"Course","name":"Bachelor of Computing","url":"https://example.edu/en/study/explore-all-programmes/computing/undergraduate/bachelor-of-computing.html","offers":{"price":"120000","priceCurrency":"MYR"}}</script>
      <section id="overview"><h3>Overview</h3><p>Duration</p><h5>3 Years, Full time</h5><p>Fees</p><h5>MYR 120,000 (Local)</h5><h5>USD 35,000 (International)</h5></section>
      <section id="programme-structure"><h3>Programme Structure</h3><ul><li>Programming</li><li>Data Structures</li></ul></section>
      <section id="entry-requirements"><h3>Entry Requirements</h3><p>A-Level: BBC</p></section>
      <section id="future-careers"><h3>Future Careers</h3><ul><li>Software Engineer</li></ul></section>` };
  const [programme] = extractProgrammes(detail, taylors);
  assert.equal(programme.durationMonths, 36);
  assert.equal(programme.tuition.min, 35000);
  assert.equal(programme.tuition.currency, "USD");
  assert.equal(programme.tuition.display, "USD 35,000 (International)");
  assert.match(programme.sections.find((section) => section.type === "CURRICULUM")?.bodyRaw ?? "", /Programming\nData Structures/);
});

test("keeps only official course titles from mixed Taylor curriculum markup", () => {
  assert.deepEqual(extractOfficialCourseTitles(`
    <p>Programme introduction and description.</p>
    <p>• Database Systems</p><p>• Data Structures and Algorithms</p>
    <p>Note: All information is subject to change.</p>
    <a href="#entry-requirements">NEXT: ENTRY REQUIREMENTS</a>
  `), ["Database Systems", "Data Structures and Algorithms"]);
});

test("keeps leaf UM modules and excludes selection instructions and admissions text", () => {
  assert.deepEqual(extractOfficialCourseTitles(`
    <ol><li>Fundamentals of Programming</li><li>Choose 2 electives:<ol>
      <li>Machine Learning</li><li>Computer Vision</li>
    </ol></li></ol>
    <p>Minimum average of 65%</p>
  `), ["Fundamentals of Programming", "Machine Learning", "Computer Vision"]);
});

test("rejects curriculum bodies contaminated with requirements or percentages", () => {
  assert.throws(() => validateOfficialCurriculum("Programming\nMinimum average of 65%"), /非课程标题/);
  assert.throws(() => validateOfficialCurriculum("Programming\nKursus Elektif: Pilih satu kursus sahaja"), /非课程标题/);
  assert.throws(() => validateOfficialCurriculum("Programming\nCore Elective (Choose 1)"), /非课程标题/);
  assert.throws(() => validateOfficialCurriculum("Programming\n7. Elective Courses: Faculty Open Elective"), /非课程标题/);
  assert.deepEqual(validateOfficialCurriculum("Programming\nData Structures"), ["Programming", "Data Structures"]);
  assert.deepEqual(validateOfficialCurriculum("1. Programming\n2. Data Structures"), ["Programming", "Data Structures"]);
  assert.deepEqual(validateOfficialCurriculum("Elective Courses: Faculty Course - Arabic Language for Health and Sports"), ["Arabic Language for Health and Sports"]);
  assert.deepEqual(validateOfficialCurriculum("Elective University Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect"), ["Thinking Matters: Mind and Intellect"]);
  assert.throws(() => validateOfficialCurriculum("Elective Course 1"), /非课程标题/);
  assert.throws(() => validateOfficialCurriculum("GQX0056 (KIAR) Integrity And"), /非课程标题/);
  assert.deepEqual(validateOfficialCurriculum("Software Requirements Engineering"), ["Software Requirements Engineering"]);
});

test("extracts UM faculty course cards and keeps the faculty as raw classification", () => {
  const um = { ...source, sourceKey: "university-of-malaya" };
  const listing = { ...page, html: `<li class="my-bc-item my-bc-active"><a href="faculty-of-computer-science"><i></i>Faculty of Computer Science</a></li><div class="course-card coursework" data-mode="fulltime"><a href="bachelor-of-computer-science-data-science">Bachelor of Computer Science (Data Science)</a></div>` };
  const [programme] = extractProgrammes(listing, um);
  assert.equal(programme.nameEn, "Bachelor of Computer Science (Data Science)");
  assert.equal(programme.subjectCategoryRaw, "Faculty of Computer Science");
  assert.equal(programme.subjectCategoryCode, null); assert.equal(programme.courseModeRaw, null);
});

test("extracts reviewed UM detail fields with official evidence", () => {
  const um = { ...source, sourceKey: "university-of-malaya" };
  const detail = { ...page, url: "https://example.edu/bachelor-of-computing", html: `
    <h3><strong>BACHELOR OF COMPUTING</strong></h3>
    <h4 class="title-2">Programme Overview</h4><div><p>Official overview.</p><p><strong>Duration: 3.5 Years (7 Semesters), Full time (Coursework)</strong></p></div>
    <h4 class="title-2">Programme Structure</h4><div><ol><li>Programming Fundamentals</li><li>Data Structures</li></ol></div>
    <h4 class="title-2">Career Prospects</h4><div><p>Software Engineer</p></div>
    <h4 class="title-2">Tuition Fee</h4><div><h4>Local</h4><p>RM 10,000</p><h4>International</h4><p>RM 70,000</p></div>
    <h4 class="title-2">Intake</h4><div><p>October Intake</p></div>
    <h4 class="title-2">Entry Requirement</h4><div>Local requirement<!-- INTERNATIONAL --><div id="info2"><h5>Senior High School Certificate</h5><ul><li>Minimum average of 65%</li></ul></div></div>
    <h4 class="title-2">English Language Requirements</h4><div><div id="english1">Local English</div><div id="english2"><ul><li>IELTS 5.5</li></ul></div></div>
    </section>`,
  };
  const [programme] = extractProgrammes(detail, um);
  assert.equal(programme.nameEn, "BACHELOR OF COMPUTING");
  assert.equal(programme.descriptionEn, "Official overview.");
  assert.equal(programme.durationMonths, 42);
  assert.equal(programme.tuition.min, 70000);
  assert.equal(programme.tuition.currency, "MYR");
  assert.equal(programme.officialUrl, detail.url);
  assert.match(programme.sections.find((section) => section.type === "CURRICULUM")?.bodyRaw ?? "", /Programming Fundamentals\nData Structures/);
  assert.match(programme.sections.find((section) => section.type === "ADMISSIONS")?.bodyRaw ?? "", /Minimum average of 65%[\s\S]*IELTS 5\.5/);
  assert.ok(programme.evidence.every((item) => item.sourceUrl === detail.url));
});

test("separates UM curriculum embedded in the programme overview", () => {
  const um = { ...source, sourceKey: "university-of-malaya" };
  const detail = { ...page, url: "https://example.edu/bachelor-of-arts", html: `
    <h3><strong>BACHELOR OF ARTS</strong></h3>
    <h4 class="title-2">Programme Overview</h4><div>
      <p>Official overview text.</p><div>Year 1 Year 2 Year 3</div><ul><li>Research Methods</li><li>Industrial Training</li></ul>
      <p><strong>Duration: 3 Years, Full time (Coursework)</strong></p>
    </div>
    <h4 class="title-2">Career Prospects</h4><p>Researcher</p>
    </section>`,
  };
  const [programme] = extractProgrammes(detail, um);
  assert.equal(programme.descriptionEn, "Official overview text.");
  assert.equal(programme.sections.find((section) => section.type === "CURRICULUM")?.bodyRaw, "Research Methods\nIndustrial Training");
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
