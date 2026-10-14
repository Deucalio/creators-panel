"use client";

import React, { useState, useEffect, useRef, useTransition, useId } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, PAYOUT_TEXT_MAX_LENGTH } from "@/lib/field-limits";
import { PayoutHeaderArt } from "@/components/illustration";

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
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <Image
        src="/easypaisa-logo.png"
        alt="Easypaisa"
        width={100}
        height={32}
        className="h-7 sm:h-8 w-auto object-contain rounded-md"
        priority
        unoptimized
      />
    </div>
  );
}

export function JazzCashLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <Image
        src="/jazzcash-logo.webp"
        alt="JazzCash"
        width={110}
        height={32}
        className="h-7 sm:h-8 w-auto object-contain rounded-md"
        priority
        unoptimized
      />
    </div>
  );
}

export function BankTileIcon({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
      <path d="M32 7 57 21v5H7v-5z" />
      <circle cx="32" cy="18" r="2.6" fill="white" />
      <rect x="12" y="30" width="7" height="18" rx="1.5" />
      <rect x="28.5" y="30" width="7" height="18" rx="1.5" />
      <rect x="45" y="30" width="7" height="18" rx="1.5" />
      <rect x="8" y="52" width="48" height="6" rx="2" />
    </svg>
  );
}

export function BankLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-700/80 text-white font-semibold text-xs tracking-tight ${className}`}>
      <BankTileIcon className="size-4 shrink-0 text-slate-200" />
      <span>Bank transfer</span>
    </div>
  );
}

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

function PhoneIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}

function UserIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function BuildingIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

function CreditCardIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  );
}

function LockIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="3" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
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

  const TABS: TabKey[] = ["profile", "payouts", "email", "password"];
  const tabButtonRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    profile: null,
    payouts: null,
    email: null,
    password: null,
  });

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

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tab: TabKey) => {
    const currentIndex = TABS.indexOf(tab);
    let targetIndex: number | null = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % TABS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = TABS.length - 1;
    }

    if (targetIndex !== null) {
      const nextTab = TABS[targetIndex];
      selectTab(nextTab);
      tabButtonRefs.current[nextTab]?.focus();
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
  const isLegacyMethod = Boolean(payout?.method && !initialMatched);
  const initialKey: "easypaisa" | "jazzcash" | "bank" =
    initialMatched === "JazzCash"
      ? "jazzcash"
      : initialMatched === "Bank transfer"
      ? "bank"
      : "easypaisa";
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

  // Remove payout modal state and accessible focus management
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removePending, startRemoveTransition] = useTransition();
  const removeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const removeCancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const removeConfirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const removeBackdropRef = useRef<HTMLDivElement | null>(null);

  const closeRemoveDialog = () => {
    setIsRemoveDialogOpen(false);
    setRemoveError(null);
    setTimeout(() => {
      removeTriggerRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    if (!isRemoveDialogOpen) return;
    removeCancelBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRemoveDialog();
      } else if (e.key === "Tab") {
        const focusables = [removeCancelBtnRef.current, removeConfirmBtnRef.current].filter(Boolean) as HTMLElement[];
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRemoveDialogOpen]);

  const isPayoutConfigured = Boolean(
    payoutSaved.method &&
      (payoutSaved.key
        ? Object.values(payoutSaved.details[payoutSaved.key]).some((v) => v.trim())
        : payout?.details)
  );

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
    setRemoveError(null);
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
        setRemoveError(null);
        toast("Payout details removed");
        setTimeout(() => {
          removeTriggerRef.current?.focus();
        }, 50);
      } else if (res.status === "error") {
        setRemoveError(res.message || "Failed to remove payout details. Please try again.");
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
      errs.new = "Your new password cannot be the same as your current password.";
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
            ref={(el) => { tabButtonRefs.current["profile"] = el; }}
            id="tab-profile"
            role="tab"
            type="button"
            onClick={() => selectTab("profile")}
            onKeyDown={(e) => handleTabKeyDown(e, "profile")}
            aria-selected={activeTab === "profile"}
            aria-controls="panel-profile"
            aria-label={`Profile: ${profileSaved.first} ${profileSaved.last}`}
            tabIndex={activeTab === "profile" ? 0 : -1}
            className={`relative flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:py-2.5 md:px-3 rounded-2xl border text-center md:text-left transition cursor-pointer ${
              activeTab === "profile"
                ? "bg-surface border-line text-ink shadow-xs"
                : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span
              className={`size-7 md:size-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                activeTab === "profile" ? "bg-brand text-brand-ink" : "bg-surface-muted text-ink-muted"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="3.6" />
                <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 flex flex-col items-center md:items-start">
              <span className="block text-[11px] md:text-sm font-semibold truncate">Profile</span>
              <span className="hidden md:block text-xs text-ink-subtle truncate max-w-[130px]">
                {profileSaved.first} {profileSaved.last}
              </span>
            </div>
            {isProfileDirty ? (
              <span className="absolute top-1.5 right-1.5 md:static md:ml-auto size-2 rounded-full bg-warn-ink shrink-0" title="Unsaved changes" />
            ) : null}
          </button>

          {/* Tab 2: Payouts */}
          <button
            ref={(el) => { tabButtonRefs.current["payouts"] = el; }}
            id="tab-payouts"
            role="tab"
            type="button"
            onClick={() => selectTab("payouts")}
            onKeyDown={(e) => handleTabKeyDown(e, "payouts")}
            aria-selected={activeTab === "payouts"}
            aria-controls="panel-payouts"
            aria-label={`Payouts: ${payoutSaved.method ?? (isLegacyMethod ? `Legacy method ${payout?.method}` : "No payout method connected")}`}
            tabIndex={activeTab === "payouts" ? 0 : -1}
            className={`relative flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:py-2.5 md:px-3 rounded-2xl border text-center md:text-left transition cursor-pointer ${
              activeTab === "payouts"
                ? "bg-surface border-line text-ink shadow-xs"
                : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span
              className={`size-7 md:size-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                activeTab === "payouts" ? "bg-brand text-brand-ink" : "bg-surface-muted text-ink-muted"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="6.5" width="18" height="11" rx="2.5" />
                <circle cx="12" cy="12" r="2.5" />
                <path d="M6.5 12h.01M17.5 12h.01" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 flex flex-col items-center md:items-start">
              <span className="block text-[11px] md:text-sm font-semibold truncate">Payouts</span>
              {isPayoutConfigured ? (
                <span className="hidden md:flex items-center gap-1.5 text-xs text-ink-subtle">
                  <span className="size-1.5 rounded-full shrink-0 bg-ok-ink" aria-hidden="true" />
                  <span className="truncate max-w-[120px]">{payoutSaved.method}</span>
                </span>
              ) : isLegacyMethod ? (
                <span className="hidden md:flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <span className="size-1.5 rounded-full shrink-0 bg-amber-500" aria-hidden="true" />
                  <span className="truncate max-w-[120px]">{payout?.method}</span>
                </span>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 mt-0.5 rounded-full text-[11px] font-semibold bg-bad-surface text-bad-ink border border-danger-line shadow-2xs">
                  <span className="size-1.5 rounded-full bg-bad-ink shrink-0" aria-hidden="true" />
                  <span className="truncate">No method connected</span>
                </span>
              )}
              {!isPayoutConfigured && !isLegacyMethod ? (
                <span className="md:hidden mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-bad-surface text-bad-ink border border-danger-line">
                  No method
                </span>
              ) : null}
            </div>
            {!isPayoutConfigured && !isLegacyMethod && !isPayoutDirty ? (
              <span
                className="md:hidden absolute top-1.5 right-1.5 size-2 rounded-full bg-bad-ink shrink-0"
                title="No payout method connected"
                aria-hidden="true"
              />
            ) : null}
            {isPayoutDirty ? (
              <span className="absolute top-1.5 right-1.5 md:static md:ml-auto size-2 rounded-full bg-warn-ink shrink-0" title="Unsaved changes" />
            ) : null}
          </button>

          {/* Tab 3: Email */}
          <button
            ref={(el) => { tabButtonRefs.current["email"] = el; }}
            id="tab-email"
            role="tab"
            type="button"
            onClick={() => selectTab("email")}
            onKeyDown={(e) => handleTabKeyDown(e, "email")}
            aria-selected={activeTab === "email"}
            aria-controls="panel-email"
            aria-label={`Email: ${emailSaved}`}
            tabIndex={activeTab === "email" ? 0 : -1}
            className={`relative flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:py-2.5 md:px-3 rounded-2xl border text-center md:text-left transition cursor-pointer ${
              activeTab === "email"
                ? "bg-surface border-line text-ink shadow-xs"
                : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span
              className={`size-7 md:size-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                activeTab === "email" ? "bg-brand text-brand-ink" : "bg-surface-muted text-ink-muted"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
                <path d="M4 7.5l8 6 8-6" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 flex flex-col items-center md:items-start">
              <span className="block text-[11px] md:text-sm font-semibold truncate">Email</span>
              <span className="hidden md:block text-xs text-ink-subtle truncate max-w-[130px]">
                {emailSaved}
              </span>
            </div>
            {isEmailDirty ? (
              <span className="absolute top-1.5 right-1.5 md:static md:ml-auto size-2 rounded-full bg-warn-ink shrink-0" title="Unsaved changes" />
            ) : null}
          </button>

          {/* Tab 4: Password */}
          <button
            ref={(el) => { tabButtonRefs.current["password"] = el; }}
            id="tab-password"
            role="tab"
            type="button"
            onClick={() => selectTab("password")}
            onKeyDown={(e) => handleTabKeyDown(e, "password")}
            aria-selected={activeTab === "password"}
            aria-controls="panel-password"
            aria-label="Password: Security and sign-in"
            tabIndex={activeTab === "password" ? 0 : -1}
            className={`relative flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:py-2.5 md:px-3 rounded-2xl border text-center md:text-left transition cursor-pointer ${
              activeTab === "password"
                ? "bg-surface border-line text-ink shadow-xs"
                : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span
              className={`size-7 md:size-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                activeTab === "password" ? "bg-brand text-brand-ink" : "bg-surface-muted text-ink-muted"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
                <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 flex flex-col items-center md:items-start">
              <span className="block text-[11px] md:text-sm font-semibold truncate">Password</span>
              <span className="hidden md:block text-xs text-ink-subtle truncate">
                Security &amp; sign-in
              </span>
            </div>
            {isPwDirty ? (
              <span className="absolute top-1.5 right-1.5 md:static md:ml-auto size-2 rounded-full bg-warn-ink shrink-0" title="Unsaved changes" />
            ) : null}
          </button>
        </nav>

        {/* Right Panels Container */}
        <div className="min-w-0">
          {/* =========================================================
              PANEL 1: PROFILE
             ========================================================= */}
          {activeTab === "profile" && (
            <section
              id="panel-profile"
              role="tabpanel"
              aria-labelledby="tab-profile"
              tabIndex={0}
              className="animate-panel-in rounded-2xl outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
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
                        maxLength={NAME_MAX_LENGTH}
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
                        aria-describedby={profileErrors.first ? "first-name-error" : undefined}
                      />
                      {profileErrors.first ? (
                        <p id="first-name-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                          {profileErrors.first}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="last-name" className="block text-xs font-semibold text-ink mb-1.5">
                        Last name
                      </label>
                      <input
                        id="last-name"
                        type="text"
                        maxLength={NAME_MAX_LENGTH}
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
                        aria-describedby={profileErrors.last ? "last-name-error" : undefined}
                      />
                      {profileErrors.last ? (
                        <p id="last-name-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                          {profileErrors.last}
                        </p>
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
            <section
              id="panel-payouts"
              role="tabpanel"
              aria-labelledby="tab-payouts"
              tabIndex={0}
              className="animate-panel-in rounded-2xl outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-ink">How you get paid</h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isPayoutConfigured
                          ? "bg-ok-surface text-ok-ink border-ok-ink/20"
                          : isLegacyMethod
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30"
                          : "bg-bad-surface text-bad-ink border-danger-line"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          isPayoutConfigured ? "bg-ok-ink" : isLegacyMethod ? "bg-amber-500" : "bg-bad-ink"
                        }`}
                        aria-hidden="true"
                      />
                      <span>
                        {isPayoutConfigured
                          ? "Configured"
                          : isLegacyMethod
                          ? `Legacy (${payout?.method})`
                          : "No payout method connected"}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    Merchants pay you manually, so they need to know where to send your earnings.
                  </p>

                  {/* Legacy / Unsupported Method Notice Banner */}
                  {isLegacyMethod && (
                    <div className="mt-5 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 p-4 sm:p-5 flex items-start gap-3.5">
                      <div className="size-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-ink">
                          Unsupported saved method ({payout?.method})
                        </h3>
                        <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                          Your account currently has payout details saved under an unsupported method {payout?.details ? `(${payout.details})` : ""}. PartnerLoop now supports <strong>Easypaisa</strong>, <strong>JazzCash</strong>, and <strong>Bank transfer</strong>. Please select one of the supported methods below to update your details, or remove your previous details.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selector Grid */}
                  <fieldset className="mt-7">
                    <legend className="block text-xs font-semibold text-ink mb-2">
                      Payment method
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(["easypaisa", "jazzcash", "bank"] as const).map((methodKey) => {
                        const isChecked = draftMethod === methodKey;
                        const label =
                          methodKey === "easypaisa"
                            ? "Easypaisa"
                            : methodKey === "jazzcash"
                            ? "JazzCash"
                            : "Bank transfer";
                        const blurb =
                          methodKey === "bank"
                            ? "Paid to your IBAN"
                            : "Paid to your wallet number";

                        return (
                          <label
                            key={methodKey}
                            data-method={methodKey}
                            data-checked={isChecked ? "true" : "false"}
                            className={`method-card relative flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                              isChecked
                                ? "shadow-xs border-m bg-m-tint/60 ring-2 ring-m/20"
                                : "border-line-strong bg-surface hover:border-m/50 hover:-translate-y-0.5"
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

                            {/* White Logo Tile (Properly proportioned) */}
                            <div className="h-20 sm:h-22 w-full rounded-xl bg-white border border-[#e8eaf2] dark:border-white/10 flex items-center justify-center p-2.5 overflow-hidden shadow-2xs">
                              {methodKey === "easypaisa" ? (
                                <Image
                                  src="/easypaisa-logo.png"
                                  alt="Easypaisa"
                                  width={64}
                                  height={64}
                                  className="h-14 sm:h-16 w-auto max-w-[85%] object-contain"
                                  priority
                                  unoptimized
                                />
                              ) : methodKey === "jazzcash" ? (
                                <Image
                                  src="/jazzcash-logo.webp"
                                  alt="JazzCash"
                                  width={64}
                                  height={64}
                                  className="h-14 sm:h-16 w-auto max-w-[85%] object-contain"
                                  priority
                                  unoptimized
                                />
                              ) : (
                                <BankTileIcon className="size-12 sm:size-14 text-slate-700" />
                              )}
                            </div>

                            {/* Method Name & Blurb */}
                            <div>
                              <span className="sr-only">{label}, </span>
                              <b className="block text-sm sm:text-base font-semibold text-ink">{label}</b>
                              <span className="block text-xs text-ink-muted mt-0.5">{blurb}</span>
                            </div>

                            {/* Top-Right Tick Badge */}
                            <span
                              className={`absolute top-3.5 right-3.5 size-6 rounded-full bg-m-strong text-white flex items-center justify-center shadow-xs transition-transform duration-200 ${
                                isChecked ? "scale-100" : "scale-0"
                              }`}
                              aria-hidden="true"
                            >
                              <CheckIcon className="size-3.5 stroke-[2.5]" />
                            </span>
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
                      className="payout-details-panel rounded-2xl border border-m-line overflow-hidden bg-surface transition shadow-2xs"
                    >
                      {/* Top 4px brand accent bar */}
                      <div className="payout-accent-bar h-1 w-full bg-m" />

                      {/* Header with white logo chip, title/subtitle, and PayoutHeaderArt */}
                      <div className="payout-header flex items-center gap-4 sm:gap-5 px-5 py-4 sm:px-6 sm:py-5 border-b border-m-line bg-gradient-to-r from-m-tint via-m-tint/40 to-surface relative overflow-hidden">
                        {/* White Logo Chip */}
                        <div className="size-16 sm:size-18 rounded-2xl bg-white border border-[#e8eaf2] dark:border-white/10 flex items-center justify-center p-2.5 shadow-sm shrink-0">
                          {draftMethod === "easypaisa" ? (
                            <Image
                              src="/easypaisa-logo.png"
                              alt="Easypaisa"
                              width={48}
                              height={48}
                              className="h-11 sm:h-12 w-auto max-w-full object-contain"
                              priority
                              unoptimized
                            />
                          ) : draftMethod === "jazzcash" ? (
                            <Image
                              src="/jazzcash-logo.webp"
                              alt="JazzCash"
                              width={48}
                              height={48}
                              className="h-11 sm:h-12 w-auto max-w-full object-contain"
                              priority
                              unoptimized
                            />
                          ) : (
                            <BankTileIcon className="size-10 sm:size-11 text-slate-700" />
                          )}
                        </div>

                        {/* Method Title & Subtitle */}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold tracking-tight text-ink">
                            {draftMethod === "bank"
                              ? "Bank account"
                              : draftMethod === "jazzcash"
                              ? "JazzCash wallet"
                              : "Easypaisa wallet"}
                          </h3>
                          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                            {draftMethod === "bank"
                              ? "Earnings go straight to your IBAN."
                              : "Earnings go straight to your wallet number."}
                          </p>
                        </div>

                        {/* Header Art Illustration (Scaled Elegantly) */}
                        <PayoutHeaderArt className="ml-auto w-24 sm:w-28 md:w-32 h-auto shrink-0 hidden sm:block select-none" />
                      </div>

                      <div className="p-5 md:p-6 bg-surface">
                        {payoutErrors.form ? (
                          <div role="alert" className="mb-4 rounded-xl border border-bad-ink/20 bg-bad-surface p-3 text-xs text-bad-ink font-medium">
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
                              <div
                                data-invalid={Boolean(payoutErrors.number)}
                                className={`payout-input-field flex items-center gap-2.5 rounded-xl border px-3.5 h-12 bg-surface-muted/40 transition ${
                                  payoutErrors.number
                                    ? "border-bad-ink ring-2 ring-bad-ink/20"
                                    : "border-line-strong hover:border-m/60 focus-within:border-m focus-within:bg-surface focus-within:ring-2 focus-within:ring-m-ring"
                                }`}
                              >
                                <PhoneIcon className="size-5 shrink-0 text-ink-subtle" />
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
                                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm tabular-nums text-ink placeholder:text-ink-subtle"
                                  aria-invalid={Boolean(payoutErrors.number)}
                                  aria-describedby={payoutErrors.number ? "ep-number-error ep-number-hint" : "ep-number-hint"}
                                />
                                <span
                                  className={`transition-opacity duration-200 ${
                                    validMobile(draftDetails.easypaisa.number) === true
                                      ? "opacity-100 text-m"
                                      : "opacity-0 pointer-events-none"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <CheckIcon className="size-4 stroke-[2.5]" />
                                </span>
                              </div>
                              <p id="ep-number-hint" className={`mt-1.5 text-xs ${payoutErrors.number ? "hidden" : "text-ink-subtle"}`}>
                                The number your Easypaisa account is registered with.
                              </p>
                              {payoutErrors.number ? (
                                <p id="ep-number-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                                  {payoutErrors.number}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <label htmlFor="ep-title" className="block text-xs font-semibold text-ink mb-1.5">
                                Account title
                              </label>
                              <div
                                data-invalid={Boolean(payoutErrors.title)}
                                className={`payout-input-field flex items-center gap-2.5 rounded-xl border px-3.5 h-12 bg-surface-muted/40 transition ${
                                  payoutErrors.title
                                    ? "border-bad-ink ring-2 ring-bad-ink/20"
                                    : "border-line-strong hover:border-m/60 focus-within:border-m focus-within:bg-surface focus-within:ring-2 focus-within:ring-m-ring"
                                }`}
                              >
                                <UserIcon className="size-5 shrink-0 text-ink-subtle" />
                                <input
                                  id="ep-title"
                                  type="text"
                                  maxLength={PAYOUT_TEXT_MAX_LENGTH}
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
                                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-subtle"
                                  aria-invalid={Boolean(payoutErrors.title)}
                                  aria-describedby={payoutErrors.title ? "ep-title-error ep-title-hint" : "ep-title-hint"}
                                />
                                <span
                                  className={`transition-opacity duration-200 ${
                                    validTitle(draftDetails.easypaisa.title) === true
                                      ? "opacity-100 text-m"
                                      : "opacity-0 pointer-events-none"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <CheckIcon className="size-4 stroke-[2.5]" />
                                </span>
                              </div>
                              <p id="ep-title-hint" className={`mt-1.5 text-xs ${payoutErrors.title ? "hidden" : "text-ink-subtle"}`}>
                                Exactly as it appears in your Easypaisa app.
                              </p>
                              {payoutErrors.title ? (
                                <p id="ep-title-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                                  {payoutErrors.title}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        )}

                        {draftMethod === "jazzcash" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="jc-number" className="block text-xs font-semibold text-ink mb-1.5">
                                JazzCash mobile number
                              </label>
                              <div
                                data-invalid={Boolean(payoutErrors.number)}
                                className={`payout-input-field flex items-center gap-2.5 rounded-xl border px-3.5 h-12 bg-surface-muted/40 transition ${
                                  payoutErrors.number
                                    ? "border-bad-ink ring-2 ring-bad-ink/20"
                                    : "border-line-strong hover:border-m/60 focus-within:border-m focus-within:bg-surface focus-within:ring-2 focus-within:ring-m-ring"
                                }`}
                              >
                                <PhoneIcon className="size-5 shrink-0 text-ink-subtle" />
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
                                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm tabular-nums text-ink placeholder:text-ink-subtle"
                                  aria-invalid={Boolean(payoutErrors.number)}
                                  aria-describedby={payoutErrors.number ? "jc-number-error jc-number-hint" : "jc-number-hint"}
                                />
                                <span
                                  className={`transition-opacity duration-200 ${
                                    validMobile(draftDetails.jazzcash.number) === true
                                      ? "opacity-100 text-m"
                                      : "opacity-0 pointer-events-none"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <CheckIcon className="size-4 stroke-[2.5]" />
                                </span>
                              </div>
                              <p id="jc-number-hint" className={`mt-1.5 text-xs ${payoutErrors.number ? "hidden" : "text-ink-subtle"}`}>
                                The number your JazzCash account is registered with.
                              </p>
                              {payoutErrors.number ? (
                                <p id="jc-number-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                                  {payoutErrors.number}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <label htmlFor="jc-title" className="block text-xs font-semibold text-ink mb-1.5">
                                Account title
                              </label>
                              <div
                                data-invalid={Boolean(payoutErrors.title)}
                                className={`payout-input-field flex items-center gap-2.5 rounded-xl border px-3.5 h-12 bg-surface-muted/40 transition ${
                                  payoutErrors.title
                                    ? "border-bad-ink ring-2 ring-bad-ink/20"
                                    : "border-line-strong hover:border-m/60 focus-within:border-m focus-within:bg-surface focus-within:ring-2 focus-within:ring-m-ring"
                                }`}
                              >
                                <UserIcon className="size-5 shrink-0 text-ink-subtle" />
                                <input
                                  id="jc-title"
                                  type="text"
                                  maxLength={PAYOUT_TEXT_MAX_LENGTH}
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
                                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-subtle"
                                  aria-invalid={Boolean(payoutErrors.title)}
                                  aria-describedby={payoutErrors.title ? "jc-title-error jc-title-hint" : "jc-title-hint"}
                                />
                                <span
                                  className={`transition-opacity duration-200 ${
                                    validTitle(draftDetails.jazzcash.title) === true
                                      ? "opacity-100 text-m"
                                      : "opacity-0 pointer-events-none"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <CheckIcon className="size-4 stroke-[2.5]" />
                                </span>
                              </div>
                              <p id="jc-title-hint" className={`mt-1.5 text-xs ${payoutErrors.title ? "hidden" : "text-ink-subtle"}`}>
                                Exactly as it appears in your JazzCash app.
                              </p>
                              {payoutErrors.title ? (
                                <p id="jc-title-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                                  {payoutErrors.title}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        )}

                        {draftMethod === "bank" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="bk-name" className="block text-xs font-semibold text-ink mb-1.5">
                                Bank name
                              </label>
                              <div
                                data-invalid={Boolean(payoutErrors.bankName)}
                                className={`payout-input-field flex items-center gap-2.5 rounded-xl border px-3.5 h-12 bg-surface-muted/40 transition ${
                                  payoutErrors.bankName
                                    ? "border-bad-ink ring-2 ring-bad-ink/20"
                                    : "border-line-strong hover:border-m/60 focus-within:border-m focus-within:bg-surface focus-within:ring-2 focus-within:ring-m-ring"
                                }`}
                              >
                                <BuildingIcon className="size-5 shrink-0 text-ink-subtle" />
                                <input
                                  id="bk-name"
                                  type="text"
                                  maxLength={PAYOUT_TEXT_MAX_LENGTH}
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
                                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-subtle"
                                  aria-invalid={Boolean(payoutErrors.bankName)}
                                  aria-describedby={payoutErrors.bankName ? "bk-name-error bk-name-hint" : "bk-name-hint"}
                                />
                                <span
                                  className={`transition-opacity duration-200 ${
                                    validBankName(draftDetails.bank.bankName) === true
                                      ? "opacity-100 text-m"
                                      : "opacity-0 pointer-events-none"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <CheckIcon className="size-4 stroke-[2.5]" />
                                </span>
                              </div>
                              <datalist id={bankDatalistId}>
                                {PAKISTAN_BANKS.map((bank) => (
                                  <option key={bank} value={bank} />
                                ))}
                              </datalist>
                              <p id="bk-name-hint" className={`mt-1.5 text-xs ${payoutErrors.bankName ? "hidden" : "text-ink-subtle"}`}>
                                Start typing to pick from common banks.
                              </p>
                              {payoutErrors.bankName ? (
                                <p id="bk-name-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                                  {payoutErrors.bankName}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <label htmlFor="bk-title" className="block text-xs font-semibold text-ink mb-1.5">
                                Account title
                              </label>
                              <div
                                data-invalid={Boolean(payoutErrors.title)}
                                className={`payout-input-field flex items-center gap-2.5 rounded-xl border px-3.5 h-12 bg-surface-muted/40 transition ${
                                  payoutErrors.title
                                    ? "border-bad-ink ring-2 ring-bad-ink/20"
                                    : "border-line-strong hover:border-m/60 focus-within:border-m focus-within:bg-surface focus-within:ring-2 focus-within:ring-m-ring"
                                }`}
                              >
                                <UserIcon className="size-5 shrink-0 text-ink-subtle" />
                                <input
                                  id="bk-title"
                                  type="text"
                                  maxLength={PAYOUT_TEXT_MAX_LENGTH}
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
                                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-subtle"
                                  aria-invalid={Boolean(payoutErrors.title)}
                                  aria-describedby={payoutErrors.title ? "bk-title-error bk-title-hint" : "bk-title-hint"}
                                />
                                <span
                                  className={`transition-opacity duration-200 ${
                                    validTitle(draftDetails.bank.title) === true
                                      ? "opacity-100 text-m"
                                      : "opacity-0 pointer-events-none"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <CheckIcon className="size-4 stroke-[2.5]" />
                                </span>
                              </div>
                              <p id="bk-title-hint" className={`mt-1.5 text-xs ${payoutErrors.title ? "hidden" : "text-ink-subtle"}`}>
                                Exactly as it appears on your bank statement.
                              </p>
                              {payoutErrors.title ? (
                                <p id="bk-title-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                                  {payoutErrors.title}
                                </p>
                              ) : null}
                            </div>

                            <div className="sm:col-span-2">
                              <label htmlFor="bk-iban" className="block text-xs font-semibold text-ink mb-1.5">
                                IBAN
                              </label>
                              <div
                                data-invalid={Boolean(payoutErrors.iban)}
                                className={`payout-input-field flex items-center gap-2.5 rounded-xl border px-3.5 h-12 bg-surface-muted/40 transition ${
                                  payoutErrors.iban
                                    ? "border-bad-ink ring-2 ring-bad-ink/20"
                                    : "border-line-strong hover:border-m/60 focus-within:border-m focus-within:bg-surface focus-within:ring-2 focus-within:ring-m-ring"
                                }`}
                              >
                                <CreditCardIcon className="size-5 shrink-0 text-ink-subtle" />
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
                                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm tabular-nums text-ink placeholder:text-ink-subtle"
                                  aria-invalid={Boolean(payoutErrors.iban)}
                                  aria-describedby={payoutErrors.iban ? "bk-iban-error bk-iban-hint" : "bk-iban-hint"}
                                />
                                <span
                                  className={`transition-opacity duration-200 ${
                                    validIban(draftDetails.bank.iban) === true
                                      ? "opacity-100 text-m"
                                      : "opacity-0 pointer-events-none"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <CheckIcon className="size-4 stroke-[2.5]" />
                                </span>
                              </div>
                              <p id="bk-iban-hint" className={`mt-1.5 text-xs ${payoutErrors.iban ? "hidden" : "text-ink-subtle"}`}>
                                24 characters, starting with PK. You can find it in your banking app.
                              </p>
                              {payoutErrors.iban ? (
                                <p id="bk-iban-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                                  {payoutErrors.iban}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        )}

                        {/* Footer Divider, Privacy Note & Submit Button */}
                        <div className="mt-6 pt-5 border-t border-dashed border-line flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-2 text-xs text-ink-muted max-w-md">
                            <LockIcon className="size-4 shrink-0 text-m" />
                            <span>
                              Only merchants running programs you belong to can view this information, and only when preparing your payout.
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {isPayoutDirty ? (
                              <span className="text-xs text-warn-ink font-medium">Unsaved changes</span>
                            ) : null}
                            <button
                              type="submit"
                              disabled={!isPayoutDirty || payoutPending}
                              className="payout-save-btn inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle cursor-pointer hover:brightness-105 active:scale-[0.98]"
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Remove Payout Details Row */}
                {Boolean(payoutSaved.method || isLegacyMethod) ? (
                  <div className="border-t border-line px-6 md:px-8 py-5 flex flex-wrap items-center justify-between gap-4 bg-surface-muted/30">
                    <div className="flex-1 min-w-[15rem]">
                      <p className="text-sm font-semibold text-ink">Remove payout details</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Merchants won&apos;t know where to send your earnings until you add details again.
                      </p>
                    </div>
                    <button
                      ref={removeTriggerRef}
                      type="button"
                      onClick={() => {
                        setRemoveError(null);
                        setIsRemoveDialogOpen(true);
                      }}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70 px-4 py-2 text-xs font-semibold transition cursor-pointer"
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
            <section
              id="panel-email"
              role="tabpanel"
              aria-labelledby="tab-email"
              tabIndex={0}
              className="animate-panel-in rounded-2xl outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
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
                      maxLength={EMAIL_MAX_LENGTH}
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
                      aria-describedby={emailErrors.email ? "account-email-error account-email-hint" : "account-email-hint"}
                    />
                    <p id="account-email-hint" className={`mt-1.5 text-xs ${emailErrors.email ? "hidden" : "text-ink-subtle"}`}>
                      This is what you sign in with.
                    </p>
                    {emailErrors.email ? (
                      <p id="account-email-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                        {emailErrors.email}
                      </p>
                    ) : null}
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
                        aria-describedby={emailErrors.password ? "email-current-pw-error email-current-pw-hint" : "email-current-pw-hint"}
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
                    <p id="email-current-pw-hint" className={`mt-1.5 text-xs ${emailErrors.password ? "hidden" : "text-ink-subtle"}`}>
                      Required: changing your email changes how you sign in.
                    </p>
                    {emailErrors.password ? (
                      <p id="email-current-pw-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                        {emailErrors.password}
                      </p>
                    ) : null}
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
            <section
              id="panel-password"
              role="tabpanel"
              aria-labelledby="tab-password"
              tabIndex={0}
              className="animate-panel-in rounded-2xl outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
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
                        aria-describedby={pwErrors.current ? "pw-current-error" : undefined}
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
                      <p id="pw-current-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                        {pwErrors.current}
                      </p>
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
                        aria-describedby={pwErrors.new ? "pw-new-error pw-requirements pw-suggestions" : "pw-requirements pw-suggestions"}
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

                    {/* Requirements checklist (separated mandatory requirement from suggestions) */}
                    <div className="mt-3.5 space-y-2.5 text-xs">
                      <div>
                        <span className="block font-semibold text-ink mb-1.5">Requirement</span>
                        <ul id="pw-requirements" className="space-y-1.5">
                          <li className={`flex items-center gap-2 transition ${PW_RULES.length(pwNew) ? "text-ink font-medium" : "text-ink-subtle"}`}>
                            <span
                              className={`size-4 rounded-full border flex items-center justify-center transition ${
                                PW_RULES.length(pwNew)
                                  ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-neutral-950"
                                  : "border-line-strong text-transparent"
                              }`}
                            >
                              <CheckIcon className="size-2.5" />
                            </span>
                            <span>At least 8 characters <span className="text-ink-subtle font-normal">(required)</span></span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <span className="block font-semibold text-ink-muted mb-1.5">Suggestions for strength</span>
                        <ul id="pw-suggestions" className="space-y-1.5">
                          <li className={`flex items-center gap-2 transition ${PW_RULES.case(pwNew) ? "text-ink font-medium" : "text-ink-subtle"}`}>
                            <span
                              className={`size-4 rounded-full border flex items-center justify-center transition ${
                                PW_RULES.case(pwNew)
                                  ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-neutral-950"
                                  : "border-line-strong text-transparent"
                              }`}
                            >
                              <CheckIcon className="size-2.5" />
                            </span>
                            <span>Upper and lower case letters</span>
                          </li>
                          <li className={`flex items-center gap-2 transition ${PW_RULES.digit(pwNew) ? "text-ink font-medium" : "text-ink-subtle"}`}>
                            <span
                              className={`size-4 rounded-full border flex items-center justify-center transition ${
                                PW_RULES.digit(pwNew)
                                  ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-neutral-950"
                                  : "border-line-strong text-transparent"
                              }`}
                            >
                              <CheckIcon className="size-2.5" />
                            </span>
                            <span>A number or symbol</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {pwErrors.new ? (
                      <p id="pw-new-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                        {pwErrors.new}
                      </p>
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
                        aria-describedby={pwErrors.confirm ? "pw-confirm-error" : undefined}
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
                      <p id="pw-confirm-error" role="alert" className="mt-1.5 text-xs text-bad-ink font-medium">
                        {pwErrors.confirm}
                      </p>
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
          ref={removeBackdropRef}
          role="dialog"
          aria-labelledby="remove-dialog-title"
          aria-describedby="remove-dialog-desc"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === removeBackdropRef.current) closeRemoveDialog();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-panel-in"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <h3 id="remove-dialog-title" className="text-lg font-bold tracking-tight text-ink">
              Remove payout details?
            </h3>
            <p id="remove-dialog-desc" className="mt-2 text-sm text-ink-muted leading-relaxed">
              Merchants won&apos;t be able to pay you until you add new details. Everything you&apos;ve already earned is unaffected.
            </p>
            {removeError ? (
              <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {removeError}
              </div>
            ) : null}
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                ref={removeCancelBtnRef}
                type="button"
                onClick={closeRemoveDialog}
                className="inline-flex items-center justify-center rounded-xl border border-line bg-surface-muted px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink transition cursor-pointer"
              >
                Keep details
              </button>
              <button
                ref={removeConfirmBtnRef}
                type="button"
                onClick={handleRemovePayout}
                disabled={removePending}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs dark:bg-rose-600 dark:hover:bg-rose-500 px-4 py-2 text-xs transition disabled:opacity-50 cursor-pointer"
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
