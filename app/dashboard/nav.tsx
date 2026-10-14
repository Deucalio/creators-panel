"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "@/components/icon";

type NavMembership = {
  id: string;
  status: string;
  program: { name: string };
};

// Settings is not here on purpose: it belongs to the account rather than to a
// program, so it lives as a header link instead. Order follows the creator's
// question order — how am I doing, what am I owed, what was I paid, on what
// terms, and how do I get more of it.
const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard/earnings", label: "Earnings", icon: "earnings" },
  { href: "/dashboard/payouts", label: "Payouts", icon: "payouts" },
  { href: "/dashboard/program", label: "How you earn", icon: "program" },
  { href: "/dashboard/links", label: "Share", icon: "share" },
];

/**
 * Every link in the portal has to carry `?program=` forward.
 *
 * A layout cannot read searchParams in the App Router, so the tab strip and the
 * switcher are client components reading it directly. Dropping the parameter
 * would silently bounce a multi-program creator back to their default program
 * on every tab change.
 */
function withProgram(href: string, programId: string | null): string {
  return programId ? `${href}?program=${encodeURIComponent(programId)}` : href;
}

export function DashboardTabs() {
  const pathname = usePathname();
  const programId = useSearchParams().get("program");

  return (
    <nav aria-label="Sections" className="-mb-px flex gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        // "/dashboard" is a prefix of every other tab, so it needs an exact
        // match while the rest match their subtree.
        const active =
          tab.href === "/dashboard" ? pathname === tab.href : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={withProgram(tab.href, programId)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
              active
                ? "border-brand text-brand-text"
                : "border-transparent text-ink-muted hover:border-line hover:text-ink"
            }`}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ProgramSwitcher({
  memberships,
  defaultId,
}: {
  memberships: NavMembership[];
  defaultId: string;
}) {
  const pathname = usePathname();
  const selected = useSearchParams().get("program") ?? defaultId;

  // Settings is account-wide, so a program switcher there would be a control
  // that visibly does nothing.
  if (pathname.startsWith("/dashboard/settings")) return null;

  return (
    <nav aria-label="Your programs" className="flex flex-wrap gap-2">
      {memberships.map((membership) => {
        const active = membership.id === selected;
        return (
          <Link
            key={membership.id}
            // Switching program keeps you on the tab you were reading.
            href={withProgram(pathname, membership.id)}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              active
                ? "bg-brand text-brand-ink"
                : "border border-line bg-surface text-ink-muted hover:text-ink"
            }`}
          >
            {membership.program.name}
          </Link>
        );
      })}
    </nav>
  );
}
