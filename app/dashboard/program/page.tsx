import type { Metadata } from "next";
import Link from "next/link";
import { requestedProgramId } from "@/lib/auth";
import { getProgramTerms } from "@/lib/program-terms";
import { formatMoney } from "@/lib/money";
import { buildWorkedExamples } from "@/lib/worked-examples";
import {
  describeRate,
  describeShopperDiscount,
  compareToStandard,
} from "@/lib/earning-status";
import { resolveMembership } from "../guard";
import { storeDisplayName } from "@/lib/store-name";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How you earn",
};

const CUSTOMER_LABELS: Record<string, string> = {
  NEW: "First-time customers",
  RETURNING: "Returning customers",
};

export default async function ProgramPage({ searchParams }: PageProps<"/dashboard/program">) {
  const { program } = await searchParams;
  const resolved = await resolveMembership(requestedProgramId(program));

  if (!resolved.ok) return resolved.screen;

  const { membership } = resolved;
  const currency = membership.program.store.currencyCode;
  const storeName = storeDisplayName(membership.program.store);
  const { config, productRules, customerRules, tracking } = await getProgramTerms(
    membership.program.id,
  );
  const shopperDiscount = describeShopperDiscount(
    tracking?.couponDiscountType,
    tracking?.couponDiscountValue,
    currency,
  );

  return (
    <div className="flex flex-col gap-6">
      {resolved.notice}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">How you earn</h1>
        <p className="text-sm text-ink-muted">
          The rates, overrides, and attribution rules {storeName} applies to {membership.program.name}.
        </p>
      </div>

      {!config ? (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
          <p className="text-sm leading-relaxed text-ink-muted">
            {storeName} hasn&apos;t set a commission rate for this program yet. Ask them before you
            start promoting — orders referred now may not earn anything.
          </p>
        </section>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Section 1: Rates & Precedence (HE-3) */}
          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            <div className="border-b border-line-soft bg-surface-muted/30 p-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                Standard commission rate
              </span>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-extrabold tracking-tight text-ink">
                  {config.amount <= 0
                    ? "Earns no commission"
                    : describeRate(config.type, config.amount, currency)}
                </span>
                <span className="rounded-md bg-brand-surface px-2 py-0.5 text-xs font-semibold text-brand-text">
                  Base rate
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Calculated on the qualifying order subtotal after discounts, excluding tax and
                shipping. If {storeName} adjusts rates in the future, orders you&apos;ve already
                referred keep the rate they were earned under.
              </p>
            </div>

            {/* Overrides Table / Grid */}
            {(customerRules.length > 0 || productRules.length > 0) && (
              <div className="divide-y divide-line-soft">
                {/* Customer overrides */}
                {customerRules.length > 0 && (
                  <div className="p-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                      Rates by customer type
                    </h2>
                    <p className="mt-1 text-xs text-ink-muted">
                      Applied instead of your standard rate based on the shopper&apos;s purchase history.
                    </p>
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {customerRules.map((rule) => {
                        const comparison = compareToStandard(rule, config);
                        return (
                          <li
                            key={rule.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-soft bg-surface-muted/20 px-4 py-3"
                          >
                            <span className="text-xs font-semibold text-ink">
                              {CUSTOMER_LABELS[rule.customerType] ?? rule.customerType}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-ink">
                                {rule.amount <= 0
                                  ? "Earns no commission"
                                  : describeRate(rule.type, rule.amount, currency)}
                              </span>
                              {comparison === "higher" && (
                                <span className="rounded bg-ok-surface px-1.5 py-0.5 text-[10px] font-bold text-ok-ink">
                                  Higher
                                </span>
                              )}
                              {comparison === "lower" && (
                                <span className="rounded bg-warn-surface px-1.5 py-0.5 text-[10px] font-bold text-warn-ink">
                                  Lower
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Specific product overrides */}
                {productRules.length > 0 && (
                  <div className="p-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                      Product-specific rates
                    </h2>
                    <p className="mt-1 text-xs text-ink-muted">
                      These overrides beat all other rates. An order mixing these with other products
                      earns each line at its respective rate.
                    </p>
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {productRules.map((rule) => {
                        const comparison = compareToStandard(rule, config);
                        return (
                          <li
                            key={rule.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-soft bg-surface-muted/20 px-4 py-3"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-semibold text-ink">
                                {rule.productTitle}
                              </span>
                              {/* Promote product link (HE-6) */}
                              <Link
                                href={`/dashboard/links?program=${membership.id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
                              >
                                <span>Get share link</span>
                                <Icon name="arrow" className="h-3 w-3" />
                              </Link>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-ink">
                                {rule.amount <= 0
                                  ? "Earns no commission"
                                  : describeRate(rule.type, rule.amount, currency)}
                              </span>
                              {comparison === "higher" && (
                                <span className="rounded bg-ok-surface px-1.5 py-0.5 text-[10px] font-bold text-ok-ink">
                                  Higher
                                </span>
                              )}
                              {comparison === "lower" && (
                                <span className="rounded bg-warn-surface px-1.5 py-0.5 text-[10px] font-bold text-warn-ink">
                                  Lower
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Precedence explanation */}
                <div className="p-6 bg-surface-muted/10">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                    Which rate applies?
                  </h2>
                  <ol className="mt-3 flex flex-col gap-2.5 text-xs text-ink-muted">
                    <li className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-brand-surface text-[10px] font-bold text-brand-text">
                        1
                      </span>
                      <span>
                        <strong className="text-ink">Product override:</strong> If a specific product has a custom rate, that line item earns its custom rate.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-brand-surface text-[10px] font-bold text-brand-text">
                        2
                      </span>
                      <span>
                        <strong className="text-ink">Customer type rule:</strong> Otherwise, if customer history is recognized (new vs. returning), that rate applies.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-brand-surface text-[10px] font-bold text-brand-text">
                        3
                      </span>
                      <span>
                        <strong className="text-ink">Standard rate:</strong> Guest checkouts and all other standard items earn your base rate. Rates never stack.
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Worked examples, one per rule that can win (HE-1) */}
          <section className="rounded-2xl border border-brand/20 bg-linear-to-b from-brand-surface/40 to-surface p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/15 text-brand-text">
                <Icon name="sparkles" className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-sm font-bold tracking-tight text-ink">
                Example orders
              </h2>
            </div>
            <ul className="mt-4 flex flex-col divide-y divide-line-soft rounded-xl border border-line bg-surface">
              {buildWorkedExamples({ config, customerRules, productRules }, currency).map((example) => (
                <li key={example.scenario} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs font-semibold text-ink">{example.scenario}</span>
                    <span className="text-[11px] leading-relaxed text-ink-muted">{example.rule}</span>
                  </div>
                  <span className="flex-none font-mono text-xs font-bold text-ink">
                    {formatMoney(example.commission, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3: Attribution & Tracking Rules (HE-4) */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
              How sales are attributed
            </h2>
            <ul className="mt-4 flex flex-col gap-4 text-xs leading-relaxed text-ink-muted">
              {tracking?.linkTrackingEnabled !== false ? (
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-lg bg-surface-muted text-ink">
                    <Icon name="share" className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-semibold text-ink">Referral link cookie (30 days):</span> When a shopper clicks your link, their browser remembers you for 30 days. If they make a purchase within that window, you receive credit.
                  </div>
                </li>
              ) : null}

              {tracking?.couponTrackingEnabled ? (
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-lg bg-surface-muted text-ink">
                    <Icon name="orders" className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-semibold text-ink">Coupon code:</span> Whenever a shopper enters your code at checkout
                    {shopperDiscount ? ` (granting them ${shopperDiscount})` : ""}, the order is attributed to you even if they never clicked your link.
                  </div>
                </li>
              ) : (
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-lg bg-surface-muted text-ink">
                    <Icon name="info" className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-semibold text-ink">Coupon tracking is disabled:</span> Your referral link is currently the sole attribution method for this program.
                  </div>
                </li>
              )}

              {/* Discount code precedence note (HE-4) */}
              <li className="flex items-start gap-3 rounded-xl border border-line-soft bg-surface-muted/20 p-3 text-[11px] text-ink-muted">
                <Icon name="info" className="mt-0.5 h-3.5 w-3.5 flex-none text-ink-subtle" />
                <span>
                  <strong className="text-ink">When a code beats your link:</strong> If a shopper clicks your link but then enters another creator&apos;s code at checkout, that creator gets the credit. Ordinary store discount codes, like a sale code, never take the credit from you.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 4: Getting paid (HE-2) */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
              Getting paid
            </h2>
            <div className="mt-3 flex flex-col gap-3 text-xs leading-relaxed text-ink-muted">
              <p>
                {storeName} reviews each commission and sends approved earnings to you by hand, through
                Easypaisa, JazzCash or a bank transfer. There&apos;s no fixed schedule: each payment appears
                in Payouts, with its reference, once it&apos;s sent.
                {/* The hold is shown to the merchant but approval isn't blocked
                    on it, so describe it as their usual practice, not a rule. */}
                {config.holdDays ? (
                  <>
                    {" "}{storeName} usually waits{" "}
                    <strong className="text-ink">{config.holdDays} days</strong> after an order before approving its commission, so returns, exchanges and cancellations can come through first.
                  </>
                ) : null}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-soft bg-surface-muted/30 p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-ink">
                    Verify your payment method
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    Make sure your Easypaisa, JazzCash or bank details are up to date.
                  </span>
                </div>
                <Link
                  href={`/dashboard/settings?program=${membership.id}#payouts`}
                  className="rounded-xl border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-line-strong hover:bg-surface-muted transition-colors shadow-2xs"
                >
                  Manage payout details →
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
