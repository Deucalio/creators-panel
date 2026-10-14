import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidEmail } from "@/lib/email-format";
import { EMAIL_MAX_LENGTH } from "@/lib/field-limits";

test("an address over the standard's length is refused, whatever the browser sent", () => {
  assert.equal(isValidEmail(`${"a".repeat(64)}@example.com`), true);
  assert.equal(isValidEmail(`${"a".repeat(EMAIL_MAX_LENGTH)}@example.com`), false);
});
