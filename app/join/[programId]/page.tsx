import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CommissionConfig } from "@prisma/client";
import prisma from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { RegistrationForm } from "./registration-form";

// Applications depend on live program state, so never serve this from the cache.
export const dynamic = "force-dynamic";

function storeDisplayName(shop: string): string {
  return shop.replace(/\.myshopify\.com$/, "");
}

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
      store: { select: { shop: true, currencyCode: true } },
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
    title: `Join ${program.name} · ${storeDisplayName(program.store.shop)}`,
    description: program.description ?? `Apply to become a creator for ${storeDisplayName(program.store.shop)}.`,
  };
}

export default async function JoinProgramPage({ params }: PageProps<"/join/[programId]">) {
  const { programId } = await params;
  const program = await loadProgram(programId);

  if (!program) notFound();

  const storeName = storeDisplayName(program.store.shop);
  const commission = commissionSummary(program.commissionConfig, program.store.currencyCode);
  const couponTracking = program.trackingConfig?.couponTrackingEnabled ?? false;
  const isOpen = program.status === "ACTIVE";

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 font-sans sm:py-16">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-zinc-200/60 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Program summary */}
        <aside className="flex flex-col gap-6 bg-linear-to-br from-blue-600 to-blue-900 p-8 text-white sm:p-10">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Creator program
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight">{program.name}</h1>
            <p className="text-sm text-blue-100">by {storeName}</p>
          </div>

          {program.description ? (
            <p className="text-sm leading-relaxed text-blue-50/90">{program.description}</p>
          ) : null}

          {commission ? (
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                You earn
              </p>
              <p className="mt-1 text-lg font-bold">{commission}</p>
            </div>
          ) : null}

          <ul className="mt-auto flex flex-col gap-3 text-sm text-blue-50/90">
            <Benefit>Your own referral link, tracked automatically</Benefit>
            {couponTracking ? (
              <Benefit>A personal discount code to share with your audience</Benefit>
            ) : null}
            <Benefit>A dashboard showing every sale and commission you earn</Benefit>
          </ul>
        </aside>

        {/* Application */}
        <section className="p-8 sm:p-10">
          {isOpen ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                  Apply to join
                </h2>
                <p className="text-sm text-zinc-600">
                  Takes a minute. {storeName} reviews every application.
                </p>
              </div>

              <RegistrationForm programId={program.id} storeName={storeName} />
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                Applications are closed
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600">
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
        className="mt-0.5 h-4 w-4 flex-none text-blue-200"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
