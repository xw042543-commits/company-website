import assert from "node:assert/strict";
import test from "node:test";

let consultationApi: Record<string, unknown> = {};
try {
  consultationApi = await import("./consultation-api.ts");
} catch {
  // The first TDD run intentionally executes before the implementation exists.
}

type SubmitConsultation = (
  baseUrl: string | undefined,
  body: Record<string, unknown>,
  request: typeof fetch,
) => Promise<unknown>;

const submission = {
  name: "Wang Xin",
  contact: "wx-123",
  intendedSchool: "University of Malaya",
  intendedCourse: "Computer Science",
  qualification: "bachelor",
  notes: null,
  locale: "zh",
  privacyConsent: true,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("submits a consented enquiry with CSRF protection", async () => {
  const submit = consultationApi.submitConsultation as SubmitConsultation | undefined;
  assert.equal(typeof submit, "function");
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const responses = [
    json({ headerName: "X-XSRF-TOKEN", token: "csrf-token" }),
    json({ referenceCode: "23d6d9b5-7a63-45dc-aab1-8709aa9d27d5", submittedAt: "2026-09-30T02:00:00Z" }, 201),
  ];
  const request = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return responses.shift() ?? new Response(null, { status: 500 });
  }) as typeof fetch;

  assert.deepEqual(await submit?.("http://localhost:8080", submission, request), {
    status: "submitted",
    referenceCode: "23d6d9b5-7a63-45dc-aab1-8709aa9d27d5",
    submittedAt: "2026-09-30T02:00:00Z",
  });
  assert.equal(calls[0].url, "http://localhost:8080/api/v1/auth/csrf");
  assert.equal(calls[1].url, "http://localhost:8080/api/v1/consultations");
  assert.equal(calls[1].init?.method, "POST");
  assert.equal(calls[1].init?.credentials, "include");
  assert.equal(new Headers(calls[1].init?.headers).get("X-XSRF-TOKEN"), "csrf-token");
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), submission);
});

test("maps unavailable and rate-limited enquiry responses", async () => {
  const submit = consultationApi.submitConsultation as SubmitConsultation | undefined;
  assert.equal(typeof submit, "function");
  const requestFor = (status: number) => {
    const responses = [json({ headerName: "X-XSRF-TOKEN", token: "csrf-token" }), json({}, status)];
    return (async () => responses.shift() ?? new Response(null, { status: 500 })) as typeof fetch;
  };
  assert.deepEqual(await submit?.("http://localhost:8080", submission, requestFor(503)), { status: "unavailable" });
  assert.deepEqual(await submit?.("http://localhost:8080", submission, requestFor(429)), { status: "rate-limited" });
  assert.deepEqual(await submit?.("http://localhost:8080", submission, requestFor(400)), { status: "validation-error" });
});
