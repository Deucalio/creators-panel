"use client";

import React, { useState, useEffect, useTransition, useId } from "react";
import Link from "next/link";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  updatePayoutDetails,
  removePayoutDetails,
} from "./actions";
import {
  PAKISTAN_BANKS,
  formatMobile,
  validMobile,
  formatIban,
  validIban,
  validTitle,
  validBankName,
  parsePayoutDetails,
} from "@/lib/pakistan-payouts";
import { matchPayoutMethod } from "@/lib/payout-methods";

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------ */

type TabKey = "profile" | "payouts" | "email" | "password";

export type SettingsClientProps = {
  account: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payout: {
    method: string | null;
    details: string | null;
  } | null;
  programId?: string;
  activeProgramName?: string;
};

type ToastItem = {
  id: string;
  message: string;
  removing: boolean;
};

/* ------------------------------------------------------------------
   Logos for Payment Brands
------------------------------------------------------------------ */

export function EasypaisaLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 130 36" aria-hidden="true">
      <rect width="130" height="36" rx="18" fill="#2db84d" />
      <circle cx="18" cy="18" r="12" fill="#fff" />
      <path
        d="M12.6 18.2h10.8A5.4 5.4 0 1 0 22 22.1"
        fill="none"
        stroke="#1c9a3d"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <text
        x="36"
        y="23.2"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="15.5"
        fontWeight="700"
        letterSpacing="-.2"
        fill="#fff"
      >
        easypaisa
      </text>
    </svg>
  );
}

export function JazzCashLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 126 36" aria-hidden="true">
      <rect width="126" height="36" rx="18" fill="#e8262d" />
      <circle cx="13" cy="12" r="2.6" fill="#ff8f94" />
      <circle cx="20.5" cy="25" r="3.4" fill="#ffc72c" />
      <text
        x="30"
        y="24"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="16.5"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="-.3"
      >
        <tspan fill="#ffc72c">Jazz</tspan>
        <tspan fill="#fff">Cash</tspan>
      </text>
    </svg>
  );
}

export function BankLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 146 36" aria-hidden="true">
      <rect width="146" height="36" rx="18" fill="#4a5a7c" />
      <g
        transform="translate(9 6)"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 10L12 4l10 6" />
        <path d="M4.5 11v8M9.5 11v8M14.5 11v8M19.5 11v8M2 21.5h20" />
      </g>
      <text
        x="38"
        y="23"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="13.5"
        fontWeight="700"
        fill="#fff"
      >
        Bank transfer
      </text>
    </svg>
  );
}

const LOGOS: Record<string, (cls?: string) => React.ReactNode> = {
  easypaisa: (cls = "h-8 w-auto") => <EasypaisaLogo className={cls} />,
  jazzcash: (cls = "h-8 w-auto") => <JazzCashLogo className={cls} />,
  bank: (cls = "h-8 w-auto") => <BankLogo className={cls} />,
};

/* ------------------------------------------------------------------
   Icons
------------------------------------------------------------------ */

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function EyeOffIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

function SpinnerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Password Strength Helpers
------------------------------------------------------------------ */

const PW_RULES = {
  length: (v: string) => v.length >= 8,
  case: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  digit: (v: string) => /[\d\W_]/.test(v),
};

const STRENGTH_LEVELS = ["", "Weak", "Fair", "Good", "Strong"];

function computeStrength(v: string): number {
  if (!v) return 0;
  if (v.length < 8) return 1;
  let score = 1;
  if (PW_RULES.case(v)) score++;
  if (PW_RULES.digit(v)) score++;
  if (v.length >= 12) score++;
  return Math.min(4, score);
}

/* ------------------------------------------------------------------
   Main Settings Client Component
------------------------------------------------------------------ */

export function SettingsClient({
  account,
  payout,
  programId,
  activeProgramName = "Creator Program",
}: SettingsClientProps) {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // Sync hash with active tab
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as TabKey;
      if (["profile", "payouts", "email", "password"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const selectTab = (tab: TabKey) => {
    setActiveTab(tab);
    try {
      window.history.replaceState(null, "", `#${tab}`);
    } catch {
      // ignore in iframe environments
    }
  };

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toast = (message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, removing: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, removing: true } : t)),
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3600);
  };

  /* ------------------------------------------------------------------
     1. Profile Form State
  ------------------------------------------------------------------ */
  const [profileSaved, setProfileSaved] = useState({
    first: account.firstName,
    last: account.lastName,
  });
  const [profileDraft, setProfileDraft] = useState({
    first: account.firstName,
    last: account.lastName,
  });
  const [profileErrors, setProfileErrors] = useState<{ first?: string; last?: string }>({});
  const [profilePending, startProfileTransition] = useTransition();

  const isProfileDirty =
    profileDraft.first.trim() !== profileSaved.first ||
    profileDraft.last.trim() !== profileSaved.last;

  const previewFullName = `${profileDraft.first.trim()} ${profileDraft.last.trim()}`.trim() || "Your name";
  const previewInitials =
    ((profileDraft.first.trim()[0] || "") + (profileDraft.last.trim()[0] || "")).toUpperCase() || "?";

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const firstTrimmed = profileDraft.first.trim();
    const lastTrimmed = profileDraft.last.trim();
    const errs: { first?: string; last?: string } = {};

    if (!firstTrimmed) errs.first = "Enter your first name.";
    if (!lastTrimmed) errs.last = "Enter your last name.";

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});

    startProfileTransition(async () => {
      const fd = new FormData();
      fd.set("firstName", firstTrimmed);
      fd.set("lastName", lastTrimmed);
      const res = await updateProfile({ status: "idle" }, fd);
      if (res.status === "success") {
        setProfileSaved({ first: firstTrimmed, last: lastTrimmed });
        setProfileDraft({ first: firstTrimmed, last: lastTrimmed });
        toast("Name updated");
      } else if (res.status === "error") {
        setProfileErrors({ first: res.message });
      }
    });
  };

  /* ------------------------------------------------------------------
     2. Payouts Form State
  ------------------------------------------------------------------ */
  const initialMatched = matchPayoutMethod(payout?.method);
  const initialKey = initialMatched === "Easypaisa" ? "easypaisa" : initialMatched === "JazzCash" ? "jazzcash" : "bank";
  const initialParsed = parsePayoutDetails(payout?.method, payout?.details);

  const [payoutSaved, setPayoutSaved] = useState<{
    method: "Easypaisa" | "JazzCash" | "Bank transfer" | null;
    key: "easypaisa" | "jazzcash" | "bank" | null;
    details: typeof initialParsed;
  }>({
    method: initialMatched,
    key: initialMatched ? initialKey : null,
    details: initialParsed,
  });

  const [draftMethod, setDraftMethod] = useState<"easypaisa" | "jazzcash" | "bank">(initialKey);
  const [draftDetails, setDraftDetails] = useState<typeof initialParsed>(initialParsed);
  const [payoutTouched, setPayoutTouched] = useState<Set<string>>(new Set());
  const [payoutErrors, setPayoutErrors] = useState<Record<string, string>>({});
  const [payoutPending, startPayoutTransition] = useTransition();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [removePending, startRemoveTransition] = useTransition();

  const isPayoutConfigured = Boolean(payoutSaved.method && payout?.details);

  // Check dirty state for payout
  const isPayoutDirty = (() => {
    if (!payoutSaved.method) {
      // not yet saved: dirty if any current field is filled
      if (draftMethod === "easypaisa") return Boolean(draftDetails.easypaisa.number.trim() || draftDetails.easypaisa.title.trim());
      if (draftMethod === "jazzcash") return Boolean(draftDetails.jazzcash.number.trim() || draftDetails.jazzcash.title.trim());
      if (draftMethod === "bank") return Boolean(draftDetails.bank.bankName.trim() || draftDetails.bank.title.trim() || draftDetails.bank.iban.trim());
      return false;
    }
    if (payoutSaved.key !== draftMethod) return true;
    if (draftMethod === "easypaisa") {
      return (
        draftDetails.easypaisa.number.trim() !== payoutSaved.details.easypaisa.number.trim() ||
        draftDetails.easypaisa.title.trim() !== payoutSaved.details.easypaisa.title.trim()
      );
    }
    if (draftMethod === "jazzcash") {
      return (
        draftDetails.jazzcash.number.trim() !== payoutSaved.details.jazzcash.number.trim() ||
        draftDetails.jazzcash.title.trim() !== payoutSaved.details.jazzcash.title.trim()
      );
    }
    if (draftMethod === "bank") {
      return (
        draftDetails.bank.bankName.trim() !== payoutSaved.details.bank.bankName.trim() ||
        draftDetails.bank.title.trim() !== payoutSaved.details.bank.title.trim() ||
        draftDetails.bank.iban.trim() !== payoutSaved.details.bank.iban.trim()
      );
    }
    return false;
  })();

  const validatePayoutField = (field: string, val: string): string | null => {
    if (draftMethod === "easypaisa" || draftMethod === "jazzcash") {
      if (field === "number") {
        const res = validMobile(val);
        return res === true ? null : res;
      }
      if (field === "title") {
        const res = validTitle(val);
        return res === true ? null : res;
      }
    }
    if (draftMethod === "bank") {
      if (field === "bankName") {
        const res = validBankName(val);
        return res === true ? null : res;
      }
      if (field === "title") {
        const res = validTitle(val);
        return res === true ? null : res;
      }
      if (field === "iban") {
        const res = validIban(val);
        return res === true ? null : res;
      }
    }
    return null;
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (draftMethod === "easypaisa" || draftMethod === "jazzcash") {
      const cur = draftDetails[draftMethod];
      const numErr = validatePayoutField("number", cur.number);
      if (numErr) errs.number = numErr;
      const titleErr = validatePayoutField("title", cur.title);
      if (titleErr) errs.title = titleErr;
    } else {
      const cur = draftDetails.bank;
      const bErr = validatePayoutField("bankName", cur.bankName);
      if (bErr) errs.bankName = bErr;
      const tErr = validatePayoutField("title", cur.title);
      if (tErr) errs.title = tErr;
      const iErr = validatePayoutField("iban", cur.iban);
      if (iErr) errs.iban = iErr;
    }

    if (Object.keys(errs).length > 0) {
      setPayoutErrors(errs);
      return;
    }
    setPayoutErrors({});

    startPayoutTransition(async () => {
      const fd = new FormData();
      const methodName = draftMethod === "easypaisa" ? "Easypaisa" : draftMethod === "jazzcash" ? "JazzCash" : "Bank transfer";
      fd.set("payoutMethod", methodName);

      if (draftMethod === "easypaisa" || draftMethod === "jazzcash") {
        fd.set("number", draftDetails[draftMethod].number.trim());
        fd.set("title", draftDetails[draftMethod].title.trim());
      } else {
        fd.set("bankName", draftDetails.bank.bankName.trim());
        fd.set("title", draftDetails.bank.title.trim());
        fd.set("iban", draftDetails.bank.iban.trim());
      }

      const res = await updatePayoutDetails({ status: "idle" }, fd);
      if (res.status === "success") {
        setPayoutSaved({
          method: methodName,
          key: draftMethod,
          details: { ...draftDetails },
        });
        setPayoutTouched(new Set());
        toast(`${methodName} payout details saved`);
      } else if (res.status === "error") {
        setPayoutErrors({ form: res.message });
      }
    });
  };

  const handleRemovePayout = () => {
    startRemoveTransition(async () => {
      const res = await removePayoutDetails();
      if (res.status === "success") {
        setPayoutSaved({
          method: null,
          key: null,
          details: {
            easypaisa: { number: "", title: "" },
            jazzcash: { number: "", title: "" },
            bank: { bankName: "", title: "", iban: "" },
          },
        });
        setDraftDetails({
          easypaisa: { number: "", title: "" },
          jazzcash: { number: "", title: "" },
          bank: { bankName: "", title: "", iban: "" },
        });
        setIsRemoveDialogOpen(false);
        toast("Payout details removed");
      }
    });
  };

  /* ------------------------------------------------------------------
     3. Email Form State
  ------------------------------------------------------------------ */
  const [emailSaved, setEmailSaved] = useState(account.email);
  const [emailDraft, setEmailDraft] = useState(account.email);
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailErrors, setEmailErrors] = useState<{ email?: string; password?: string }>({});
  const [emailPending, startEmailTransition] = useTransition();

  const isEmailDirty = emailDraft.trim().toLowerCase() !== emailSaved.toLowerCase() || emailPassword.length > 0;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = emailDraft.trim().toLowerCase();
    const errs: { email?: string; password?: string } = {};

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!EMAIL_RE.test(next)) {
      errs.email = "Enter a valid email address.";
    } else if (next === emailSaved.toLowerCase()) {
      errs.email = "That's already your email address.";
    }

    if (!emailPassword) {
      errs.password = "Enter your current password to confirm.";
    }

    if (Object.keys(errs).length > 0) {
      setEmailErrors(errs);
      return;
    }
    setEmailErrors({});

    startEmailTransition(async () => {
      const fd = new FormData();
      fd.set("email", next);
      fd.set("currentPassword", emailPassword);
      const res = await updateEmail({ status: "idle" }, fd);
      if (res.status === "success") {
        setEmailSaved(next);
        setEmailDraft(next);
        setEmailPassword("");
        toast(`Email changed. Sign in with ${next} from now on.`);
      } else if (res.status === "error") {
        if (res.field === "currentPassword") {
          setEmailErrors({ password: res.message });
        } else {
          setEmailErrors({ email: res.message });
        }
      }
    });
  };

  /* ------------------------------------------------------------------
     4. Password Form State
  ------------------------------------------------------------------ */
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [pwPending, startPwTransition] = useTransition();

  const pwStrength = computeStrength(pwNew);
  const isPwDirty = Boolean(pwCurrent || pwNew || pwConfirm);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { current?: string; new?: string; confirm?: string } = {};

    if (!pwCurrent) errs.current = "Enter your current password.";
    if (pwNew.length < 8) {
      errs.new = "Use at least 8 characters.";
    } else if (pwNew === pwCurrent) {
      errs.new = "Choose a password you have not used here before.";
    }
    if (pwConfirm !== pwNew) {
      errs.confirm = "Passwords don't match.";
    }

    if (Object.keys(errs).length > 0) {
      setPwErrors(errs);
      return;
    }
    setPwErrors({});

    startPwTransition(async () => {
      const fd = new FormData();
      fd.set("currentPassword", pwCurrent);
      fd.set("newPassword", pwNew);
      fd.set("confirmPassword", pwConfirm);
      const res = await updatePassword({ status: "idle" }, fd);
      if (res.status === "success") {
        setPwCurrent("");
        setPwNew("");
        setPwConfirm("");
        toast("Password updated. Other devices were signed out.");
      } else if (res.status === "error") {
        if (res.field === "currentPassword") setPwErrors({ current: res.message });
        else if (res.field === "newPassword") setPwErrors({ new: res.message });
        else if (res.field === "confirmPassword") setPwErrors({ confirm: res.message });
        else setPwErrors({ current: res.message });
      }
    });
  };

  const bankDatalistId = useId();

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Link
          href={programId ? `/dashboard?program=${encodeURIComponent(programId)}` : "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition -ml-1 px-1.5 py-1 rounded-lg focus-visible:outline-2 focus-visible:outline-brand"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14.5 6l-6 6 6 6" />
          </svg>
          Back to overview
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">Account settings</h1>
        <p className="mt-2 text-sm text-ink-muted">
          These apply to your PartnerLoop account across every program you belong to.
        </p>
      </div>

      {/* Main Grid: Left Tabs (236px) + Right Panels */}
      <div className="grid gap-6 md:grid-cols-[236px_minmax(0,1fr)] md:gap-10 items-start">
        {/* Navigation Tabs */}
        <nav
          role="tablist"
          aria-label="Account settings sections"
          className="grid grid-cols-4 gap-1.5 md:flex md:flex-col md:gap-2 md:sticky md:top-8"
        >
          {/* Tab 1: Profile */}
          <button
            role="tab"
            type="button"
            onClick={() => selectTab("profile")}
            aria-selected={activeTab === "profile"}
            tabIndex={activeTab === "profile" ? 0 : -1}
            className={`relative flex items-center gap-3 p-2 md:py-2.5 md:px-3 rounded-2xl border text-left transition cursor-pointer ${
              activeTab === "profile"
                ? "bg-surface border-line text-ink shadow-xs"
                : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span
              className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                activeTab === "profile" ? "bg-brand text-brand-ink" : "bg-surface-muted text-ink-muted"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="3.6" />
                <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 hidden md:block">
              <span className="block text-sm font-semibold truncate">Profile</span>
              <span className="block text-xs text-ink-subtle truncate max-w-[130px]">
                {profileSaved.first} {profileSaved.last}
              </span>
            </span>
            {isProfileDirty ? (
              <span className="size-2 rounded-full bg-warn-ink shrink-0 ml-auto" title="Unsaved changes" />
            ) : null}
          </button>

          {/* Tab 2: Payouts */}
          <button
            role="tab"
            type="button"
            onClick={() => selectTab("payouts")}
            aria-selected={activeTab === "payouts"}
            tabIndex={activeTab === "payouts" ? 0 : -1}
            className={`relative flex items-center gap-3 p-2 md:py-2.5 md:px-3 rounded-2xl border text-left transition cursor-pointer ${
              activeTab === "payouts"
                ? "bg-surface border-line text-ink shadow-xs"
                : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span
              className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                activeTab === "payouts" ? "bg-brand text-brand-ink" : "bg-surface-muted text-ink-muted"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="6.5" width="18" height="11" rx="2.5" />
                <circle cx="12" cy="12" r="2.5" />
                <path d="M6.5 12h.01M17.5 12h.01" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 hidden md:block">
              <span className="block text-sm font-semibold truncate">Payouts</span>
              <span className="flex items-center gap-1.5 text-xs text-ink-subtle">
                <span
                  className={`size-1.5 rounded-full shrink-0 ${
                    isPayoutConfigured ? "bg-ok-ink" : "bg-warn-ink"
                  }`}
                />
                <span className="truncate max-w-[120px]">
                  {payoutSaved.method ?? "Add details"}
                </span>
              </span>
            </span>
            {isPayoutDirty ? (
              <span className="size-2 rounded-full bg-warn-ink shrink-0 ml-auto" title="Unsaved changes" />
            ) : null}
          </button>

          {/* Tab 3: Email */}
          <button
            role="tab"
            type="button"
            onClick={() => selectTab("email")}
            aria-selected={activeTab === "email"}
            tabIndex={activeTab === "email" ? 0 : -1}
            className={`relative flex items-center gap-3 p-2 md:py-2.5 md:px-3 rounded-2xl border text-left transition cursor-pointer ${
              activeTab === "email"
                ? "bg-surface border-line text-ink shadow-xs"
                : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span
              className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                activeTab === "email" ? "bg-brand text-brand-ink" : "bg-surface-muted text-ink-muted"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
                <path d="M4 7.5l8 6 8-6" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 hidden md:block">
              <span className="block text-sm font-semibold truncate">Email</span>
              <span className="block text-xs text-ink-subtle truncate max-w-[130px]">
                {emailSaved}
              </span>
            </span>
            {isEmailDirty ? (
              <span className="size-2 rounded-full bg-warn-ink shrink-0 ml-auto" title="Unsaved changes" />
            ) : null}
          </button>

          {/* Tab 4: Password */}
          <button
            role="tab"
            type="button"
            onClick={() => selectTab("password")}
            aria-selected={activeTab === "password"}
            tabIndex={activeTab === "password" ? 0 : -1}
            className={`relative flex items-center gap-3 p-2 md:py-2.5 md:px-3 rounded-2xl border text-left transition cursor-pointer ${
              activeTab === "password"
                ? "bg-surface border-line text-ink shadow-xs"
                : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span
              className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                activeTab === "password" ? "bg-brand text-brand-ink" : "bg-surface-muted text-ink-muted"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
                <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 hidden md:block">
              <span className="block text-sm font-semibold truncate">Password</span>
              <span className="block text-xs text-ink-subtle truncate">
                Security &amp; sign-in
              </span>
            </span>
            {isPwDirty ? (
              <span className="size-2 rounded-full bg-warn-ink shrink-0 ml-auto" title="Unsaved changes" />
            ) : null}
          </button>
        </nav>

        {/* Right Panels Container */}
        <div className="min-w-0">
          {/* =========================================================
              PANEL 1: PROFILE
             ========================================================= */}
          {activeTab === "profile" && (
            <section className="animate-panel-in" role="tabpanel">
              <div className="rounded-2xl border border-line bg-surface p-6 md:p-8 shadow-xs">
                <h2 className="text-xl font-bold tracking-tight text-ink">Profile</h2>
                <p className="mt-1.5 text-sm text-ink-muted">
                  Shown to the merchants whose programs you&apos;ve joined.
                </p>

                {/* "How merchants see you" live preview card */}
                <div className="mt-7 flex items-center gap-4 rounded-2xl bg-surface-muted border border-line p-5">
                  <span className="size-14 rounded-full bg-brand text-brand-ink text-lg font-bold grid place-items-center shrink-0 select-none">
                    {previewInitials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink-subtle">How merchants see you</p>
                    <p className="text-lg font-semibold leading-tight text-ink truncate mt-0.5">
                      {previewFullName}
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      Partner in {activeProgramName}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="mt-6 max-w-lg" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="first-name" className="block text-xs font-semibold text-ink mb-1.5">
                        First name
                      </label>
                      <input
                        id="first-name"
                        type="text"
                        maxLength={40}
                        autoComplete="given-name"
                        value={profileDraft.first}
                        onChange={(e) => {
                          setProfileDraft((prev) => ({ ...prev, first: e.target.value }));
                          if (profileErrors.first) setProfileErrors((prev) => ({ ...prev, first: undefined }));
                        }}
                        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                          profileErrors.first
                            ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                            : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                        }`}
                        aria-invalid={Boolean(profileErrors.first)}
                      />
                      {profileErrors.first ? (
                        <p className="mt-1.5 text-xs text-bad-ink font-medium">{profileErrors.first}</p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="last-name" className="block text-xs font-semibold text-ink mb-1.5">
                        Last name
                      </label>
                      <input
                        id="last-name"
                        type="text"
                        maxLength={40}
                        autoComplete="family-name"
                        value={profileDraft.last}
                        onChange={(e) => {
                          setProfileDraft((prev) => ({ ...prev, last: e.target.value }));
                          if (profileErrors.last) setProfileErrors((prev) => ({ ...prev, last: undefined }));
                        }}
                        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                          profileErrors.last
                            ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                            : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                        }`}
                        aria-invalid={Boolean(profileErrors.last)}
                      />
                      {profileErrors.last ? (
                        <p className="mt-1.5 text-xs text-bad-ink font-medium">{profileErrors.last}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={!isProfileDirty || profilePending}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle cursor-pointer"
                    >
                      {profilePending ? (
                        <>
                          <SpinnerIcon className="size-4" />
                          <span>Saving…</span>
                        </>
                      ) : (
                        <span>Save name</span>
                      )}
                    </button>
                    {isProfileDirty ? (
                      <span className="text-xs text-ink-subtle">Unsaved changes</span>
                    ) : null}
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* =========================================================
              PANEL 2: PAYOUTS ("How you get paid")
             ========================================================= */}
          {activeTab === "payouts" && (
            <section className="animate-panel-in" role="tabpanel">
              <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-ink">How you get paid</h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isPayoutConfigured
                          ? "bg-ok-surface text-ok-ink border-ok-ink/20"
                          : "bg-warn-surface text-warn-ink border-warn-ink/20"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                      <span>{isPayoutConfigured ? "Configured" : "Not set up"}</span>
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    Merchants pay you manually, so they need to know where to send your earnings.
                  </p>

                  {/* Payment Method Selector Grid */}
                  <fieldset className="mt-7">
                    <legend className="block text-xs font-semibold text-ink mb-2">
                      Payment method
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(["easypaisa", "jazzcash", "bank"] as const).map((methodKey) => {
                        const isChecked = draftMethod === methodKey;
                        const label = methodKey === "easypaisa" ? "Easypaisa" : methodKey === "jazzcash" ? "JazzCash" : "Bank transfer";
                        const kind = methodKey === "bank" ? "Bank account" : "Mobile wallet";
                        const blurb = methodKey === "bank" ? "Paid to your IBAN" : "Paid to your wallet number";

                        return (
                          <label
                            key={methodKey}
                            data-method={methodKey}
                            className={`relative flex flex-col justify-between gap-3 p-4 rounded-2xl border transition cursor-pointer select-none ${
                              isChecked
                                ? "border-brand bg-brand-surface/40 shadow-xs ring-1 ring-brand/30"
                                : "border-line-strong bg-surface hover:border-brand/60"
                            }`}
                          >
                            <input
                              type="radio"
                              name="method"
                              value={methodKey}
                              checked={isChecked}
                              onChange={() => {
                                setDraftMethod(methodKey);
                                setPayoutErrors({});
                              }}
                              className="sr-only"
                            />
                            <div className="flex items-start justify-between gap-3">
                              {LOGOS[methodKey]()}
                              <span
                                className={`size-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                                  isChecked
                                    ? "bg-brand border-brand text-white"
                                    : "border-line-strong text-transparent"
                                }`}
                              >
                                <CheckIcon className="size-3" />
                              </span>
                            </div>
                            <div>
                              <span className="sr-only">{label}, </span>
                              <span className="block text-sm font-semibold text-ink">{kind}</span>
                              <span className="block text-xs text-ink-muted mt-0.5">{blurb}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-ink-subtle">
                      Merchants send your earnings themselves, through one of these.
                    </p>
                  </fieldset>

                  {/* Branded Details Panel */}
                  <form onSubmit={handlePayoutSubmit} className="mt-6" noValidate>
                    <div
                      data-method={draftMethod}
                      className="rounded-2xl border border-line-strong overflow-hidden bg-surface-muted/60 transition"
                    >
                      {/* Top accent bar & header */}
                      <div className="h-1 bg-brand w-full" />
                      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-line bg-surface/80">
                        <div className="flex items-center gap-2">
                          {LOGOS[draftMethod]("h-6 w-auto")}
                        </div>
                        <span className="text-xs font-semibold text-ink-muted">
                          Account details
                        </span>
                      </div>

                      <div className="p-5 md:p-6 bg-surface">
                        {payoutErrors.form ? (
                          <div className="mb-4 rounded-xl border border-bad-ink/20 bg-bad-surface p-3 text-xs text-bad-ink font-medium">
                            {payoutErrors.form}
                          </div>
                        ) : null}

                        {/* Fields per method */}
                        {draftMethod === "easypaisa" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="ep-number" className="block text-xs font-semibold text-ink mb-1.5">
                                Easypaisa mobile number
                              </label>
                              <input
                                id="ep-number"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                placeholder="0300 1234567"
                                value={draftDetails.easypaisa.number}
                                onChange={(e) => {
                                  const formatted = formatMobile(e.target.value);
                                  setDraftDetails((prev) => ({
                                    ...prev,
                                    easypaisa: { ...prev.easypaisa, number: formatted },
                                  }));
                                  if (payoutTouched.has("easypaisa.number")) {
                                    const err = validatePayoutField("number", formatted);
                                    setPayoutErrors((prev) => ({ ...prev, number: err || "" }));
                                  }
                                }}
                                onBlur={() => {
                                  setPayoutTouched((prev) => new Set(prev).add("easypaisa.number"));
                                  const err = validatePayoutField("number", draftDetails.easypaisa.number);
                                  setPayoutErrors((prev) => ({ ...prev, number: err || "" }));
                                }}
                                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm tabular-nums text-ink outline-none transition placeholder:text-ink-subtle ${
                                  payoutErrors.number
                                    ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                                    : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                                }`}
                                aria-invalid={Boolean(payoutErrors.number)}
                              />
                              <p className={`mt-1.5 text-xs ${payoutErrors.number ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                                {payoutErrors.number || "The number your Easypaisa account is registered with."}
                              </p>
                            </div>

                            <div>
                              <label htmlFor="ep-title" className="block text-xs font-semibold text-ink mb-1.5">
                                Account title
                              </label>
                              <input
                                id="ep-title"
                                type="text"
                                autoComplete="name"
                                placeholder="Name on the account"
                                value={draftDetails.easypaisa.title}
                                onChange={(e) => {
                                  setDraftDetails((prev) => ({
                                    ...prev,
                                    easypaisa: { ...prev.easypaisa, title: e.target.value },
                                  }));
                                  if (payoutTouched.has("easypaisa.title")) {
                                    const err = validatePayoutField("title", e.target.value);
                                    setPayoutErrors((prev) => ({ ...prev, title: err || "" }));
                                  }
                                }}
                                onBlur={() => {
                                  setPayoutTouched((prev) => new Set(prev).add("easypaisa.title"));
                                  const err = validatePayoutField("title", draftDetails.easypaisa.title);
                                  setPayoutErrors((prev) => ({ ...prev, title: err || "" }));
                                }}
                                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                                  payoutErrors.title
                                    ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                                    : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                                }`}
                                aria-invalid={Boolean(payoutErrors.title)}
                              />
                              <p className={`mt-1.5 text-xs ${payoutErrors.title ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                                {payoutErrors.title || "Exactly as it appears in your Easypaisa app."}
                              </p>
                            </div>
                          </div>
                        )}

                        {draftMethod === "jazzcash" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="jc-number" className="block text-xs font-semibold text-ink mb-1.5">
                                JazzCash mobile number
                              </label>
                              <input
                                id="jc-number"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                placeholder="0300 1234567"
                                value={draftDetails.jazzcash.number}
                                onChange={(e) => {
                                  const formatted = formatMobile(e.target.value);
                                  setDraftDetails((prev) => ({
                                    ...prev,
                                    jazzcash: { ...prev.jazzcash, number: formatted },
                                  }));
                                  if (payoutTouched.has("jazzcash.number")) {
                                    const err = validatePayoutField("number", formatted);
                                    setPayoutErrors((prev) => ({ ...prev, number: err || "" }));
                                  }
                                }}
                                onBlur={() => {
                                  setPayoutTouched((prev) => new Set(prev).add("jazzcash.number"));
                                  const err = validatePayoutField("number", draftDetails.jazzcash.number);
                                  setPayoutErrors((prev) => ({ ...prev, number: err || "" }));
                                }}
                                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm tabular-nums text-ink outline-none transition placeholder:text-ink-subtle ${
                                  payoutErrors.number
                                    ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                                    : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                                }`}
                                aria-invalid={Boolean(payoutErrors.number)}
                              />
                              <p className={`mt-1.5 text-xs ${payoutErrors.number ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                                {payoutErrors.number || "The number your JazzCash account is registered with."}
                              </p>
                            </div>

                            <div>
                              <label htmlFor="jc-title" className="block text-xs font-semibold text-ink mb-1.5">
                                Account title
                              </label>
                              <input
                                id="jc-title"
                                type="text"
                                autoComplete="name"
                                placeholder="Name on the account"
                                value={draftDetails.jazzcash.title}
                                onChange={(e) => {
                                  setDraftDetails((prev) => ({
                                    ...prev,
                                    jazzcash: { ...prev.jazzcash, title: e.target.value },
                                  }));
                                  if (payoutTouched.has("jazzcash.title")) {
                                    const err = validatePayoutField("title", e.target.value);
                                    setPayoutErrors((prev) => ({ ...prev, title: err || "" }));
                                  }
                                }}
                                onBlur={() => {
                                  setPayoutTouched((prev) => new Set(prev).add("jazzcash.title"));
                                  const err = validatePayoutField("title", draftDetails.jazzcash.title);
                                  setPayoutErrors((prev) => ({ ...prev, title: err || "" }));
                                }}
                                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                                  payoutErrors.title
                                    ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                                    : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                                }`}
                                aria-invalid={Boolean(payoutErrors.title)}
                              />
                              <p className={`mt-1.5 text-xs ${payoutErrors.title ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                                {payoutErrors.title || "Exactly as it appears in your JazzCash app."}
                              </p>
                            </div>
                          </div>
                        )}

                        {draftMethod === "bank" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="bk-name" className="block text-xs font-semibold text-ink mb-1.5">
                                Bank name
                              </label>
                              <input
                                id="bk-name"
                                type="text"
                                list={bankDatalistId}
                                placeholder="e.g. Meezan Bank"
                                value={draftDetails.bank.bankName}
                                onChange={(e) => {
                                  setDraftDetails((prev) => ({
                                    ...prev,
                                    bank: { ...prev.bank, bankName: e.target.value },
                                  }));
                                  if (payoutTouched.has("bank.bankName")) {
                                    const err = validatePayoutField("bankName", e.target.value);
                                    setPayoutErrors((prev) => ({ ...prev, bankName: err || "" }));
                                  }
                                }}
                                onBlur={() => {
                                  setPayoutTouched((prev) => new Set(prev).add("bank.bankName"));
                                  const err = validatePayoutField("bankName", draftDetails.bank.bankName);
                                  setPayoutErrors((prev) => ({ ...prev, bankName: err || "" }));
                                }}
                                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                                  payoutErrors.bankName
                                    ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                                    : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                                }`}
                                aria-invalid={Boolean(payoutErrors.bankName)}
                              />
                              <datalist id={bankDatalistId}>
                                {PAKISTAN_BANKS.map((bank) => (
                                  <option key={bank} value={bank} />
                                ))}
                              </datalist>
                              <p className={`mt-1.5 text-xs ${payoutErrors.bankName ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                                {payoutErrors.bankName || "Start typing to pick from common banks."}
                              </p>
                            </div>

                            <div>
                              <label htmlFor="bk-title" className="block text-xs font-semibold text-ink mb-1.5">
                                Account title
                              </label>
                              <input
                                id="bk-title"
                                type="text"
                                autoComplete="name"
                                placeholder="Name on the account"
                                value={draftDetails.bank.title}
                                onChange={(e) => {
                                  setDraftDetails((prev) => ({
                                    ...prev,
                                    bank: { ...prev.bank, title: e.target.value },
                                  }));
                                  if (payoutTouched.has("bank.title")) {
                                    const err = validatePayoutField("title", e.target.value);
                                    setPayoutErrors((prev) => ({ ...prev, title: err || "" }));
                                  }
                                }}
                                onBlur={() => {
                                  setPayoutTouched((prev) => new Set(prev).add("bank.title"));
                                  const err = validatePayoutField("title", draftDetails.bank.title);
                                  setPayoutErrors((prev) => ({ ...prev, title: err || "" }));
                                }}
                                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                                  payoutErrors.title
                                    ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                                    : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                                }`}
                                aria-invalid={Boolean(payoutErrors.title)}
                              />
                              <p className={`mt-1.5 text-xs ${payoutErrors.title ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                                {payoutErrors.title || "Exactly as it appears on your bank statement."}
                              </p>
                            </div>

                            <div className="sm:col-span-2">
                              <label htmlFor="bk-iban" className="block text-xs font-semibold text-ink mb-1.5">
                                IBAN
                              </label>
                              <input
                                id="bk-iban"
                                type="text"
                                maxLength={29}
                                placeholder="PK36 SCBL 0000 0011 2345 6702"
                                value={draftDetails.bank.iban}
                                onChange={(e) => {
                                  const formatted = formatIban(e.target.value);
                                  setDraftDetails((prev) => ({
                                    ...prev,
                                    bank: { ...prev.bank, iban: formatted },
                                  }));
                                  if (payoutTouched.has("bank.iban")) {
                                    const err = validatePayoutField("iban", formatted);
                                    setPayoutErrors((prev) => ({ ...prev, iban: err || "" }));
                                  }
                                }}
                                onBlur={() => {
                                  setPayoutTouched((prev) => new Set(prev).add("bank.iban"));
                                  const err = validatePayoutField("iban", draftDetails.bank.iban);
                                  setPayoutErrors((prev) => ({ ...prev, iban: err || "" }));
                                }}
                                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm tabular-nums text-ink outline-none transition placeholder:text-ink-subtle ${
                                  payoutErrors.iban
                                    ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                                    : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                                }`}
                                aria-invalid={Boolean(payoutErrors.iban)}
                              />
                              <p className={`mt-1.5 text-xs ${payoutErrors.iban ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                                {payoutErrors.iban || "24 characters, starting with PK. You can find it in your banking app."}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Privacy Statement */}
                        <div className="mt-5 flex items-start gap-2 text-xs text-ink-muted">
                          <svg className="size-4 shrink-0 mt-0.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
                            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
                          </svg>
                          <span>
                            Only merchants running programs you belong to can view this information, and only when preparing your payout.
                          </span>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex items-center gap-4">
                          <button
                            type="submit"
                            disabled={!isPayoutDirty || payoutPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle cursor-pointer"
                          >
                            {payoutPending ? (
                              <>
                                <SpinnerIcon className="size-4" />
                                <span>Saving…</span>
                              </>
                            ) : (
                              <span>Save payout details</span>
                            )}
                          </button>
                          {isPayoutDirty ? (
                            <span className="text-xs text-ink-subtle">Unsaved changes</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Remove Payout Details Row */}
                {payoutSaved.method ? (
                  <div className="border-t border-line px-6 md:px-8 py-5 flex flex-wrap items-center justify-between gap-4 bg-surface-muted/30">
                    <div className="flex-1 min-w-[15rem]">
                      <p className="text-sm font-semibold text-ink">Remove payout details</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Merchants won&apos;t know where to send your earnings until you add details again.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRemoveDialogOpen(true)}
                      className="inline-flex items-center justify-center rounded-xl bg-bad-surface px-4 py-2 text-xs font-semibold text-bad-ink transition hover:opacity-90 cursor-pointer"
                    >
                      Remove details
                    </button>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {/* =========================================================
              PANEL 3: EMAIL ADDRESS
             ========================================================= */}
          {activeTab === "email" && (
            <section className="animate-panel-in" role="tabpanel">
              <div className="rounded-2xl border border-line bg-surface p-6 md:p-8 shadow-xs">
                <h2 className="text-xl font-bold tracking-tight text-ink">Email address</h2>
                <p className="mt-1.5 text-sm text-ink-muted">What you sign in with.</p>

                <form onSubmit={handleEmailSubmit} className="mt-7 max-w-md space-y-4" noValidate>
                  <div>
                    <label htmlFor="account-email" className="block text-xs font-semibold text-ink mb-1.5">
                      Email address
                    </label>
                    <input
                      id="account-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      spellCheck="false"
                      value={emailDraft}
                      onChange={(e) => {
                        setEmailDraft(e.target.value);
                        if (emailErrors.email) setEmailErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                        emailErrors.email
                          ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                          : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                      }`}
                      aria-invalid={Boolean(emailErrors.email)}
                    />
                    <p className={`mt-1.5 text-xs ${emailErrors.email ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                      {emailErrors.email || "This is what you sign in with."}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email-current-pw" className="block text-xs font-semibold text-ink mb-1.5">
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        id="email-current-pw"
                        type={showEmailPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={emailPassword}
                        onChange={(e) => {
                          setEmailPassword(e.target.value);
                          if (emailErrors.password) setEmailErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 pr-11 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                          emailErrors.password
                            ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                            : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                        }`}
                        aria-invalid={Boolean(emailErrors.password)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailPassword(!showEmailPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-subtle hover:text-ink rounded-lg focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
                        aria-label={showEmailPassword ? "Hide password" : "Show password"}
                      >
                        {showEmailPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                    <p className={`mt-1.5 text-xs ${emailErrors.password ? "text-bad-ink font-medium" : "text-ink-subtle"}`}>
                      {emailErrors.password || "Required: changing your email changes how you sign in."}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={!isEmailDirty || emailPending}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle cursor-pointer"
                    >
                      {emailPending ? (
                        <>
                          <SpinnerIcon className="size-4" />
                          <span>Changing…</span>
                        </>
                      ) : (
                        <span>Change email</span>
                      )}
                    </button>
                    {isEmailDirty ? (
                      <span className="text-xs text-ink-subtle">Unsaved changes</span>
                    ) : null}
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* =========================================================
              PANEL 4: PASSWORD
             ========================================================= */}
          {activeTab === "password" && (
            <section className="animate-panel-in" role="tabpanel">
              <div className="rounded-2xl border border-line bg-surface p-6 md:p-8 shadow-xs">
                <h2 className="text-xl font-bold tracking-tight text-ink">Password</h2>
                <p className="mt-1.5 text-sm text-ink-muted">
                  You&apos;ll stay signed in here. Any other devices signed in to your account are signed out.
                </p>

                <form onSubmit={handlePasswordSubmit} className="mt-7 max-w-md space-y-4" noValidate>
                  {/* Current Password */}
                  <div>
                    <label htmlFor="pw-current" className="block text-xs font-semibold text-ink mb-1.5">
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        id="pw-current"
                        type={showPwCurrent ? "text" : "password"}
                        autoComplete="current-password"
                        value={pwCurrent}
                        onChange={(e) => {
                          setPwCurrent(e.target.value);
                          if (pwErrors.current) setPwErrors((prev) => ({ ...prev, current: undefined }));
                        }}
                        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 pr-11 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                          pwErrors.current
                            ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                            : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                        }`}
                        aria-invalid={Boolean(pwErrors.current)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwCurrent(!showPwCurrent)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-subtle hover:text-ink rounded-lg focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
                        aria-label={showPwCurrent ? "Hide password" : "Show password"}
                      >
                        {showPwCurrent ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                    {pwErrors.current ? (
                      <p className="mt-1.5 text-xs text-bad-ink font-medium">{pwErrors.current}</p>
                    ) : null}
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="pw-new" className="block text-xs font-semibold text-ink mb-1.5">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="pw-new"
                        type={showPwNew ? "text" : "password"}
                        autoComplete="new-password"
                        value={pwNew}
                        onChange={(e) => {
                          setPwNew(e.target.value);
                          if (pwErrors.new) setPwErrors((prev) => ({ ...prev, new: undefined }));
                        }}
                        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 pr-11 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                          pwErrors.new
                            ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                            : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                        }`}
                        aria-invalid={Boolean(pwErrors.new)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwNew(!showPwNew)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-subtle hover:text-ink rounded-lg focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
                        aria-label={showPwNew ? "Hide password" : "Show password"}
                      >
                        {showPwNew ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>

                    {/* Strength meter */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="grid grid-cols-4 gap-1 flex-1" aria-hidden="true">
                        {[1, 2, 3, 4].map((step) => {
                          let barColor = "bg-line";
                          if (pwStrength >= step) {
                            if (pwStrength === 1) barColor = "bg-bad-ink";
                            else if (pwStrength === 2) barColor = "bg-amber-500";
                            else if (pwStrength === 3) barColor = "bg-lime-600";
                            else barColor = "bg-emerald-600";
                          }
                          return <i key={step} className={`h-1 rounded-full transition-colors ${barColor}`} />;
                        })}
                      </div>
                      <span className="text-xs font-semibold text-ink-subtle w-14 text-right">
                        {STRENGTH_LEVELS[pwStrength]}
                      </span>
                    </div>

                    {/* Requirements checklist */}
                    <ul className="mt-3 space-y-1.5 text-xs">
                      <li className={`flex items-center gap-2 transition ${PW_RULES.length(pwNew) ? "text-ink font-medium" : "text-ink-subtle"}`}>
                        <span
                          className={`size-4 rounded-full border flex items-center justify-center transition ${
                            PW_RULES.length(pwNew) ? "bg-ok-ink border-ok-ink text-white" : "border-line-strong text-transparent"
                          }`}
                        >
                          <CheckIcon className="size-2.5" />
                        </span>
                        <span>At least 8 characters</span>
                      </li>
                      <li className={`flex items-center gap-2 transition ${PW_RULES.case(pwNew) ? "text-ink font-medium" : "text-ink-subtle"}`}>
                        <span
                          className={`size-4 rounded-full border flex items-center justify-center transition ${
                            PW_RULES.case(pwNew) ? "bg-ok-ink border-ok-ink text-white" : "border-line-strong text-transparent"
                          }`}
                        >
                          <CheckIcon className="size-2.5" />
                        </span>
                        <span>Upper and lower case letters</span>
                      </li>
                      <li className={`flex items-center gap-2 transition ${PW_RULES.digit(pwNew) ? "text-ink font-medium" : "text-ink-subtle"}`}>
                        <span
                          className={`size-4 rounded-full border flex items-center justify-center transition ${
                            PW_RULES.digit(pwNew) ? "bg-ok-ink border-ok-ink text-white" : "border-line-strong text-transparent"
                          }`}
                        >
                          <CheckIcon className="size-2.5" />
                        </span>
                        <span>A number or symbol</span>
                      </li>
                    </ul>

                    {pwErrors.new ? (
                      <p className="mt-1.5 text-xs text-bad-ink font-medium">{pwErrors.new}</p>
                    ) : null}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="pw-confirm" className="block text-xs font-semibold text-ink mb-1.5">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <input
                        id="pw-confirm"
                        type={showPwConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        value={pwConfirm}
                        onChange={(e) => {
                          setPwConfirm(e.target.value);
                          if (pwErrors.confirm) setPwErrors((prev) => ({ ...prev, confirm: undefined }));
                        }}
                        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 pr-11 text-sm text-ink outline-none transition placeholder:text-ink-subtle ${
                          pwErrors.confirm
                            ? "border-bad-ink focus:ring-2 focus:ring-bad-ink/20"
                            : "border-line-strong hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
                        }`}
                        aria-invalid={Boolean(pwErrors.confirm)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwConfirm(!showPwConfirm)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-subtle hover:text-ink rounded-lg focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
                        aria-label={showPwConfirm ? "Hide password" : "Show password"}
                      >
                        {showPwConfirm ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                    {pwErrors.confirm ? (
                      <p className="mt-1.5 text-xs text-bad-ink font-medium">{pwErrors.confirm}</p>
                    ) : null}
                  </div>

                  <div className="pt-2 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={!isPwDirty || pwPending}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle cursor-pointer"
                    >
                      {pwPending ? (
                        <>
                          <SpinnerIcon className="size-4" />
                          <span>Updating…</span>
                        </>
                      ) : (
                        <span>Update password</span>
                      )}
                    </button>
                    {isPwDirty ? (
                      <span className="text-xs text-ink-subtle">Unsaved changes</span>
                    ) : null}
                  </div>
                </form>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal Sheet */}
      {isRemoveDialogOpen && (
        <div
          role="dialog"
          aria-labelledby="remove-dialog-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-panel-in"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <h3 id="remove-dialog-title" className="text-lg font-bold tracking-tight text-ink">
              Remove payout details?
            </h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Merchants won&apos;t be able to pay you until you add new details. Everything you&apos;ve already earned is unaffected.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRemoveDialogOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-line bg-surface-muted px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink transition cursor-pointer"
              >
                Keep details
              </button>
              <button
                type="button"
                onClick={handleRemovePayout}
                disabled={removePending}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-bad-ink px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {removePending ? <SpinnerIcon className="size-3.5" /> : null}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Region */}
      <div
        id="toasts"
        role="status"
        aria-live="polite"
        className="fixed left-1/2 -translate-x-1/2 bottom-5 flex flex-col items-center gap-2 z-50 pointer-events-none max-w-[calc(100vw-2rem)]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-ink text-canvas text-sm font-medium shadow-xl pointer-events-auto transition-all ${
              t.removing ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            <span className="size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckIcon className="size-3" />
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
