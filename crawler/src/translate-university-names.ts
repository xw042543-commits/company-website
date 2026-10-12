import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("../outputs/four-regions-universities-20261006");
const jsonPath = path.join(output, "universities.json");
const document = JSON.parse(await readFile(jsonPath, "utf8"));

const names: Record<string, string> = {
  "imperial-college-london": "帝国理工学院",
  "university-of-oxford": "牛津大学",
  "university-of-cambridge": "剑桥大学",
  "university-college-london": "伦敦大学学院（UCL）",
  "university-of-edinburgh": "爱丁堡大学",
  "kings-college-london": "伦敦国王学院",
  "university-of-manchester": "曼彻斯特大学",
  "university-of-bristol": "布里斯托大学",
  "london-school-of-economics": "伦敦政治经济学院（LSE）",
  "university-of-warwick": "华威大学",
  "university-of-birmingham": "伯明翰大学",
  "university-of-glasgow": "格拉斯哥大学",
  "university-of-southampton": "南安普顿大学",
  "university-of-leeds": "利兹大学",
  "university-of-sheffield": "谢菲尔德大学",
  "durham-university": "杜伦大学",
  "university-of-nottingham": "诺丁汉大学",
  "university-of-st-andrews": "圣安德鲁斯大学",
  "queen-mary-university-of-london": "伦敦玛丽女王大学",
  "university-of-bath": "巴斯大学",
  "massachusetts-institute-of-technology": "麻省理工学院（MIT）",
  "stanford-university": "斯坦福大学",
  "harvard-university": "哈佛大学",
  "california-institute-of-technology": "加州理工学院（Caltech）",
  "university-of-pennsylvania": "宾夕法尼亚大学",
  "cornell-university": "康奈尔大学",
  "yale-university": "耶鲁大学",
  "johns-hopkins-university": "约翰斯·霍普金斯大学",
  "university-of-california-berkeley": "加州大学伯克利分校（UC Berkeley）",
  "university-of-chicago": "芝加哥大学",
  "princeton-university": "普林斯顿大学",
  "columbia-university": "哥伦比亚大学",
  "northwestern-university": "西北大学",
  "university-of-california-los-angeles": "加州大学洛杉矶分校（UCLA）",
  "university-of-michigan-ann-arbor": "密歇根大学安娜堡分校",
  "carnegie-mellon-university": "卡内基梅隆大学",
  "new-york-university": "纽约大学（NYU）",
  "brown-university": "布朗大学",
  "duke-university": "杜克大学",
  "university-of-texas-at-austin": "得克萨斯大学奥斯汀分校",
  "unsw-sydney": "新南威尔士大学（UNSW Sydney）",
  "university-of-melbourne": "墨尔本大学",
  "university-of-sydney": "悉尼大学",
  "australian-national-university": "澳大利亚国立大学（ANU）",
  "monash-university": "蒙纳士大学",
  "university-of-queensland": "昆士兰大学",
  "university-of-western-australia": "西澳大学",
  "adelaide-university": "阿德莱德大学",
  "university-of-technology-sydney": "悉尼科技大学（UTS）",
  "rmit-university": "皇家墨尔本理工大学（RMIT）",
  "macquarie-university": "麦考瑞大学",
  "curtin-university": "科廷大学",
  "university-of-wollongong": "伍伦贡大学",
  "deakin-university": "迪肯大学",
  "griffith-university": "格里菲斯大学",
  "queensland-university-of-technology": "昆士兰科技大学（QUT）",
  "la-trobe-university": "拉筹伯大学",
  "university-of-newcastle": "纽卡斯尔大学",
  "swinburne-university-of-technology": "斯威本科技大学",
  "university-of-tasmania": "塔斯马尼亚大学",
  "national-university-of-singapore": "新加坡国立大学（NUS）",
  "nanyang-technological-university": "南洋理工大学（NTU）",
  "singapore-university-of-technology-and-design": "新加坡科技设计大学（SUTD）",
  "singapore-management-university": "新加坡管理大学（SMU）",
  "singapore-institute-of-technology": "新加坡理工大学（SIT）",
  "singapore-university-of-social-sciences": "新加坡社科大学（SUSS）",
  "university-of-the-arts-singapore": "新加坡艺术大学（UAS）",
  "insead-asia-campus": "欧洲工商管理学院亚洲校区（INSEAD）",
  "essec-asia-pacific": "埃塞克商学院亚太校区（ESSEC）",
  "tum-asia": "慕尼黑工业大学亚洲校区（TUM Asia）",
  "sp-jain-singapore": "SP Jain全球管理学院新加坡校区",
  "digipen-singapore": "迪吉彭理工学院新加坡校区（DigiPen）",
  "sorbonne-assas-asia": "索邦—阿萨斯国际法学院亚洲校区",
  "ehl-campus-singapore": "洛桑酒店管理学院新加坡校区（EHL）",
  "duke-nus-medical-school": "杜克—新加坡国立大学医学院（Duke-NUS）",
  "james-cook-university-singapore": "詹姆斯库克大学新加坡校区（JCU）",
  "curtin-singapore": "科廷大学新加坡校区",
  "sim-global-education": "新加坡管理学院（SIM）",
  "kaplan-singapore": "新加坡楷博高等教育学院（Kaplan）",
  "psb-academy": "新加坡PSB学院（PSB Academy）",
};

const missingMappings: string[] = [];
let updated = 0;
for (const record of document.records ?? []) {
  const translated = names[record.sourceKey];
  if (!translated) {
    missingMappings.push(record.sourceKey);
    continue;
  }
  if (record.nameZh !== translated) {
    record.nameZh = translated;
    updated += 1;
  }
}
if (missingMappings.length) throw new Error(`缺少中文校名映射：${missingMappings.join(", ")}`);

document.generatedAt = new Date().toISOString();
document.nameTranslation = {
  translatedAt: document.generatedAt,
  method: "curated Chinese institution name mapping",
  reviewStatus: "DRAFT",
};
await writeFile(jsonPath, `${JSON.stringify(document, null, 2)}\n`);

const rows: unknown[][] = [
  ["region", "selection_rank", "source_key", "name_en", "name_zh", "country", "city", "institution_type_raw", "official_website", "description_en", "ranking_authority", "ranking_year", "ranking_url", "crawl_status", "source_checked_at", "logo_urls", "crest_urls", "image_urls", "warnings"],
  ...(document.records ?? []).map((item: any) => [
    item.region, item.selectionRank, item.sourceKey, item.nameEn, item.nameZh, item.countryRaw, item.cityRaw,
    item.institutionTypeRaw, item.officialWebsite, item.descriptionEn, item.rankingAuthority, item.rankingYear,
    item.rankingUrl, item.crawlStatus, item.sourceCheckedAt,
    item.media?.filter((media: any) => media.kind === "LOGO").map((media: any) => media.assetUrl).join(" | "),
    item.media?.filter((media: any) => media.kind === "CREST").map((media: any) => media.assetUrl).join(" | "),
    item.media?.filter((media: any) => media.kind === "UNIVERSITY_IMAGE").map((media: any) => media.assetUrl).join(" | "),
    item.warnings?.join(" | "),
  ]),
];
await writeFile(path.join(output, "universities.csv"), csv(rows));
console.log(JSON.stringify({ records: document.records.length, updated, missingMappings: missingMappings.length }, null, 2));

function csv(rows: unknown[][]): string {
  return `${rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n")}\n`;
}
