import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const collectionRoot = path.resolve("../outputs/programme-collection-20261007");
const cachePath = path.join(collectionRoot, "programme-name-translations.json");
const outputRoot = path.join(collectionRoot, "postgres-import");
const outputPath = path.join(outputRoot, "update_programme_chinese_names.sql");

const cacheDocument = JSON.parse(await readFile(cachePath, "utf8"));
const manualTranslations: Record<string, string> = {
  "Bachelor of Advanced Science Honours": "高级理学学士（荣誉）",
  "Bachelor of Criminology Criminal Justice Law": "犯罪学与刑事司法/法学学士",
  "Bachelor of Psychological Science Honours": "心理科学学士（荣誉）",
  "Bachelor of Science": "理学学士",
  "Bachelor of Science Honours": "理学学士（荣誉）",
  "University Preparation Program": "大学预科课程",
};
const mergedTranslations = Object.fromEntries([
  ...Object.entries(cacheDocument.translations ?? {}).map(([name, item]: [string, any]) => [name, item?.zh]),
  ...Object.entries(manualTranslations),
]);
const translations = Object.entries(mergedTranslations)
  .map(([nameEn, nameZh]) => ({ nameEn: nameEn.trim(), nameZh: String(nameZh ?? "").trim() }))
  .filter((item) => item.nameEn && item.nameZh && /[\u3400-\u9fff]/u.test(item.nameZh))
  .sort((left, right) => left.nameEn.localeCompare(right.nameEn));

const values = translations
  .map(({ nameEn, nameZh }) => `    (${literal(nameEn)}, ${literal(nameZh)})`)
  .join(",\n");

const sql = `\\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE programme_name_translations (
    name_en text PRIMARY KEY,
    name_zh text NOT NULL
) ON COMMIT DROP;

INSERT INTO programme_name_translations (name_en, name_zh) VALUES
${values};

UPDATE programmes AS programme
SET name_zh = translation.name_zh,
    updated_at = CURRENT_TIMESTAMP
FROM programme_name_translations AS translation
WHERE NULLIF(BTRIM(programme.name_zh), '') IS NULL
  AND BTRIM(programme.name_en) = translation.name_en;

COMMIT;

SELECT COUNT(*) AS remaining_missing_chinese_names
FROM programmes
WHERE NULLIF(BTRIM(name_zh), '') IS NULL;
`;

await mkdir(outputRoot, { recursive: true });
await writeFile(outputPath, sql);
console.log(JSON.stringify({ translations: translations.length, outputPath }, null, 2));

function literal(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}
