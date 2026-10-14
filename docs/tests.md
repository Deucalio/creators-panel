# PartnerLoop — test plan

Updated 14 October 2026. This replaces the earlier `tests.md` and `tests-archive-2026-09-08.md`.

It lists what's left to test by hand, how to run it, what's already proven, and the decisions that
block launch. Test IDs are kept from the earlier files, because PROJECT_STATUS.md and the UI/UX audit
refer to them; a gap in the numbering is an item that's done or retired.

**Report back** with the ID and what you saw — `C2 fail: log said no_referral_code` is perfect,
`B4 ok` is fine. Order and refund results print in `dev.log`; tell me when you've done one and I'll
check the log and the database.

## Where things stand

| Area | Left for you | Already done |
|---|---|---|
| Setup | — | S0–S4, A1, A2 |
| Coupon codes | **A3** (do first) | Query and input validated against Shopify's schema |
| Shopify admin | B1–B13 | Logic covered by `npm test` |
| Orders and refunds | C1–C7, C9–C17 | C8, the click half of C4 |
| Creator portal, desktop | D1, D2, D7, D8, D14, D18, D22, D23 | 15 items, live and on a private copy |
| Creator portal, phone | E2, E3, E5 | E1, E4 |

Automated tests: `npm test` in either app — 52 in the Shopify app, 22 in the portal, about a second
each, no database needed. Run them after any change to the money code.

---

## Run it

**Shopify app**, writing the log to a file so results can be read back:

```
cd d:\vscode\ofce\promote\partner-loop-creator-growth
shopify app dev 2>&1 | Tee-Object dev.log
```

Open the URL it prints, and open the app on `quickstart-65d173cf`. The `NativeCommandError` at the
top of the log is PowerShell wrapping the CLI's stderr, and harmless. `dev.log` is UTF-16 and
changes every run: keep it out of git.

**Creator portal**, in a second terminal:

```
cd d:\vscode\ofce\promote\creators-panel
npm run dev
```

Then open **http://localhost:3001**.

| Creator | Email | Password | State |
|---|---|---|---|
| Sarah Jenkins | `sarah@example.com` | `partnerloop123` | Active: 3 orders, 2 payouts, 9 clicks |
| Mike Ross | `mike@example.com` | `partnerloop123` | Pending, no orders |

The storefront's preview password is `s`. Creator Program is active, so orders attribute.

After a schema change: `npx prisma db push` in the Shopify app, then `npm run schema:sync` in the
portal.

---

## A3. Coupon codes — do this first

Programs → Creator Program → Advanced → **Coupon codes**. It shows *Enabled* with no discount and a
red warning that no codes will be created. Set **Shoppers get → 10%** and Save.

*Expect:*

1. the log reads `[PROGRAM] coupon sync <id>: +1 ~0 -0 !0`
2. Shopify admin → Discounts has **SARAHQ7X2**, "Creator: Sarah Jenkins (SARAHQ7X2)", 10% off

This is the first time the app has ever created a discount in Shopify. If the log shows `!1`, paste
me the line. B8, B10, B12, C2 and C14 need it.

---

## B. Shopify admin

**B1. Program editor saves the advanced rules.** Advanced commission → New customer 15%, Returning
5%, Minimum order value 500. Save, reopen. *Expect:* all three still set.

**B2. Programs list.** Create a program, toggle it active and inactive, open the registration-link
modal, delete it. *Expect:* every button does something.

**B3. Commissions screen.** `/app/commissions`. *Expect:* correct tab counts and Sarah's rows grouped.
Approve one selected row; approve all on a creator row; reject one with an **empty** reason, which
must be refused.

**B4. Reject dialog.** Creators → Mike → Reject. *Expect:* a dialog, not an immediate action. It warns
that `MIKE4T8W` stops working at checkout for anyone who already has it, and won't submit without a
reason. Deactivating an active creator shows the same dialog with the reason optional. Approve and
Reactivate stay one click, on purpose.

**B5. Payout details in "Mark as paid".** Payouts → Mark as paid on PL-0004. *Expect:* a blue banner
above the reference field: "How this creator asked to be paid: Wise / sarah@example.com". Clear
Sarah's payout details in the portal (Settings → Remove payout details) and reopen. *Expect:* the
amber "No payout details on file" version.

**B6. Loading feedback.** On `/app`, change the Program or Period filter. *Expect:* both selects
disable and a spinner shows while it reloads. Onboarding's Finish button reads "Setting up…" and
ignores a double click.

**B7. Clicks and conversion on the dashboard.** Sarah's orders are from August, outside every period
the dashboard offers. *Expect* on **Last 30 days:** Clicks 2 and Conversion 0% — two visits, nobody
bought, which is a real zero. On **Last month** (September, no visits): an em dash and "Needs at
least one click", never "0%". Pick "Clicks" in the chart selector and check it matches the tile.

**B8. Deactivating retires the code.** *(Needs A3.)* Creators → deactivate Sarah. *Expect:* SARAHQ7X2
goes **inactive** in Shopify admin, not deleted. Reactivate her → *expect* it live again.

**B9. Paid commissions say "Paid".** Commissions → Paid tab. *Expect:* every badge reads **Paid**.
#1762, approved and inside the unsent PL-0004, still reads "In payout".

**B10. Coupon tracking off retires the codes.** *(Needs A3.)* Program editor → coupon codes **off**
→ Save. *Expect:* the log reads `coupon sync <id>: +0 ~0 -1 !0` and SARAHQ7X2 goes inactive. Turn it
back on and save → *expect* `~1` and the code live again.

**B11. Currency on the programs list.** `/app/programs` → "New Affiliate Program" (a fixed 10 per
order). *Expect:* **PKR 10**, not $10.

**B12. Deleting a program retires its codes.** *(Needs A3; optional.)* Give a throwaway program a
creator with a live code, then delete the program. *Expect:* that code goes inactive in Shopify
admin. Read H8 before deleting anything with real payouts.

**B13. The product picker.** Program editor → Special product commission → Set up. *Expect:*
Shopify's product picker opens; pick a product, set 20%, Save, reopen, and it's still there. Remove
it again afterwards. The picker can't be driven by a script, so this has never been checked.

---

## C. Orders and refunds on the storefront

Use the Bogus Gateway (card number `1`). Tell me after each order or refund and I'll check
`dev.log` and the database; the expected log line is given where it matters.

**C1. Product override.** Buy the Snowboard through the cart after visiting `?ref=SARAHQ7X2`.
*Expect:* 20% of the subtotal, not 13%.

**C2. Coupon order.** *(Needs A3.)* Without clicking any referral link, enter **SARAHQ7X2** at
checkout. *Expect:* `-> attributed via coupon (commission N)`.

**C3. A store promotion doesn't steal the credit.** Create an ordinary discount (say SUMMER20). Visit
Sarah's link, then use SUMMER20 at checkout. *Expect:* `attributed via link`. `no_referral_code`
would be a real bug.

**C4. Lowercase link, the order half.** Visit `?ref=sarahq7x2` and buy. *Expect:* attributed via
link. (Its click is now counted — fixed and checked on 14 October.)

**C5. Mixed order.** The Snowboard plus one other product, through the cart. *Expect:* 20% on the
Snowboard line and 13% on the other.

**C6. Minimum order value.** Set a minimum above a cheap product's price (B1) and buy it. *Expect:*
commission 0.

**C7. New vs returning.** Use a **brand-new** customer email and order twice through Sarah's link.
*Expect:* the first log line ends `new customer (commission N)` at 15%; the second says
`returning customer` (at 13% unless you set a returning rate in B1). Shopify stopped sending the
order count in order webhooks in 2025, and before the 13 October fix every order silently got 13%.
If neither "new customer" nor "returning customer" appears for a buyer with an account, send me the
line.

**C9. Partial refund.** *Expect:* the commission drops; the referral is untouched.

**C10. Full refund.** *Expect:* commission 0 and Declined; the referral is untouched.

**C11. Cancellation.** Cancel a referred order. *Expect:* the same as C10, via `orders/cancelled`.

**C12. Refund after payout.** Pay a commission out (create a payout, mark it paid), then refund the
order. *Expect:* the amount stays at what was paid; Commissions shows "Owes back PKR X" on Sarah's
row; her portal's Payouts page shows a "Balance owed back" card. If the commission was inside an
unsent payout instead, *expect* that payout's total to drop.

**C13. Refund one product of a mixed order.** *Expect:* only that product's commission is removed,
worked out from its line, not the order total scaled down.

**C14. Shipping-only refund on a coupon order.** *(Needs A3.)* A mixed order with SARAHQ7X2, then
refund shipping only. *Expect:* `-> no_change`.

**C15. A refund before payout isn't a debt.** Refund part of an order while its commission is still
pending, then approve and pay it. *Expect:* no "Owes back" and no "Balance owed back"; the earnings
row reads "Was PKR X · PKR Y refunded before payout".

**C16. A rate change doesn't reach old orders.** With a pending commission on some order, change the
program's standard rate, then partially refund that order. *Expect:* the new figure uses the rate
the order was placed under.

**C17. Last click wins.** Needs a second active creator: approve Mike (after D14, which needs him
rejected first). In one browser visit Mike's link, then Sarah's, then buy. *Expect:* Sarah
credited.

---

## D. Creator portal, desktop

**D1. Dark mode, one screen left.** Every page has been checked in dark mode except the Payouts
empty state's envelope illustration. Approve Mike, sign in as him, open Payouts in dark mode.
*Expect:* the envelope stands out from the background.

**D2. Navigation and loading.** Click through the sidebar pages. *Expect:* the active page
highlighted; a skeleton while loading (throttle the network in devtools to see it); no full-page
flash.

**D7. Link builder by hand.** Share → "Link to any page". Paste a real product URL → a tracked link
appears as you type. Then try a URL from another site (*expect* a refusal naming that domain), a
link that already has `?ref=SOMEONEELSE` (*expect* only Sarah's code), `/collections/all` (*expect*
it resolves against the store), and an empty box (*expect* the home page link). The logic has unit
tests; this checks the screen.

**D8. Scan the QR code.** Share → Show QR code, and scan it with your phone. *Expect:* it opens the
store with `?ref=SARAHQ7X2`. The encoded bytes are proven correct; only a real scan proves the size
and contrast work. Try it in dark mode too.

**D14. Rejection reason reaches the creator.** After B4, sign in as Mike. *Expect:* your reason
quoted under the Rejected badge, attributed to "Quickstart (65d173cf)". Reactivate him → *expect*
the reason gone.

**D18. Screen reader.** Windows Narrator (Ctrl+Win+Enter). Submit the sign-in form with a wrong
password. *Expect:* the error is read aloud.

**D22. Theme switcher.** Sidebar foot → Light / Auto / Dark. *Expect:* each applies at once and
survives a reload; Auto follows the system setting. (It's currently clipped — see R.)

**D23. Earnings filters and search.** Earnings → click Approved, Paid and Declined. *Expect:* the
list and counts match the chip. Search `#1763` → *expect* that one row; clear → *expect* all three.

---

## E. Creator portal, on your phone

**E2. Phone menu.** Tap the menu button top-left. *Expect:* a drawer with every page that closes on
a tap outside, and a working Share button in the top bar.

**E3. Form focus.** Save a Settings form. *Expect:* the page moves to the result message, so you
aren't left wondering whether it saved.

**E5. Native sharing.** On the Overview, tap **Share** next to the referral link. *Expect:* your
phone's share sheet with the link in it; cancelling does nothing. On a desktop browser without a
share sheet, only Copy shows.

---

## Not bugs — please don't report these

- **No "Forgot password" link.** Blocked on email (H1); a locked-out creator needs a database script.
- **A throttled sign-in refuses even the right password.** The limit is checked before the password,
  so guessing right can't unlock it. Delete the rows in `LoginAttempt` to clear it early.
- **Anyone who knows a creator's email can lock them out for 15 minutes.** The standard cost of
  having a limit; the per-IP limit catches repeat offenders.
- **Approve and Reactivate don't ask for confirmation.** They're additive and easy to undo.
- **PKR shows no decimals** ("PKR 102" for 102.17). Correct for the currency; the stored value is
  exact.
- **Browsers signed in before 13 October are signed out once.** Sessions now carry a password stamp.

---

## Already verified — skip these

| When | What | How |
|---|---|---|
| 14 Oct | Setup S0–S4, A1, A2 | Live store and database |
| 14 Oct | **C8** three visits to Sarah's link → one click; cookies and the `_pl_ref` cart attribute set; the click half of **C4** | Headless browser on the live storefront, read back from the database |
| 14 Oct | **D3** earnings explanations, **D4** payouts, **D5** How you earn, **D6** product link, **D11** Mike reaches Settings, **D12** pending screen, **E4** trend with no fake bars | Real portal, real data, signed in as Sarah and Mike |
| 14 Oct | Every portal page in light and dark, phone and desktop; no sideways scroll on phones (E1); 404 (D16); day-one card and empty states (D13); open redirect (D21); signup and sign-in share the attempt limit (D15, D20); password change signs other devices out (D9, D19); blank payout form refused (D10); one-click join for a signed-in creator (D17); paused creators keep earnings and payouts | Real browser against a private copy with made-up data |
| 13 Oct | Every GraphQL query and the coupon input against Shopify's schema; refund re-pricing end to end; payout double-click race; coupon create, update and retire; custom-domain links; open redirect; session revocation | `npm test`, each test proven to fail with its bug put back |
| 8 Sep | Refund display (unpaid and frozen-after-payout), payout totals after a refund, "Owes back" per creator, pagination, every sign-in throttle branch, every form validation path, QR encoding, coupon precedence against real data, copy announcements | Seeded data and scripted requests |

Bugs that testing found on 14 October, both fixed: **lowercase links weren't counted as clicks**
(order attributed, click dropped; fixed in `tracking.server.js`, covered by `tests/tracking.test.js`),
and **the redesigned Overview threw a React hydration error on every load** (fixed in
`components/copy-field.tsx`).

---

## Found in testing, not fixed yet

Small issues in the in-progress portal redesign, for whoever is building it.

- **A wrong rule on How you earn.** "Checkout code precedence" says a checkout code beats the link if
  it's "another creator's discount code *or an exclusive coupon*". Only another creator's code does;
  an ordinary store coupon never takes the credit from the link. Drop "or an exclusive coupon".
- **The theme switcher is clipped.** Light / Auto / Dark don't fit beside Settings in the 256px
  sidebar.
- **"New" on a zero.** The trend labels PKR 0 commission "New" when there's no previous period.
- **The worked example is generic.** "PKR 100 → 13%" never shows the 15% or 20% rule winning.
- **"Filter" submits the order search.** It should say "Search".
- **"according to their payout schedule".** There's no schedule; payouts are manual.

---

## Open decisions — these need you, not testing

IDs are kept from the earlier file; H6 (stat tile order) and H7 (paused-program notice) are retired.

**H1. Email delivery.** Password reset and email verification wait on a PartnerLoop sending domain
with SPF/DKIM. The eSync Gmail SMTP works, but creator password resets from `naksonservice@gmail.com`
look like phishing and can't be domain-aligned. Decided shape: a 6-digit code, not a link.

**H2. `application_url` is still `https://example.com`** in `shopify.app.toml`. A real blocker: a
bare `shopify app deploy` pushes the placeholder and breaks installs.

**H3. `BILLING_GATE_ENABLED` is `"false"`.** Plans are configured, so it's safe to switch on before
submission.

**H4. Repo and policy housekeeping.** `SUPPORT_EMAIL` is unset, README and CHANGELOG are still the
Shopify template, and `/privacy` should get one read-through against the app before submission.

**H5. Pending-screen timing.** No timescale is promised to applicants on purpose. Pick a number if
you want one.

**H8. Should a program with paid commissions be deletable?** Deleting one erases its creators'
commissions and payouts. Codes are now retired first. I'd block deletion once commissions exist.

**H9. Protected Customer Data access.** Shopify blocks webhooks and queries that touch customer or
order data until it approves this (a separate review). Dev stores are exempt, which is why it works
now. Request it in Partner Dashboard → API access → Protected customer data; Level 1 should do.

**H10. Commit today's fixes.** The click-tracking fix and its test, and the hydration fix, are
uncommitted. Also untrack `dev.log` (`git rm --cached dev.log`) and add it to `.gitignore`.

**H11. One dependency advisory left open.** `deepmerge-ts`, inside Prisma's CLI, has a
denial-of-service advisory whose only fix is a major Prisma upgrade. It isn't in either app's
request path.

**H12. Creators see no privacy notice or terms.** The portal collects names, emails and payment
details, and links to neither. The wording is yours; the links are quick once it exists.

**H13. Creators can't delete their account or leave a program.** Deleting an account would also
delete the merchant's payout records, so decide: delete everything, anonymise the payout records, or
send deletion requests to the merchant.

**H14. The address creators are told to email.** The pending screen shows
**nakson.service@gmail.com**, your store's contact email in Shopify. Change it there, or ask for a
separate creator-support address.
