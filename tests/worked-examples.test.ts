import { test } from "node:test";
import assert from "node:assert/strict";
import { buildWorkedExamples, exampleOrderValue, type WorkedExampleTerms } from "@/lib/worked-examples";

const base: WorkedExampleTerms = {
  config: { type: "PERCENTAGE", amount: 13, minimumOrderValue: null },
  customerRules: [],
  productRules: [],
};

test("the example order is a round number the minimum doesn't exclude", () => {
  assert.equal(exampleOrderValue(null), 100);
  assert.equal(exampleOrderValue(100), 100);
  assert.equal(exampleOrderValue(150), 200);
  assert.equal(exampleOrderValue(1200), 2000);
});

test("standard rate only: one example", () => {
  const examples = buildWorkedExamples(base, "PKR");
  assert.equal(examples.length, 1);
  assert.equal(examples[0].commission, 13);
  assert.match(examples[0].rule, /13% of the sale/);
  assert.match(examples[0].rule, /guest checkouts/);
});

test("the quickstart program: first-time 15% and a 20% product each get their own example", () => {
  const examples = buildWorkedExamples(
    {
      ...base,
      customerRules: [{ customerType: "NEW", type: "PERCENTAGE", amount: 15 }],
      productRules: [
        { productTitle: "Gift Card", type: "PERCENTAGE", amount: 0 },
        { productTitle: "The Collection Snowboard: Hydrogen", type: "PERCENTAGE", amount: 20 },
      ],
    },
    "PKR",
  );
  assert.deepEqual(
    examples.map((e) => e.commission),
    [13, 15, 20],
  );
  assert.match(examples[1].scenario, /first-time customer/);
  // The paying product is the example, not the zero-rated gift card.
  assert.match(examples[2].scenario, /Hydrogen/);
});

test("per-item and per-order rates", () => {
  const examples = buildWorkedExamples(
    {
      config: { type: "FIXED_PER_ITEM", amount: 30, minimumOrderValue: null },
      customerRules: [{ customerType: "RETURNING", type: "FIXED_PER_ORDER", amount: 50 }],
      productRules: [],
    },
    "PKR",
  );
  assert.match(examples[0].scenario, /2 items/);
  assert.equal(examples[0].commission, 60);
  assert.equal(examples[1].commission, 50);
});

test("a per-order product rule is ignored by the engine, so it isn't shown", () => {
  const examples = buildWorkedExamples(
    { ...base, productRules: [{ productTitle: "Hat", type: "FIXED_PER_ORDER", amount: 99 }] },
    "PKR",
  );
  assert.equal(examples.length, 1);
});

test("a zero-rated product and the minimum order both show as earning nothing", () => {
  const examples = buildWorkedExamples(
    {
      config: { type: "PERCENTAGE", amount: 10, minimumOrderValue: 150 },
      customerRules: [],
      productRules: [{ productTitle: "Gift Card", type: "PERCENTAGE", amount: 0 }],
    },
    "PKR",
  );
  assert.equal(examples[0].commission, 20); // 10% of a 200 order
  assert.equal(examples[1].commission, 0);
  assert.match(examples[1].rule, /no commission/);
  assert.match(examples[2].scenario, /under/);
  assert.equal(examples[2].commission, 0);
});
