import assert from "node:assert/strict";
import test from "node:test";

import * as routes from "./programme-routes.ts";

test("builds canonical bilingual programme detail paths from the real identifier", () => {
  const build = Reflect.get(routes, "programmeDetailPath");
  assert.equal(typeof build, "function");
  assert.equal(
    build("zh", "segi-university", "584"),
    "/zh/universities/segi-university/programmes/584",
  );
  assert.equal(
    build("en", "segi-university", "segi-bachelor-001"),
    "/en/universities/segi-university/programmes/segi-bachelor-001",
  );
});

test("encodes every dynamic programme path segment", () => {
  const build = Reflect.get(routes, "programmeDetailPath");
  assert.equal(
    build("zh", "school/branch", "course #1"),
    "/zh/universities/school%2Fbranch/programmes/course%20%231",
  );
});
