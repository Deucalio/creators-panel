import { test } from "node:test";
import assert from "node:assert/strict";
import { pickMembership } from "@/lib/membership-choice";

const pending = { id: "store-a", status: "PENDING" };
const active = { id: "store-b", status: "ACTIVE" };
const memberships = [pending, active];

test("the program the link names wins, whatever its status", () => {
  assert.equal(pickMembership(memberships, "store-a"), pending);
});

test("no program named, or one that no longer exists, falls back to the first active one", () => {
  assert.equal(pickMembership(memberships, undefined), active);
  assert.equal(pickMembership(memberships, "deleted-program"), active);
});

test("with nothing active, the first membership; with none, nothing", () => {
  assert.equal(pickMembership([pending], "deleted-program"), pending);
  assert.equal(pickMembership([], "anything"), undefined);
});
