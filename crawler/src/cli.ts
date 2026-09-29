import path from "node:path";
import { crawlAll } from "./crawl.ts";
import { loadConfig } from "./config.ts";

const args = process.argv.slice(2);
const configIndex = args.indexOf("--config"); const outputIndex = args.indexOf("--output");
if (configIndex < 0 || !args[configIndex + 1]) {
  console.error("用法：npm run crawl -- --config <来源配置.json> [--output <输出目录>]");
  process.exitCode = 2;
} else {
  const configPath = path.resolve(args[configIndex + 1]);
  const outputPath = path.resolve(outputIndex >= 0 && args[outputIndex + 1] ? args[outputIndex + 1] : ".data/runs");
  try {
    const bundles = await crawlAll(await loadConfig(configPath), outputPath);
    for (const bundle of bundles) console.log(`${bundle.sourceName}：${bundle.pages.length} 页，${bundle.programmes.length} 个待审核专业，${bundle.warnings.length} 条警告`);
    console.log(`结果目录：${outputPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1;
  }
}
