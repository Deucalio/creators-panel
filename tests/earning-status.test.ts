import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveEarningStatus, describeAmountChange, owedBackOn } from "@/lib/earning-status";
import { percentChange } from "@/lib/change";

// USD keeps cents in the output, so the arithmetic is visible in the strings.
const USD = "USD";

test("unpaid, refunded: the amount moved and the line says so", () => {
  const text = describeAmountChange(
    { status: "PENDING", amount: 91, originalAmount: 130, adjustments: [{ amount: -39, reason: "Order refunded" }] },
    USD,
  );
  assert.equal(text, "Was $130.00 · $39.00 refunded.");
});

test("paid, then refunded: the amount is frozen and the shortfall is owed back", () => {
  const text = describeAmountChange(
    { status: "PAID", amount: 120, originalAmount: 120, adjustments: [{ amount: -48, reason: "Order refunded" }] },
    USD,
  );
  assert.equal(text, "$48.00 owed back — refunded after payout.");
});

test("refunded, then paid: nothing is owed — the creator was paid the reduced amount", () => {
  const commission = {
    status: "PAID",
    amount: 91,
    originalAmount: 130,
    adjustments: [{ amount: -39, reason: "Order refunded" }],
  };
  assert.equal(owedBackOn(commission), 0);
  assert.equal(describeAmountChange(commission, USD), "Was $130.00 · $39.00 refunded before payout.");
});

test("refunded both before and after payment: both effects, each counted once", () => {
  const text = describeAmountChange(
    {
      status: "PAID",
      amount: 91,
      originalAmount: 130,
      adjustments: [
        { amount: -39, reason: "Order refunded" },
        { amount: -26, reason: "Order refunded" },
      ],
    },
    USD,
  );
  assert.equal(text, "Was $130.00 · $39.00 refunded before payout. $26.00 owed back — refunded after payout.");
});

test("owedBackOn agrees with the merchant side on the same cases", () => {
  // These four cases are duplicated in the Shopify app's tests/refunds.test.js.
  assert.equal(owedBackOn({ status: "PAID", amount: 91, originalAmount: 130, adjustments: [{ amount: -39 }] }), 0);
  assert.equal(owedBackOn({ status: "PAID", amount: 120, originalAmount: 120, adjustments: [{ amount: -48 }] }), 48);
  assert.equal(owedBackOn({ status: "PAID", amount: 91, originalAmount: 130, adjustments: [{ amount: -39 }, { amount: -26 }] }), 26);
  assert.equal(owedBackOn({ status: "PAID", amount: 78, originalAmount: null, adjustments: [{ amount: -26 }] }), 26);
});

test("status hints: queued vs not yet queued, the merchant's own reason, and the hold date", () => {
  assert.equal(deriveEarningStatus("APPROVED", { status: "APPROVED", payout: { number: 4, paidAt: null } }).hint, "In PL-0004, awaiting payment.");
  assert.equal(deriveEarningStatus("APPROVED", { status: "APPROVED", payout: null }).hint, "Approved — waiting to be included in a payout.");
  assert.equal(deriveEarningStatus("APPROVED", { status: "REJECTED", rejectionReason: "  Order cancelled - test " }).hint, "Order cancelled - test");
  assert.match(
    deriveEarningStatus("APPROVED", { status: "PENDING", eligibleAt: new Date(Date.now() + 86_400_000 * 5) }).hint,
    /^Under review until/,
  );
  assert.equal(deriveEarningStatus("REJECTED", { status: "PAID" }).label, "Not credited");
});

test("no percentage change from a zero baseline", () => {
  assert.equal(percentChange(120, 0), null);
  assert.equal(percentChange(150, 100), 50);
});

test("product rates are compared with the standard only when comparable; 0% earns nothing", async () => {
  const { compareToStandard } = await import("@/lib/earning-status");
  const standard = { type: "PERCENTAGE", amount: 13 };
  assert.equal(compareToStandard({ type: "PERCENTAGE", amount: 20 }, standard), "higher");
  assert.equal(compareToStandard({ type: "PERCENTAGE", amount: 5 }, standard), "lower");
  assert.equal(compareToStandard({ type: "PERCENTAGE", amount: 0 }, standard), "none");
  assert.equal(compareToStandard({ type: "FIXED_PER_ITEM", amount: 50 }, standard), "different");
  assert.equal(compareToStandard({ type: "PERCENTAGE", amount: 13 }, standard), "different");
});

test("stores are named by their own name, falling back to the myshopify handle", async () => {
  const { storeDisplayName } = await import("@/lib/store-name");
  assert.equal(storeDisplayName({ shop: "quickstart-65d173cf.myshopify.com", name: "Quickstart Snow Co." }), "Quickstart Snow Co.");
  assert.equal(storeDisplayName({ shop: "quickstart-65d173cf.myshopify.com", name: null }), "quickstart-65d173cf");
  assert.equal(storeDisplayName({ shop: "quickstart-65d173cf.myshopify.com", name: "   " }), "quickstart-65d173cf");
});
