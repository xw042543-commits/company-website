import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("../outputs/programme-collection-20261007");
const protectedNames = new Map([
  ["Bachelor of Science", "理学学士"],
  ["Bachelor of Advanced Science Honours", "高级理学学士（荣誉）"],
  ["University Preparation Program", "大学预科课程"],
  ["Bachelor of Science Honours", "理学学士（荣誉）"],
  ["Bachelor of Psychological Science Honours", "心理科学学士（荣誉）"],
  ["Bachelor of Criminology Criminal Justice Law", "犯罪学与刑事司法学士／法学学士"],
]);
let cleared = 0;
for (const file of await readdir(root)) {
  if (!file.endsWith(".json")) continue;
  const filePath = path.join(root, file);
  let document: any;
  try { document = JSON.parse(await readFile(filePath, "utf8")); } catch { continue; }
  if (!document.nameTranslation || !Array.isArray(document.programmes)) continue;
  for (const programme of document.programmes) {
    const verified = protectedNames.get(programme.nameEn);
    if (verified) programme.nameZh = verified;
    else if (programme.nameZh) { programme.nameZh = null; cleared += 1; }
  }
  delete document.nameTranslation;
  await writeFile(filePath, `${JSON.stringify(document, null, 2)}\n`);
}
console.log(JSON.stringify({ cleared, protected: protectedNames.size }));
