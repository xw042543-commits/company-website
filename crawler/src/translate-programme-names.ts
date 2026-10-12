import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("../outputs/programme-collection-20261007");
const cachePath = path.join(root, "programme-name-translations.json");
const ignored = new Set(["scope.json", "programmes.json", "collection-progress.json", "programme-source-registry.json", "programme-name-translations.json", "programme_intakes.json", "programme_languages.json", "programme_fees.json", "programme_detail_sections.json", "programme_specialisations.json", "programme_careers.json", "programme_media.json", "programme_evidence.json"]);
const bundleFiles = (await readdir(root)).filter((name) => name.endsWith(".json") && !ignored.has(name));
const bundles: Array<{ file: string; document: any }> = [];
const names = new Set<string>();
for (const file of bundleFiles) {
  const document = JSON.parse(await readFile(path.join(root, file), "utf8"));
  if (!Array.isArray(document.programmes)) continue;
  bundles.push({ file, document });
  for (const programme of document.programmes) if (!programme.nameZh && programme.nameEn) names.add(programme.nameEn.trim());
}

let cache: Record<string, { zh: string; translatedAt: string; method: string }> = {};
try { cache = JSON.parse(await readFile(cachePath, "utf8")).translations ?? {}; } catch { /* first run */ }
const manualMappings = {
  "Maths in Schools Online: 7-10 V9.0": "学校数学在线课程：7–10 年级 V9.0",
  Design: "设计",
  Management: "管理学",
  Finance: "金融学",
  "Japanese and Linguistics MA (Hons)": "日语与语言学文学硕士（荣誉）",
  "Architecture MArch (Hons)": "建筑学硕士（荣誉）",
  "Accounting and Finance BSc (Dubai)": "会计与金融理学学士（迪拜校区）",
  "Bachelor of Computer Science (Artificial Intelligence) Part-Time": "计算机科学学士（人工智能，非全日制）",
  "Bachelor of Computer Science (Artificial Intelligence)": "计算机科学学士（人工智能）",
  "Bachelor of Computer Science - RMIT University": "计算机科学学士—皇家墨尔本理工大学",
  "Bachelor of Computer Science - Plan BP094P23 - RMIT University": "计算机科学学士—BP094P23 培养方案—皇家墨尔本理工大学",
};
for (const [name, zh] of Object.entries(manualMappings)) {
  cache[name] = { zh, translatedAt: new Date().toISOString(), method: "manual education terminology mapping" };
}
const pending = [...names].filter((name) => !cache[name]);
let cursor = 0;
let failures = 0;

async function worker(): Promise<void> {
  while (cursor < pending.length) {
    const name = pending[cursor++];
    try {
      const zh = normalise(await translate(name));
      if (!zh || zh === name || !/[\u3400-\u9fff]/u.test(zh)) throw new Error("translation is empty or unchanged");
      cache[name] = { zh, translatedAt: new Date().toISOString(), method: "Google Translate draft + education terminology normalisation" };
    } catch (error) {
      failures += 1;
      console.error(`FAILED ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (cursor % 50 === 0) {
      await saveCache();
      console.log(`translated ${Math.min(cursor, pending.length)}/${pending.length}`);
    }
    await wait(120);
  }
}

await Promise.all([worker(), worker(), worker()]);
await saveCache();
let updated = 0;
for (const { file, document } of bundles) {
  let changed = false;
  for (const programme of document.programmes) {
    const english = programme.nameEn?.trim();
    const item = english ? cache[english] : null;
    if (!programme.nameZh && item?.zh) { programme.nameZh = finalise(english, item.zh); updated += 1; changed = true; }
  }
  if (changed) {
    document.generatedAt = new Date().toISOString();
    document.nameTranslation = { translatedAt: document.generatedAt, method: "machine translation with education terminology normalisation", reviewStatus: "DRAFT" };
    await writeFile(path.join(root, file), `${JSON.stringify(document, null, 2)}\n`);
  }
}
console.log(JSON.stringify({ uniqueNames: names.size, cached: Object.keys(cache).length, pending: pending.length, failures, recordsUpdated: updated }, null, 2));

async function translate(value: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(value)}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(20000) });
    if (response.ok) {
      const data = await response.json();
      return (data?.[0] ?? []).map((item: any[]) => item?.[0] ?? "").join("").trim();
    }
    if ((response.status === 429 || response.status >= 500) && attempt < 4) { await wait(attempt * 1500); continue; }
    throw new Error(`HTTP ${response.status}`);
  }
  throw new Error("translation retries exhausted");
}

function normalise(value: string): string {
  return value
    .replace(/\bBachelor of Arts\b/gi, "文学学士")
    .replace(/\bBachelor of Science\b/gi, "理学学士")
    .replace(/\bMaster of Arts\b/gi, "文学硕士")
    .replace(/\bMaster of Science\b/gi, "理学硕士")
    .replace(/荣誉学士学位/g, "学士（荣誉）")
    .replace(/荣誉理学学士/g, "理学学士（荣誉）")
    .replace(/荣誉文学学士/g, "文学学士（荣誉）")
    .replace(/\s+/g, " ")
    .replace(/\s+([，。；：、（）])/g, "$1")
    .trim();
}
function finalise(english: string, value: string): string {
  const secondMajor = structuredSecondMajor(english);
  if (secondMajor) return secondMajor;
  let result = normalise(value)
    .replace(/\s*\(\s*(?:荣誉|优等|优秀|挂)\s*\)\s*$/g, "")
    .replace(/\s*（(?:优等|优秀)）\s*$/g, "")
    .replace(/\bMach\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const suffixes: Array<[RegExp, string]> = [
    [/\bBA\s*\(Hons\)$/i, "文学学士（荣誉）"], [/\bBA$/i, "文学学士"],
    [/\bBSc\s*\(Hons\)$/i, "理学学士（荣誉）"], [/\bBSc$/i, "理学学士"],
    [/\bBEng\s*\(Hons\)$/i, "工程学学士（荣誉）"], [/\bBEng$/i, "工程学学士"],
    [/\bMA\s*\(Hons\)$/i, "文学硕士（荣誉）"], [/\bMA$/i, "文学硕士"],
    [/\bMSc$/i, "理学硕士"], [/\bMEng\s*\(Hons\)$/i, "工程学硕士（荣誉）"], [/\bMEng$/i, "工程学硕士"],
    [/\bMArch\s*\(Hons\)$/i, "建筑学硕士（荣誉）"], [/\bMArch$/i, "建筑学硕士"],
    [/\bMMath\s*\(Hons\)$/i, "数学硕士（荣誉）"], [/\bMPhys\s*\(Hons\)$/i, "物理学硕士（荣誉）"],
    [/\bMChem\s*\(Hons\)$/i, "化学硕士（荣誉）"], [/\bMSci\s*\(Hons\)$/i, "理学硕士（荣誉）"],
  ];
  for (const [pattern, qualification] of suffixes) {
    if (!pattern.test(english)) continue;
    result = result.replace(/(?:文学|理学|工程学|建筑学|数学|物理学|化学)?(?:学士|硕士)(?:（荣誉）)?\s*$/g, "").trim();
    if (!result.endsWith(qualification)) result = `${result}${qualification}`;
    break;
  }
  return result.replace(/\s+/g, " ").trim();
}
function structuredSecondMajor(english: string): string | null {
  const match = english.replace(/[\u200b\u200c\u200d\ufeff]/g, "").match(/^(Bachelor of (?:Engineering|Science|Accountancy|Business|Computing)(?: \(Hons\))?(?: in)? )(.+?) with (?:a )?Second Major in (.+)$/i);
  if (!match) return null;
  const prefix = match[1];
  const subject = academicPhrase(match[2]);
  const second = academicPhrase(match[3]);
  const qualification = /Engineering/i.test(prefix) ? `工学学士${/Hons/i.test(prefix) ? "（荣誉）" : ""}`
    : /Science/i.test(prefix) ? `理学学士${/Hons/i.test(prefix) ? "（荣誉）" : ""}`
    : /Accountancy/i.test(prefix) ? "会计学学士"
    : /Business/i.test(prefix) ? "商学学士"
    : `计算机学学士${/Hons/i.test(prefix) ? "（荣誉）" : ""}`;
  return `${subject}${qualification}（第二专业：${second}）`;
}
function academicPhrase(value: string): string {
  const mappings: Array<[RegExp, string]> = [
    [/Business \(International Trading\)/gi, "商业（国际贸易）"], [/Chemical (?:&|and) Biomolecular Engineering/gi, "化学与生物分子工程"],
    [/Electrical (?:&|and) Electronic Engineering/gi, "电气与电子工程"], [/Environmental Earth Systems Science/gi, "环境地球系统科学"],
    [/Information Engineering and Media \(IEM\)/gi, "信息工程与媒体"], [/Chemistry and Biological Chemistry/gi, "化学与生物化学"],
    [/Food Science and Technology/gi, "食品科学与技术"], [/Society (?:&|and) Urban Systems/gi, "社会与城市系统"],
    [/Aerospace Engineering/gi, "航空航天工程"], [/Civil Engineering/gi, "土木工程"], [/Environmental Engineering/gi, "环境工程"],
    [/Mechanical Engineering/gi, "机械工程"], [/Pharmaceutical Engineering/gi, "制药工程"], [/Biological Sciences/gi, "生物科学"],
    [/Bioengineering/gi, "生物工程"], [/Computer Engineering/gi, "计算机工程"], [/Computer Science/gi, "计算机科学"],
    [/Data Analytics/gi, "数据分析"], [/Future Foods/gi, "未来食品"], [/Environmental Science/gi, "环境科学"],
    [/Entrepreneurship/gi, "创业"], [/Sustainability/gi, "可持续发展"], [/Robotics/gi, "机器人学"], [/Business/gi, "商业"],
  ];
  let result = value;
  for (const [pattern, replacement] of mappings) result = result.replace(pattern, replacement);
  return result.trim();
}
async function saveCache(): Promise<void> { await writeFile(cachePath, `${JSON.stringify({ generatedAt: new Date().toISOString(), sourceLanguage: "en", targetLanguage: "zh-CN", status: "DRAFT", translations: cache }, null, 2)}\n`); }
function wait(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }
