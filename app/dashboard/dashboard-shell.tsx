"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "@/components/icon";
import { Badge } from "@/components/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { storeDisplayName } from "@/lib/store-name";
import { membershipLabel, membershipTone } from "@/lib/earning-status";

export type ShellMembership = {
  id: string;
  status: string;
  approvedAt: Date | string | null;
  program: {
    id: string;
    name: string;
    status: string;
    store: {
      shop: string;
      name: string | null;
    };
  };
};

export type ShellAccount = {
  firstName: string;
  lastName: string;
  email: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  requiresApproval?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Home",
    items: [{ href: "/dashboard", label: "Overview", icon: "overview" }],
  },
  {
    title: "Promote",
    items: [{ href: "/dashboard/links", label: "Share", icon: "share", requiresApproval: true }],
  },
  {
    title: "Money",
    items: [
      { href: "/dashboard/earnings", label: "Earnings", icon: "earnings" },
      { href: "/dashboard/payouts", label: "Payouts", icon: "payouts" },
    ],
  },
  {
    title: "Program",
    items: [{ href: "/dashboard/program", label: "How you earn", icon: "program" }],
  },
];

function withProgram(href: string, programId: string | null): string {
  return programId ? `${href}?program=${encodeURIComponent(programId)}` : href;
}

export function DashboardShell({
  account,
  memberships,
  defaultMembershipId,
  signOutAction,
  children,
}: {
  account: ShellAccount;
  memberships: ShellMembership[];
  defaultMembershipId: string | null;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [switcherOpen, setSwitcherOpen] = React.useState(false);

  const closeOverlays = () => {
    setDrawerOpen(false);
    setSwitcherOpen(false);
  };

  // The phone drawer is a modal. Focus moves into it when it opens and stays
  // there; closing it with Escape, the close button or the backdrop puts focus
  // back on the menu button. Following a link doesn't: that's a new page.
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const switcherRef = React.useRef<HTMLDivElement>(null);
  const restoreFocusRef = React.useRef(false);

  const closeDrawer = () => {
    restoreFocusRef.current = true;
    setDrawerOpen(false);
  };

  // Close switcher when clicking outside
  React.useEffect(() => {
    if (!switcherOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [switcherOpen]);

  // Close drawer on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen((open) => {
          if (open) restoreFocusRef.current = true;
          return false;
        });
        setSwitcherOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!drawerOpen) {
      if (restoreFocusRef.current) menuButtonRef.current?.focus();
      restoreFocusRef.current = false;
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    if (!drawer) {
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    const focusable = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])',
        ),
      );
    focusable()[0]?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", trap);
    };
  }, [drawerOpen]);

  const requestedId = searchParams.get("program");
  const activeMembership =
    memberships.find((m) => m.id === (requestedId ?? defaultMembershipId)) ??
    memberships[0] ??
    null;

  const currentProgramId = activeMembership?.id ?? null;
  const isApproved = activeMembership?.status === "ACTIVE";
  const hasHistory =
    activeMembership &&
    (activeMembership.status === "INACTIVE" || activeMembership.status === "REJECTED") &&
    activeMembership.approvedAt != null;

  const storeName = activeMembership
    ? storeDisplayName(activeMembership.program.store)
    : "PartnerLoop";

  // Derive active page title for mobile top bar
  const currentNav = NAV_GROUPS.flatMap((g) => g.items).find((item) =>
    item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href),
  );
  const pageTitle = pathname.startsWith("/dashboard/settings")
    ? "Settings"
    : currentNav?.label ?? "Dashboard";

  const renderNavContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-6 p-4">
        {/* Store & Program Context (SH-1, SH-3) */}
        <div className="relative">
          {activeMembership ? (
            <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-muted/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-brand-surface text-brand-text">
                    <Icon name="store" className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-xs font-bold text-ink" title={storeName}>
                    {storeName}
                  </span>
                </div>
                <Badge tone={membershipTone(activeMembership.status)}>
                  {membershipLabel(activeMembership.status)}
                </Badge>
              </div>

              {memberships.length > 1 ? (
                <div ref={switcherRef} className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setSwitcherOpen(!switcherOpen)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-left text-xs font-medium text-ink transition hover:border-ink-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
                    aria-expanded={switcherOpen}
                    aria-label="Switch creator program"
                  >
                    <span className="truncate">{activeMembership.program.name}</span>
                    <Icon name="chevronUpDown" className="h-3.5 w-3.5 flex-none text-ink-subtle" />
                  </button>

                  {switcherOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 flex flex-col gap-1 rounded-xl border border-line bg-surface p-1.5 shadow-lg">
                      <p className="px-2 py-1 text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
                        Your programs
                      </p>
                      {memberships.map((m) => {
                        const isCurrent = m.id === activeMembership.id;
                        return (
                          <Link
                            key={m.id}
                            href={withProgram(pathname, m.id)}
                            onClick={closeOverlays}
                            className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                              isCurrent
                                ? "bg-brand-surface text-brand-text font-semibold"
                                : "text-ink hover:bg-surface-muted"
                            }`}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="truncate font-semibold">{m.program.name}</span>
                              <span className="truncate text-[11px] text-ink-subtle">
                                {storeDisplayName(m.program.store)}
                              </span>
                            </div>
                            <Badge tone={membershipTone(m.status)}>
                              {membershipLabel(m.status)}
                            </Badge>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p className="truncate text-xs font-semibold text-ink-muted">
                  {activeMembership.program.name}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-ink">
                P
              </span>
              <span className="font-bold tracking-tight text-ink">PartnerLoop</span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav aria-label="Portal Navigation" className="flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-1">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                {group.title}
              </span>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  // AU-5: Check if non-active membership can access this tab
                  const isBlocked =
                    (!isApproved && !hasHistory && item.href !== "/dashboard") ||
                    (!isApproved && hasHistory && item.requiresApproval);

                  if (isBlocked) {
                    return (
                      <span
                        key={item.href}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-ink-subtle/60 cursor-not-allowed"
                        title="Available once your membership is approved"
                        aria-disabled="true"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon name={item.icon} className="h-4 w-4 opacity-50" />
                          <span>{item.label}</span>
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-ink-subtle/50">
                          Locked
                        </span>
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={withProgram(item.href, currentProgramId)}
                      onClick={closeOverlays}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold motion-safe:transition ${
                        active
                          ? "bg-brand text-brand-ink shadow-xs"
                          : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                      }`}
                    >
                      <Icon name={item.icon} className="h-4 w-4 flex-none" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Account Menu & Footer (SH-4, SH-5, DS-5) */}
      <div className="border-t border-line p-4 flex flex-col gap-3">
        {/* Creator Identity */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-surface font-semibold text-xs text-brand-text">
            {account.firstName.charAt(0)}
            {account.lastName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-bold text-ink">
              {account.firstName} {account.lastName}
            </span>
            <span className="truncate text-[11px] text-ink-subtle" title={account.email}>
              {account.email}
            </span>
          </div>
        </div>

        {/* Quick Settings & Theme — stacked: side by side, the three theme
            options don't fit the 256px sidebar and "Dark" was cut off. */}
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={withProgram("/dashboard/settings", currentProgramId)}
            onClick={closeOverlays}
            aria-current={pathname.startsWith("/dashboard/settings") ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold motion-safe:transition ${
              pathname.startsWith("/dashboard/settings")
                ? "bg-brand-surface text-brand-text font-bold"
                : "text-ink-muted hover:text-ink hover:bg-surface-muted"
            }`}
          >
            <Icon name="settings" className="h-3.5 w-3.5" />
            <span>Settings</span>
          </Link>

          <ThemeToggle className="w-full" />
        </div>

        {/* Sign out form */}
        <form action={signOutAction} className="w-full pt-1">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted motion-safe:transition hover:border-ink-subtle hover:text-ink hover:bg-surface-muted cursor-pointer"
          >
            <Icon name="signOut" className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </form>

        {/* Quiet PartnerLoop mark */}
        <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-ink-subtle">
          <span>Powered by</span>
          <span className="font-semibold text-ink">PartnerLoop</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* Desktop Sidebar (SH-1, SH-3) */}
      <aside className="hidden lg:flex w-64 flex-none flex-col border-r border-line bg-surface sticky top-0 h-screen overflow-y-auto z-10">
        {renderNavContent()}
      </aside>

      {/* Mobile Top Bar (SH-2, RS-2) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 border-b border-line bg-surface/90 backdrop-blur-md px-4 flex items-center justify-between z-30">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
          aria-label="Open portal navigation"
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation-drawer"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center min-w-0">
          <span className="text-xs font-bold text-ink truncate">{pageTitle}</span>
          <span className="text-[10px] text-ink-subtle truncate">{storeName}</span>
        </div>

        {isApproved ? (
          <Link
            href={withProgram("/dashboard/links", currentProgramId)}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-brand-surface px-2.5 text-xs font-semibold text-brand-text hover:bg-brand-line focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
          >
            <Icon name="share" className="h-3.5 w-3.5" />
            <span>Share</span>
          </Link>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Mobile Drawer (RS-2) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            ref={drawerRef}
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface shadow-2xl flex flex-col z-50 animate-drawer-in"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Menu
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
                aria-label="Close navigation drawer"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderNavContent()}</div>
          </div>
        </div>
      )}

      {/* Main Content Area (SH-7, RS-4) */}
      <div className="flex-1 min-w-0 flex flex-col pt-14 lg:pt-0">
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
