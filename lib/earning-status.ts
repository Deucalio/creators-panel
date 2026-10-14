import { formatShortDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/money";

/**
 * Presentation rules for a referred order's state.
 *
 * NOT a `server-only` module, and it must stay that way — the badge that uses
 * this renders inside client components. Importing `server-only` here would
 * only fail at runtime, which is exactly how the four previous leaks of this
 * kind got through build and typecheck.
 */

export type Tone = "warn" | "info" | "ok" | "bad" | "neutral";

export type EarningStatus = {
  label: string;
  tone: Tone;
  /** One line explaining the label, shown beneath it. */
  hint: string;
};

type CommissionLike = {
  status: string;
  rejectionReason?: string | null;
  eligibleAt?: Date | null;
  payout?: { number: number; paidAt: Date | null } | null;
};

type AdjustmentLike = { amount: number; reason: string };

/**
 * Collapse the referral's status and the commission's status into the single
 * state a creator actually cares about: where is my money.
 *
 * The two are deliberately separate in the schema — "Sarah generated this
 * order" stays true even when "Sarah should be paid for it" becomes false — but
 * that distinction is a merchant's concern. A creator asks one question, so the
 * portal answers with one status and only splits them apart when they disagree.
 */
export function deriveEarningStatus(
  referralStatus: string,
  commission: CommissionLike | null,
): EarningStatus {
  // A rejected referral outranks whatever the commission says: the sale itself
  // was never credited, so there is no entitlement to describe.
  if (referralStatus === "REJECTED") {
    return {
      label: "Not credited",
      tone: "neutral",
      hint: "This order wasn't attributed to you.",
    };
  }

  switch (commission?.status) {
    case "PENDING": {
      // The hold period exists so refunds have time to surface. A creator
      // seeing a bare "Pending" has no idea whether that means days or never —
      // the date is already stored, so say it.
      const eligible = commission.eligibleAt;
      if (eligible && eligible.getTime() > Date.now()) {
        return {
          label: "Pending",
          tone: "warn",
          hint: `Under review until ${formatShortDate(eligible)}, then payable.`,
        };
      }
      return {
        label: "Pending",
        tone: "warn",
        hint: "Waiting on the merchant to review.",
      };
    }

    case "APPROVED":
      return {
        label: "Approved",
        tone: "info",
        // An approved commission may already be attached to a payout that has
        // not been sent yet. Saying "waiting to be included in a payout" then
        // would be plainly wrong, and it is the difference between "the merchant
        // hasn't got to it" and "it's queued and on its way".
        hint: commission.payout
          ? `In ${formatPayoutNumber(commission.payout.number)}, awaiting payment.`
          : "Approved — waiting to be included in a payout.",
      };

    case "PAID":
      return {
        label: "Paid",
        tone: "ok",
        hint: commission.payout
          ? `Paid in ${formatPayoutNumber(commission.payout.number)}.`
          : "Paid out.",
      };

    case "REJECTED":
      return {
        label: "Declined",
        tone: "bad",
        // The merchant is required to give a reason when rejecting. Showing it
        // turns the most likely support ticket in the product into a sentence
        // the creator can already read.
        hint: commission.rejectionReason?.trim()
          ? commission.rejectionReason.trim()
          : "The merchant declined this commission.",
      };

    default:
      // A referral with no commission row. attributeOrder writes both in one
      // transaction, so this is rare rather than impossible — worth a distinct
      // label instead of rendering a blank cell.
      return {
        label: "Processing",
        tone: "neutral",
        hint: "Being calculated.",
      };
  }
}

type AdjustableCommission = {
  status: string;
  amount: number;
  originalAmount?: number | null;
  adjustments?: { amount: number }[];
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * What the creator was overpaid on one commission, or 0.
 *
 * Mirrors `owedBackOn` in the Shopify app's refunds.server.js exactly, so the
 * merchant and the creator always see the same debt. A PAID commission's
 * `amount` is frozen at what was sent; `originalAmount` plus the ledger is what
 * it is worth now; the gap is the debt. Summing the adjustments instead counts a
 * refund that landed *before* payment — which had already lowered what was
 * paid — as owed a second time.
 */
export function owedBackOn(commission: AdjustableCommission): number {
  if (commission.status !== "PAID") return 0;
  const adjusted = (commission.adjustments ?? []).reduce((sum, a) => sum + a.amount, 0);
  const entitlement = (commission.originalAmount ?? commission.amount) + adjusted;
  const owed = round2(commission.amount - entitlement);
  return owed > 0 ? owed : 0;
}

/**
 * Explain a commission amount that is no longer what it started as.
 *
 * Two genuinely different effects, and conflating them would misinform:
 *
 * - A refund before payment moved the entitlement itself, so the amount shown
 *   *is* the amount owed — "was X, Y refunded".
 * - A refund after payment cannot move `amount`, which stays frozen at what was
 *   actually sent. It becomes a debt instead — "Y owed back".
 *
 * A paid commission can carry both, when one refund landed before the payout
 * and another after it.
 */
export function describeAmountChange(
  commission: (CommissionLike & AdjustableCommission & { adjustments?: AdjustmentLike[] }) | null,
  currency: string,
): string | null {
  if (!commission) return null;

  const adjustments = commission.adjustments ?? [];
  if (adjustments.length === 0) return null;

  const delta = adjustments.reduce((sum, a) => sum + a.amount, 0);
  if (Math.abs(delta) < 0.005) return null;

  if (commission.status === "PAID") {
    const original = commission.originalAmount ?? commission.amount;
    const reducedBeforePayout = round2(original - commission.amount);
    const owed = owedBackOn(commission);

    const parts: string[] = [];
    if (reducedBeforePayout > 0.005) {
      parts.push(
        `Was ${formatMoney(original, currency)} · ${formatMoney(reducedBeforePayout, currency)} refunded before payout.`,
      );
    }
    if (owed > 0.005) {
      parts.push(`${formatMoney(owed, currency)} owed back — refunded after payout.`);
    }
    return parts.length > 0 ? parts.join(" ") : null;
  }

  const original = commission.originalAmount ?? commission.amount - delta;
  return `Was ${formatMoney(original, currency)} · ${formatMoney(Math.abs(delta), currency)} refunded.`;
}

/** "PL-0007" — the merchant-facing payout number a creator can quote back. */
export function formatPayoutNumber(number: number): string {
  return `PL-${String(number).padStart(4, "0")}`;
}

export function payoutTone(status: string): Tone {
  switch (status) {
    case "PAID":
      return "ok";
    case "PROCESSING":
      return "info";
    case "FAILED":
      return "bad";
    default:
      return "warn";
  }
}

/** Membership status, for the program switcher and the not-active screens. */
export function membershipTone(status: string): Tone {
  switch (status) {
    case "ACTIVE":
      return "ok";
    case "PENDING":
      return "warn";
    case "REJECTED":
      return "bad";
    default:
      return "neutral";
  }
}

export function titleCase(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/** Render a commission rule as the creator would describe it out loud. */
export function describeRate(
  type: string,
  amount: number,
  currency: string,
  { perSale = true }: { perSale?: boolean } = {},
): string {
  switch (type) {
    case "PERCENTAGE":
      return perSale ? `${amount}% of the sale` : `${amount}%`;
    case "FIXED_PER_ORDER":
      return perSale ? `${formatMoney(amount, currency)} per order` : formatMoney(amount, currency);
    case "FIXED_PER_ITEM":
      return perSale ? `${formatMoney(amount, currency)} per item` : formatMoney(amount, currency);
    default:
      return "—";
  }
}

/**
 * What the *shopper* saves with a creator's coupon.
 *
 * Deliberately distinct from `describeRate`, which is what the creator earns.
 * Conflating the two would tell a creator on 20% commission that their
 * followers get 20% off, which is a different number and a worse mistake than
 * showing nothing.
 */
export function describeShopperDiscount(
  type: string | null | undefined,
  value: number | null | undefined,
  currency: string,
): string | null {
  if (!type || !value || value <= 0) return null;
  if (type === "PERCENTAGE") return `${value}% off`;
  if (type === "FIXED_AMOUNT") return `${formatMoney(value, currency)} off`;
  return null;
}

/**
 * How a product's own rate compares with the standard one. Only comparable
 * when both are the same kind of rate — 20% and PKR 50 per item have no
 * honest ordering — in which case nothing is claimed either way.
 */
export function compareToStandard(
  rule: { type: string; amount: number },
  config: { type: string; amount: number } | null,
): "none" | "higher" | "lower" | "different" {
  if (rule.amount <= 0) return "none";
  if (!config || config.type !== rule.type || rule.amount === config.amount) return "different";
  return rule.amount > config.amount ? "higher" : "lower";
}
