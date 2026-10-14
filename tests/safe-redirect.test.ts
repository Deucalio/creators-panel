import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectTarget } from "@/lib/safe-redirect";

test("local paths survive, with their query and hash", () => {
  assert.equal(safeRedirectTarget("/dashboard/earnings?page=2#top"), "/dashboard/earnings?page=2#top");
  assert.equal(safeRedirectTarget("/dashboard/settings"), "/dashboard/settings");
});

test("anything that would leave the site falls back to the dashboard", () => {
  for (const hostile of [
    "//evil.com",
    "/\\evil.com", // browsers read \ as /, making this //evil.com
    "/\t/evil.com", // tabs and newlines are stripped from URLs
    "/\n/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "",
    undefined,
    null,
  ]) {
    assert.equal(safeRedirectTarget(hostile), "/dashboard", JSON.stringify(hostile));
  }
});
