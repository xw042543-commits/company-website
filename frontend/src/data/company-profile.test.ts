import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const profileModule = await import("./company-profile.ts").catch(() => ({}));

type ProfileModule = {
  COMPANY_PROFILE: {
    legalNameZh: string;
    registrationNumber: string;
    malaysia: { email: string };
    responseTimeZh: string;
  };
  CHINA_ADVISERS: ReadonlyArray<{ nameZh: string; wechat: string; qrSrc: string }>;
};

test("publishes the approved company and adviser contact profile", () => {
  assert.ok("COMPANY_PROFILE" in profileModule, "company profile data is missing");
  assert.ok("CHINA_ADVISERS" in profileModule, "adviser contact data is missing");

  const { COMPANY_PROFILE, CHINA_ADVISERS } = profileModule as ProfileModule;
  assert.equal(COMPANY_PROFILE.legalNameZh, "洋豆角教育科技（山东）有限公司");
  assert.equal(COMPANY_PROFILE.registrationNumber, "91371700MADNR7DM05");
  assert.equal(COMPANY_PROFILE.malaysia.email, "bertram@staff.udajo.com");
  assert.equal(COMPANY_PROFILE.responseTimeZh, "1 个工作日内");
  assert.deepEqual(CHINA_ADVISERS.map(({ nameZh, wechat }) => [nameZh, wechat]), [
    ["杜老师", "udajo002"],
    ["高老师", "udajo005"],
    ["谢老师", "udajo006"],
  ]);
});

test("each adviser QR image resolves to a public asset", () => {
  assert.ok("CHINA_ADVISERS" in profileModule, "adviser contact data is missing");
  const { CHINA_ADVISERS } = profileModule as ProfileModule;
  const publicRoot = fileURLToPath(new URL("../../public/", import.meta.url));

  for (const adviser of CHINA_ADVISERS) {
    const path = `${publicRoot}${adviser.qrSrc.slice(1).replaceAll("/", "\\")}`;
    assert.equal(existsSync(path), true, `${adviser.nameZh} QR image is missing`);
  }
});
