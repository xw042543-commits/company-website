import path from "node:path";
import { crawlAll } from "./crawl.ts";
import { loadConfig } from "./config.ts";

const args = process.argv.slice(2);
const configIndex = args.indexOf("--config"); const outputIndex = args.indexOf("--output"); const sourceIndex = args.indexOf("--source");
if (configIndex < 0 || !args[configIndex + 1]) {
  console.error("用法：npm run crawl -- --config <来源配置.json> [--source <sourceKey>] [--output <输出目录>]");
  process.exitCode = 2;
} else {
  const configPath = path.resolve(args[configIndex + 1]);
  const outputPath = path.resolve(outputIndex >= 0 && args[outputIndex + 1] ? args[outputIndex + 1] : ".data/runs");
  try {
    const config = await loadConfig(configPath);
    const sourceKey = sourceIndex >= 0 ? args[sourceIndex + 1] : undefined;
    const selected = sourceKey ? config.sources.filter((source) => source.sourceKey === sourceKey) : config.sources;
    if (sourceKey && selected.length === 0) throw new Error(`配置中没有来源：${sourceKey}`);
    const bundles = await crawlAll({ ...config, sources: selected }, outputPath);
    for (const bundle of bundles) console.log(`${bundle.sourceName}：${bundle.pages.length} 页，${bundle.programmes.length} 个待审核专业，${bundle.warnings.length} 条警告`);
    console.log(`结果目录：${outputPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1;
  }
}
