import { test } from "node:test";
import assert from "node:assert/strict";
import { PAYOUT_DETAILS_PROMPT, PAYOUT_METHODS, matchPayoutMethod } from "@/lib/payout-methods";

test("each listed method matches itself", () => {
  for (const method of PAYOUT_METHODS) assert.equal(matchPayoutMethod(method), method);
});

test("free text saved before the list existed still maps to a method", () => {
  assert.equal(matchPayoutMethod("easy paisa"), "Easypaisa");
  assert.equal(matchPayoutMethod("EASYPAISA "), "Easypaisa");
  assert.equal(matchPayoutMethod("Jazz-Cash"), "JazzCash");
  assert.equal(matchPayoutMethod("jazzcash wallet"), "JazzCash");
  assert.equal(matchPayoutMethod("Meezan Bank"), "Bank transfer");
  assert.equal(matchPayoutMethod("IBAN"), "Bank transfer");
});

test("methods no merchant pays through, and blanks, match nothing", () => {
  for (const value of ["Wise", "PayPal", "Stripe", "Cash", "", "   ", null, undefined]) {
    assert.equal(matchPayoutMethod(value), null, String(value));
  }
});

test("every method has a details prompt", () => {
  for (const method of PAYOUT_METHODS) assert.ok(PAYOUT_DETAILS_PROMPT[method].length > 0, method);
});
