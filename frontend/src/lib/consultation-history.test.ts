import assert from "node:assert/strict";
import test from "node:test";

import { CONSULTATION_HISTORY_EVENT, readConsultationHistory, recordConsultation } from "./consultation-history.ts";

test("consultation history stores recent reference codes without duplicates", () => {
  let stored = "[]";
  const events: Event[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => stored,
        setItem: (_key: string, value: string) => { stored = value; },
      },
      dispatchEvent: (event: Event) => { events.push(event); return true; },
    },
  });
  const item = { referenceCode: "ENQ-1042", submittedAt: "2026-10-07T00:00:00.000Z", intendedSchool: "University of Malaya" };
  recordConsultation(item);
  recordConsultation({ ...item, intendedCourse: "Bachelor of Law" });
  assert.equal(readConsultationHistory().length, 1);
  assert.equal(readConsultationHistory()[0]?.intendedCourse, "Bachelor of Law");
  assert.equal(events.at(-1)?.type, CONSULTATION_HISTORY_EVENT);
});
