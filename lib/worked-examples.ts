import { describeRate } from "@/lib/earning-status";
import { formatMoney } from "@/lib/money";

/**
 * The worked examples on How you earn.
 *
 * One example at the base rate never showed the rules that make a program
 * interesting — the 15% for a first-time customer, the 20% on one product — so
 * this builds a scenario for each rule that can win, priced the way the
 * Shopify app prices an order (`calculateOrderCommission`):
 *
 * - a product rule earns its own rate on that product's lines, whoever buys;
 * - otherwise a new/returning customer rule replaces the standard rate;
 * - otherwise the standard rate applies — including guest checkouts, where
 *   there's no customer history to read;
 * - an order under the minimum earns nothing at all.
 *
 * Product rules can only be a percentage or per item; the engine ignores a
 * per-order product rule, so it isn't shown as if it applied.
 */

type Rule = { type: string; amount: number };

export type WorkedExampleTerms = {
  config: Rule & { minimumOrderValue: number | null };
  customerRules: (Rule & { customerType: string })[];
  productRules: (Rule & { productTitle: string })[];
};

export type WorkedExample = {
  /** The order: "An order of PKR 200 (2 items)". */
  scenario: string;
  /** Which rule wins and why. */
  rule: string;
  commission: number;
};

/** Per-item rates need a quantity to show; two items keeps the sum obvious. */
export const EXAMPLE_ITEMS = 2;

const PRODUCT_RULE_TYPES = ["PERCENTAGE", "FIXED_PER_ITEM"];

const CUSTOMER_WORDS: Record<string, { who: string; rate: string }> = {
  NEW: { who: "a first-time customer", rate: "First-time customer rate" },
  RETURNING: { who: "a returning customer", rate: "Returning customer rate" },
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** A round order size (100, 200, 500, 1,000 …) that the minimum doesn't exclude. */
export function exampleOrderValue(minimum: number | null | undefined): number {
  const floor = minimum && minimum > 0 ? minimum : 0;
  for (let base = 100; ; base *= 10) {
    for (const step of [1, 2, 5]) {
      if (base * step >= floor) return base * step;
    }
  }
}

/** What one rule earns when it covers the whole example order. */
function earn(rule: Rule, subtotal: number): number {
  if (rule.amount <= 0) return 0;
  switch (rule.type) {
    case "PERCENTAGE":
      return round2((subtotal * rule.amount) / 100);
    case "FIXED_PER_ORDER":
      return round2(rule.amount);
    case "FIXED_PER_ITEM":
      return round2(rule.amount * EXAMPLE_ITEMS);
    default:
      return 0;
  }
}

function rate(rule: Rule, currency: string): string {
  return rule.amount <= 0 ? "no commission" : describeRate(rule.type, rule.amount, currency);
}

export function buildWorkedExamples(
  { config, customerRules, productRules }: WorkedExampleTerms,
  currency: string,
): WorkedExample[] {
  const subtotal = exampleOrderValue(config.minimumOrderValue);
  const usable = productRules.filter((rule) => PRODUCT_RULE_TYPES.includes(rule.type));
  // A paying rule makes the better example; fall back to a zero one if that's all there is.
  const product = usable.find((rule) => rule.amount > 0) ?? usable[0];

  const perItem = [config, ...customerRules, ...(product ? [product] : [])].some(
    (rule) => rule.type === "FIXED_PER_ITEM",
  );
  const order = `${formatMoney(subtotal, currency)}${perItem ? ` (${EXAMPLE_ITEMS} items)` : ""}`;

  const examples: WorkedExample[] = [
    {
      scenario: `An order of ${order}`,
      rule: `Standard rate, also used for guest checkouts: ${rate(config, currency)}`,
      commission: earn(config, subtotal),
    },
  ];

  for (const type of ["NEW", "RETURNING"]) {
    const rule = customerRules.find((r) => r.customerType === type);
    const words = CUSTOMER_WORDS[type];
    if (!rule || !words) continue;
    examples.push({
      scenario: `The same order from ${words.who}`,
      rule: `${words.rate} replaces the standard one: ${rate(rule, currency)}`,
      commission: earn(rule, subtotal),
    });
  }

  if (product) {
    examples.push({
      scenario: `The same order, all ${product.productTitle}`,
      rule: `Its product rate beats every other rate: ${rate(product, currency)}`,
      commission: earn(product, subtotal),
    });
  }

  const minimum = config.minimumOrderValue;
  if (minimum && minimum > 0) {
    examples.push({
      scenario: `An order under ${formatMoney(minimum, currency)}`,
      rule: "Below the minimum order value, so nothing is earned",
      commission: 0,
    });
  }

  return examples;
}
