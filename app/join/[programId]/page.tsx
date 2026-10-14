import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CommissionConfig } from "@prisma/client";
import prisma from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { storeDisplayName } from "@/lib/store-name";
import { getSessionAccountId } from "@/lib/session";
import { RegistrationForm } from "./registration-form";
import { JoinAsMemberForm } from "./join-as-member";

// Applications depend on live program state, so never serve this from the cache.
export const dynamic = "force-dynamic";

function commissionSummary(
  config: CommissionConfig | null,
  currencyCode: string,
): string | null {
  if (!config) return null;

  switch (config.type) {
    case "PERCENTAGE":
      return `${config.amount}% of every sale you refer`;
    case "FIXED_PER_ORDER":
      return `${formatMoney(config.amount, currencyCode)} for every order you refer`;
    case "FIXED_PER_ITEM":
      return `${formatMoney(config.amount, currencyCode)} for every item sold`;
    default:
      return null;
  }
}

async function loadProgram(programId: string) {
  return prisma.program.findUnique({
    where: { id: programId },
    include: {
      commissionConfig: true,
      trackingConfig: true,
      store: { select: { shop: true, name: true, currencyCode: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/join/[programId]">): Promise<Metadata> {
  const { programId } = await params;
  const program = await loadProgram(programId);

  if (!program) return { title: "Program not found" };

  return {
    title: `Join ${program.name} · ${storeDisplayName(program.store)}`,
    description: program.description ?? `Apply to become a creator for ${storeDisplayName(program.store)}.`,
  };
}

export default async function JoinProgramPage({ params }: PageProps<"/join/[programId]">) {
  const { programId } = await params;
  const program = await loadProgram(programId);

  if (!program) notFound();

  const storeName = storeDisplayName(program.store);
  const commission = commissionSummary(program.commissionConfig, program.store.currencyCode);
  const couponTracking = program.trackingConfig?.couponTrackingEnabled ?? false;
  const isOpen = program.status === "ACTIVE";

  // Someone already signed in is an existing creator joining another program:
  // the signup form would ask them for details the account already has.
  const accountId = await getSessionAccountId();
  const signedIn = accountId
    ? await prisma.creatorAccount.findUnique({
        where: { id: accountId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          memberships: { where: { programId: program.id }, select: { id: true } },
        },
      })
    : null;
  const existingMembership = signedIn?.memberships[0] ?? null;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Program summary */}
        <aside className="flex flex-col gap-6 bg-linear-to-br from-indigo-700 via-indigo-800 to-slate-950 p-8 text-white sm:p-10">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Creator program
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight">{program.name}</h1>
            <p className="text-sm text-indigo-100">by {storeName}</p>
          </div>

          {program.description ? (
            <p className="text-xs leading-relaxed text-indigo-50/90">{program.description}</p>
          ) : null}

          {commission ? (
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                You earn
              </p>
              <p className="mt-1 text-base font-extrabold">{commission}</p>
            </div>
          ) : null}

          <ul className="mt-auto flex flex-col gap-3 text-xs text-indigo-50/90">
            <Benefit>Your own referral link, tracked automatically</Benefit>
            {couponTracking ? (
              <Benefit>A personal discount code to share with your audience</Benefit>
            ) : null}
            <Benefit>A real-time dashboard showing every order and payout</Benefit>
          </ul>
        </aside>

        {/* Application */}
        <section className="p-8 sm:p-10">
          {isOpen ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-bold tracking-tight text-ink">
                  Apply to join
                </h2>
                <p className="text-xs text-ink-muted">
                  Takes less than a minute. {storeName} reviews every application.
                </p>
              </div>

              {existingMembership ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs leading-relaxed text-ink-muted">
                    You&apos;re already a member of this program.
                  </p>
                  <Link
                    href={`/dashboard?program=${existingMembership.id}`}
                    className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover"
                  >
                    Go to your dashboard
                  </Link>
                </div>
              ) : signedIn ? (
                <JoinAsMemberForm
                  programId={program.id}
                  name={`${signedIn.firstName} ${signedIn.lastName}`.trim()}
                  email={signedIn.email}
                  storeName={storeName}
                />
              ) : (
                <RegistrationForm programId={program.id} storeName={storeName} />
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-ink">
                Applications are closed
              </h2>
              <p className="text-xs leading-relaxed text-ink-muted">
                {storeName} isn&apos;t accepting new creators for this program right now. Check
                back later, or reach out to them directly if you were invited.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-3.5 w-3.5 flex-none text-indigo-300"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
