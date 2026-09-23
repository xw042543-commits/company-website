import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  applicationLevelLabel,
  companyProfile,
  contactTelephoneHref,
  publicAdvisers,
} from "./company-profile.ts";

test("uses the approved company identity and canonical domain", () => {
  assert.equal(companyProfile.brandNameZh, "洋豆角");
  assert.equal(companyProfile.brandNameEn, "UDAJO");
  assert.equal(companyProfile.legalNameZh, "洋豆角教育科技（山东）有限公司");
  assert.equal(companyProfile.registrationNumber, "91371700MADNR7DM05");
  assert.equal(companyProfile.domain, "yangdoujiao.com");
});

test("describes qualification level as the level the student plans to apply for", () => {
  assert.deepEqual(applicationLevelLabel, {
    zh: "计划申请的学历层次",
    en: "Level you plan to apply for",
  });
});

test("publishes one Malaysia contact and three China advisers", () => {
  assert.equal(publicAdvisers.length, 4);
  assert.equal(publicAdvisers.filter((adviser) => adviser.region === "MY").length, 1);
  assert.equal(publicAdvisers.filter((adviser) => adviser.region === "CN").length, 3);
  assert.equal(companyProfile.responseTime.zh, "1 个工作日内");
});

test("uses international dialing links while preserving local display numbers", () => {
  const malaysiaAdviser = publicAdvisers.find((adviser) => adviser.region === "MY")!;
  const chinaAdviser = publicAdvisers.find((adviser) => adviser.id === "du")!;

  assert.equal(malaysiaAdviser.phone, "01136514236");
  assert.equal(contactTelephoneHref(malaysiaAdviser), "tel:+601136514236");
  assert.equal(chinaAdviser.phone, "15589983056");
  assert.equal(contactTelephoneHref(chinaAdviser), "tel:+8615589983056");
});

test("every China adviser has a supplied QR image in the public directory", () => {
  const chinaAdvisers = publicAdvisers.filter((adviser) => adviser.region === "CN");
  assert.equal(chinaAdvisers.length, 3);
  for (const adviser of chinaAdvisers) {
    assert.ok(adviser.wechatId);
    assert.ok(adviser.qrImage);
    const publicPath = path.join(process.cwd(), "public", adviser.qrImage!.replace(/^\//, ""));
    assert.equal(existsSync(publicPath), true, publicPath);
  }
});

test("keeps each supplied QR image's intrinsic size to prevent layout shift", () => {
  assert.deepEqual(
    publicAdvisers.filter((adviser) => adviser.region === "CN")
      .map((adviser) => [adviser.id, adviser.qrWidth, adviser.qrHeight]),
    [["du", 345, 473], ["gao", 341, 468], ["xie", 324, 483]],
  );
});
