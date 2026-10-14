import type { Metadata } from "next";
import { requestedProgramId } from "@/lib/auth";
import { getProgramTerms } from "@/lib/program-terms";
import { storeLink, productLink } from "@/lib/share-links";
import {
  compareToStandard,
  describeRate,
  describeShopperDiscount,
} from "@/lib/earning-status";
import { CopyField } from "@/components/copy-field";
import { resolveMembership } from "../guard";
import { storeDisplayName } from "@/lib/store-name";
import { LinkBuilder } from "./link-builder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Share",
};

export default async function LinksPage({ searchParams }: PageProps<"/dashboard/links">) {
  const { program } = await searchParams;
  const resolved = await resolveMembership(requestedProgramId(program));

  if (!resolved.ok) return resolved.screen;

  const { membership } = resolved;
  const store = membership.program.store;
  const storeName = storeDisplayName(store);
  const currency = membership.program.store.currencyCode;
  const code = membership.referralCode;

  const { config, productRules } = await getProgramTerms(membership.program.id);
  const paused = membership.program.status !== "ACTIVE";
  const couponEnabled = membership.program.trackingConfig?.couponTrackingEnabled ?? false;
  const shopperDiscount = describeShopperDiscount(
    membership.program.trackingConfig?.couponDiscountType,
    membership.program.trackingConfig?.couponDiscountValue,
    currency,
  );

  return (
    <div className="flex flex-col gap-6">
      {resolved.notice}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Share</h1>
        <p className="text-sm text-ink-muted">
          Everything you need to send people to {storeName} and get credited for it.
        </p>
      </div>

      <Card title="Your store link" description="Sends people to the home page.">
        <CopyField
          label="Store link"
          value={storeLink(store, code)}
          hint={
            paused
              ? "The merchant has paused this program, so orders through this link won't be credited right now."
              : "Anyone who clicks it is credited to you for 30 days, even if they buy later."
          }
        />
      </Card>

      {couponEnabled ? (
        <Card
          title="Your coupon code"
          description={
            shopperDiscount
              ? `Your followers get ${shopperDiscount} for using it, and you get credited for the sale.`
              : "For followers who won't click a link — they enter this at checkout."
          }
        >
          <CopyField
            label="Coupon code"
            value={code}
            emphasis
            hint="Works even if they never click your link."
          />
        </Card>
      ) : null}

      <Card
        title="Link to any page"
        description="Promoting one product converts far better than sending people to the home page."
      >
        <LinkBuilder
          store={{ shop: store.shop, primaryDomain: store.primaryDomain }}
          referralCode={code}
          membershipId={membership.id}
        />
      </Card>

      {productRules.length > 0 ? (
        <Card
          title="Products with their own rate"
          description={
            config
              ? `These replace your standard ${describeRate(config.type, config.amount, currency, { perSale: false })} for that product — higher or lower.`
              : "These replace your standard rate for that product — higher or lower."
          }
        >
          <ul className="flex flex-col gap-5">
            {productRules.map((rule) => {
              const comparison = compareToStandard(rule, config);
              return (
                <li key={rule.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">{rule.productTitle}</span>
                    <span
                      className={`text-sm font-bold ${
                        comparison === "none"
                          ? "text-ink-subtle"
                          : comparison === "lower"
                            ? "text-ink-muted"
                            : "text-brand-text"
                      }`}
                    >
                      {comparison === "none"
                        ? "Earns no commission"
                        : describeRate(rule.type, rule.amount, currency)}
                      {comparison === "higher" ? " · more than standard" : null}
                      {comparison === "lower" ? " · less than standard" : null}
                    </span>
                  </div>

                  {comparison === "none" ? (
                    // A 0% override is how a merchant excludes a product. Offering
                    // a ready-made link to it would send the creator's audience
                    // somewhere that pays them nothing.
                    <p className="text-xs leading-relaxed text-ink-subtle">
                      Sales of this product don&apos;t earn you anything, so there&apos;s no link for it.
                    </p>
                  ) : rule.productHandle ? (
                    <CopyField
                      label={`Link to ${rule.productTitle}`}
                      value={productLink(store, code, rule.productHandle)}
                    />
                  ) : (
                    // Rules saved before handles were stored. The merchant opening
                    // their program editor repairs this automatically, so the copy
                    // avoids blaming anyone and points at the builder above.
                    <p className="text-xs leading-relaxed text-ink-subtle">
                      No direct link for this one yet. Open the product on the store, copy its
                      address, and paste it into the builder above.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
