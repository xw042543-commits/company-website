import assert from "node:assert/strict";
import test from "node:test";

import { universityProfile } from "./university-profiles.ts";

test("ranking guidance is available in both Chinese and English", () => {
  const pending = universityProfile("uum");
  const branch = universityProfile("monash");

  assert.equal(pending.rankingZh, "最新排名资料正在审核");
  assert.equal(pending.rankingEn, "Latest ranking information under review");
  assert.equal(branch.rankingZh, "请参考莫纳什大学全球排名");
  assert.equal(branch.rankingEn, "Refer to Monash University's global ranking");
});
