import { Suspense } from "react";
import { requireCreatorAccount } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { DashboardShell, type ShellMembership } from "./dashboard-shell";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  // `getCreatorAccount` is React-cached, so the page inside reuses this result
  // rather than issuing the same query again.
  const account = await requireCreatorAccount();

  const memberships: ShellMembership[] = account.memberships.map((m) => ({
    id: m.id,
    status: m.status,
    approvedAt: m.approvedAt,
    program: {
      id: m.program.id,
      name: m.program.name,
      status: m.program.status,
      store: {
        shop: m.program.store.shop,
        name: m.program.store.name,
      },
    },
  }));

  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <DashboardShell
        account={{
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
        }}
        memberships={memberships}
        signOutAction={signOut}
      >
        {children}
      </DashboardShell>
    </Suspense>
  );
}
