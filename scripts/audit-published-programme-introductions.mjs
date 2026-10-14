import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const valueOf = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = new URL(valueOf("--base-url", "https://yangdoujiao.com"));
const output = path.resolve(valueOf("--output", ".data/audits/published-programme-introductions.json"));
const concurrency = Number(valueOf("--concurrency", "8"));

async function readJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "YangdoujiaoProgrammeIntroductionAudit/1.0" },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
const text = (value) => typeof value === "string" ? value.trim() : "";
const chineseCount = (value) => (text(value).match(/[\u3400-\u9fff]/g) || []).length;
const normalized = (value) => text(value).replace(/\s+/g, "").replace(/[，。；：、,.!?！？;:'"“”‘’()（）\-—]/g, "").toLowerCase();
const genericPatterns = [
  "具体课程名称、学分和考核方式以院校最新官方教学大纲为准",
  "帮助学生建立系统的专业知识、分析方法与实践能力",
  "专业介绍资料正在整理中",
  "请咨询顾问确认",
];
const suspiciousClaim = /(全球|世界|全国|马来西亚).{0,10}(第一|领先|顶尖)|就业率\s*\d|百分之\d|保证就业|官方认证|国际认证/;

function findings(programme) {
  const value = text(programme.descriptionZh);
  const flags = [];
  if (!value) flags.push("blank");
  if (value && chineseCount(value) < 8) flags.push("english_or_not_chinese");
  if (/\uFFFD|锟斤拷|Ã.|â€|ðŸ|\\u[0-9a-f]{4}/i.test(value)) flags.push("garbled");
  if (genericPatterns.some((pattern) => value.includes(pattern))) flags.push("historical_template");
  if (suspiciousClaim.test(value) && !text(programme.officialUrl)) flags.push("unverified_claim");
  if (value && value.length < 45) flags.push("too_short");
  return flags;
}

async function pageProgrammes(slug, page) {
  const url = new URL(`/api/v1/universities/${encodeURIComponent(slug)}/programmes`, baseUrl);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", "48");
  return readJson(url);
}
async function detail(slug, id) {
  return readJson(new URL(`/api/v1/universities/${encodeURIComponent(slug)}/programmes/${id}`, baseUrl));
}
async function mapLimit(items, limit, mapper) {
  const result = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      result[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return result;
}

const directoryUrl = new URL("/api/v1/universities/search", baseUrl);
directoryUrl.searchParams.set("page", "1");
directoryUrl.searchParams.set("size", "48");
const directory = await readJson(directoryUrl);
const summaries = [];
for (const university of directory.items || []) {
  const first = await pageProgrammes(university.slug, 1);
  const pages = [first];
  for (let page = 2; page <= first.totalPages; page++) pages.push(await pageProgrammes(university.slug, page));
  for (const programme of pages.flatMap((value) => value.items || [])) {
    summaries.push({ university, programme });
  }
}
const failures = [];
const records = (await mapLimit(summaries, concurrency, async ({ university, programme }) => {
  try {
    const current = await detail(university.slug, programme.id);
    return {
      universityId: university.id,
      universitySlug: university.slug,
      universityNameZh: university.nameZh,
      universityNameEn: university.nameEn,
      id: current.id,
      programmeCode: current.programmeCode,
      slug: current.slug,
      nameZh: current.nameZh,
      nameEn: current.nameEn,
      categoryCode: current.categoryCode,
      studyLevelCode: current.studyLevelCode,
      descriptionZh: current.descriptionZh,
      descriptionEn: current.descriptionEn,
      officialUrl: current.officialUrl,
      sourceCheckedAt: current.sourceCheckedAt,
      flags: findings(current),
    };
  } catch (error) {
    failures.push({ universitySlug: university.slug, id: programme.id, programmeCode: programme.programmeCode, message: String(error) });
    return null;
  }
})).filter(Boolean);

const duplicateGroups = new Map();
for (const record of records) {
  const key = normalized(record.descriptionZh);
  if (!key) continue;
  const group = duplicateGroups.get(key) || [];
  group.push(record);
  duplicateGroups.set(key, group);
}
for (const group of duplicateGroups.values()) {
  if (group.length < 2) continue;
  for (const record of group) if (!record.flags.includes("duplicate")) record.flags.push("duplicate");
}
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: baseUrl.origin,
  publishedUniversities: (directory.items || []).length,
  publishedProgrammes: summaries.length,
  auditedProgrammes: records.length,
  issueCounts: Object.fromEntries([...new Set(records.flatMap((record) => record.flags))].sort().map((flag) => [flag, records.filter((record) => record.flags.includes(flag)).length])),
  cleanProgrammes: records.filter((record) => record.flags.length === 0).length,
  duplicateGroups: [...duplicateGroups.values()].filter((group) => group.length > 1).map((group) => group.map((record) => record.programmeCode)),
  failures,
  records,
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ output, publishedUniversities: report.publishedUniversities, publishedProgrammes: report.publishedProgrammes, auditedProgrammes: report.auditedProgrammes, cleanProgrammes: report.cleanProgrammes, issueCounts: report.issueCounts, duplicateGroups: report.duplicateGroups.length, failures: failures.length }, null, 2));
