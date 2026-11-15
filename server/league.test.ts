import test from "node:test";
import assert from "node:assert/strict";
import { weekId, zones } from "./league.js";

test("league weeks start on Monday in Tashkent time", () => {
  assert.equal(weekId(Date.UTC(2026, 10, 15, 18, 30)), "2026-11-09"); // Sunday 23:30 Tashkent
  assert.equal(weekId(Date.UTC(2026, 10, 15, 19, 30)), "2026-11-16"); // Monday 00:30 Tashkent
});
test("league zones promote top 20% and demote bottom 20%", () => {
  assert.deepEqual(zones(10, 1), { promote: 2, demote: 2 });
  assert.deepEqual(zones(10, 0), { promote: 2, demote: 0 });
  assert.deepEqual(zones(10, 5), { promote: 0, demote: 2 });
  assert.deepEqual(zones(2, 2), { promote: 0, demote: 0 });
});
