import assert from "node:assert/strict";
import test from "node:test";

import * as filterOptionsApi from "./filter-options-api.ts";

type Parser = (payload: unknown) => unknown;
type Requester = (baseUrl: string | undefined, request?: typeof fetch) => Promise<unknown>;

function parseOptions(payload: unknown): unknown {
  const candidate = Reflect.get(filterOptionsApi, "parseFilterOptions");
  return typeof candidate === "function" ? (candidate as Parser)(payload) : undefined;
}

async function requestOptions(baseUrl: string | undefined, request?: typeof fetch): Promise<unknown> {
  const candidate = Reflect.get(filterOptionsApi, "getFilterOptions");
  return typeof candidate === "function"
    ? (candidate as Requester)(baseUrl, request)
    : undefined;
}

const validOptions = {
  countries: [{ code: "MY", nameZh: "马来西亚", nameEn: "Malaysia" }],
  subjectCategories: [{ code: "COMPUTING", nameZh: "计算机", nameEn: "Computing" }],
  studyLevels: [{ code: "BACHELOR", nameZh: "本科", nameEn: "Bachelor's" }],
  courseModes: [{ code: "ON_CAMPUS", nameZh: "校内授课", nameEn: "On campus" }],
  languages: [{ code: "EN", nameZh: "英语", nameEn: "English" }],
};

test("accepts a complete filter-options response", () => {
  assert.deepEqual(parseOptions(validOptions), validOptions);
});

test("rejects incomplete or malformed filter options", () => {
  assert.equal(parseOptions({ countries: [] }), null);
  assert.equal(parseOptions({ ...validOptions, languages: [{ code: "", nameZh: "", nameEn: "" }] }), null);
});

test("requests the V1 catalog filter-options endpoint", async () => {
  let requestedUrl = "";
  const request = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(validOptions), { status: 200 });
  }) as typeof fetch;

  assert.deepEqual(
    await requestOptions("http://localhost:8080", request),
    { status: "ready", options: validOptions },
  );
  assert.equal(requestedUrl, "http://localhost:8080/api/v1/catalog/filter-options");
});

test("returns an error state for unavailable or malformed filter options", async () => {
  const unavailable = (async () => new Response(null, { status: 503 })) as typeof fetch;
  const malformed = (async () => new Response(JSON.stringify({}), { status: 200 })) as typeof fetch;

  assert.deepEqual(await requestOptions("http://localhost:8080", unavailable), { status: "error" });
  assert.deepEqual(await requestOptions("http://localhost:8080", malformed), { status: "error" });
  assert.deepEqual(await requestOptions(undefined, malformed), { status: "error" });
});
