import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "./config.ts";
import { extractProgrammes, extractUniversity, mergeProgrammeCandidates } from "./extract.ts";
import type { PageSnapshot, ReviewBundle } from "./types.ts";

const args = process.argv.slice(2);
const valueOf = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const configPath = valueOf("--config");
const bundlePath = valueOf("--bundle");
const outputPath = valueOf("--output");
if (!configPath || !bundlePath) throw new Error("用法：node src/reprocess.ts --config <配置> --bundle <review-bundle.json> [--output <输出文件>]");

const config = await loadConfig(path.resolve(configPath));
const absoluteBundle = path.resolve(bundlePath);
const original = JSON.parse(await readFile(absoluteBundle, "utf8")) as ReviewBundle;
const source = config.sources.find((item) => item.sourceKey === original.sourceKey);
if (!source) throw new Error(`配置中没有来源：${original.sourceKey}`);
const root = path.dirname(absoluteBundle);
const pages: PageSnapshot[] = [];
for (const page of original.pages) {
  pages.push({ ...page, html: await readFile(path.join(root, page.snapshotFile), "utf8") });
}
const programmes = mergeProgrammeCandidates(pages.flatMap((page) => extractProgrammes(page, source)));
const bundle: ReviewBundle = {
  ...original,
  generatedAt: new Date().toISOString(),
  university: pages[0] ? extractUniversity(pages[0], source) : null,
  programmes,
};
const destination = path.resolve(outputPath ?? path.join(root, "review-bundle.reprocessed.json"));
await writeFile(destination, `${JSON.stringify(bundle, null, 2)}\n`);
console.log(JSON.stringify({ output: destination, pages: pages.length, programmes: programmes.length, warnings: bundle.warnings.length }));
