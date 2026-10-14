/**
 * Spot illustrations for empty states and overview metrics.
 *
 * Deliberately geometric and responsive. Hand-built illustrations use the portal's
 * own CSS semantic tokens (`var(--ink)`, `var(--warn-ink)`, `var(--surface)`,
 * `var(--info-surface)`, `var(--brand)`), so they recolor with the active theme
 * and look native in both Light and Dark mode.
 */

const SIZE = "h-28 w-32";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 128 112" fill="none" className={SIZE} aria-hidden="true">
      {children}
    </svg>
  );
}

/** A receipt waiting to be written on. Used where orders would appear. */
export function NoOrdersArt() {
  return (
    <Frame>
      <ellipse cx="64" cy="96" rx="42" ry="7" className="fill-brand-surface" />
      <path
        d="M40 20h48v66l-8-5-8 5-8-5-8 5-8-5-8 5z"
        className="fill-surface stroke-line"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <path
        d="M50 36h28M50 48h28M50 60h18"
        className="stroke-ink-subtle"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Frame>
  );
}

/** An envelope with a note inside. Used where payouts would appear. */
export function NoPayoutsArt() {
  return (
    <Frame>
      <ellipse cx="64" cy="96" rx="42" ry="7" className="fill-brand-surface" />
      <rect
        x="34"
        y="26"
        width="60"
        height="24"
        rx="3"
        className="fill-brand-surface stroke-line"
        strokeWidth={2.4}
      />
      <rect
        x="26"
        y="42"
        width="76"
        height="44"
        rx="5"
        className="fill-surface stroke-line"
        strokeWidth={2.4}
      />
      <path
        d="M26 46l38 24 38-24"
        className="stroke-ink-subtle"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** A signpost with nothing on it. Used where programs would be listed. */
export function NoProgramsArt() {
  return (
    <Frame>
      <ellipse cx="64" cy="96" rx="42" ry="7" className="fill-brand-surface" />
      <path
        d="M64 30v62"
        className="stroke-line"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <rect
        x="30"
        y="30"
        width="44"
        height="18"
        rx="3"
        className="fill-surface stroke-line"
        strokeWidth={2.4}
      />
      <rect
        x="54"
        y="56"
        width="44"
        height="18"
        rx="3"
        className="fill-brand-surface stroke-line"
        strokeWidth={2.4}
      />
    </Frame>
  );
}

/** A flat line on a chart. Used where a period has no activity. */
export function NoActivityArt() {
  return (
    <svg viewBox="0 0 128 64" fill="none" className="h-16 w-32" aria-hidden="true">
      <path
        d="M8 56h112"
        className="stroke-line"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path
        d="M8 44h20M36 44h20M64 44h20M92 44h20"
        className="stroke-ink-subtle"
        strokeWidth={2.4}
        strokeLinecap="round"
        opacity={0.5}
      />
    </svg>
  );
}

/** Sleeping Cat & Clock. Used in the top paused program banner. */
export function PausedProgramArt({
  className = "h-18 w-auto shrink-0 select-none",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 210 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <line x1="20" y1="78" x2="195" y2="78" stroke="var(--warn-ink)" strokeWidth="2" strokeLinecap="round" />
      {/* Wall Clock */}
      <g transform="translate(88, 36)">
        <circle cx="0" cy="0" r="22" fill="var(--surface)" stroke="var(--warn-ink)" strokeWidth="2" />
        <circle cx="0" cy="0" r="18" fill="var(--info-surface)" fillOpacity="0.45" stroke="var(--warn-ink)" strokeWidth="1.25" />
        <line x1="0" y1="-14" x2="0" y2="-12" stroke="var(--warn-ink)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="0" x2="12" y2="0" stroke="var(--warn-ink)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="14" x2="0" y2="12" stroke="var(--warn-ink)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-14" y1="0" x2="-12" y2="0" stroke="var(--warn-ink)" strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="0,-10 0,0 7,5" stroke="var(--warn-ink)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Curled Sleeping Cat */}
      <path d="M102 78 C98 62, 112 46, 136 46 C160 46, 176 58, 176 74 C176 77, 173 78, 168 78 Z" fill="var(--surface)" stroke="var(--warn-ink)" strokeWidth="2" strokeLinejoin="round" />
      {/* Orange/Amber Patches */}
      <path d="M132 46 C142 46, 152 49, 158 55 C150 58, 138 56, 132 46 Z" fill="var(--warn-ink)" fillOpacity="0.35" />
      {/* Cat Head */}
      <path d="M100 62 C100 54, 103 48, 105 42 L112 48 C116 47, 121 47, 125 48 L132 42 C134 48, 137 54, 137 62 C137 71,129 76, 118.5 76 C108 76, 100 71, 100 62 Z" fill="var(--surface)" stroke="var(--warn-ink)" strokeWidth="2" strokeLinejoin="round" />
      {/* Sleeping Eyes */}
      <path d="M108 62 Q112 65 115 62" stroke="var(--warn-ink)" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M122 62 Q125 65 129 62" stroke="var(--warn-ink)" strokeWidth="1.75" strokeLinecap="round" />
      {/* Nose & Whiskers */}
      <polygon points="117,66 120,66 118.5,68" fill="var(--warn-ink)" />
      {/* Tail curled around */}
      <path d="M166 70 C182 70, 184 78, 170 78 L142 78" fill="var(--surface)" stroke="var(--warn-ink)" strokeWidth="2" strokeLinecap="round" />
      {/* Zzz */}
      <polyline points="120,18 127,18 120,26 127,26" stroke="var(--warn-ink)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="133,26 138,26 133,32 138,32" stroke="var(--warn-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Resting Hourglass & Cozy Pause Mug. Used in NextActionCard when program is paused. */
export function PausedNextActionArt({
  className = "h-16 w-auto select-none",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 110 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <line x1="12" y1="70" x2="98" y2="70" stroke="var(--warn-ink)" strokeWidth="2" strokeLinecap="round" />
      {/* Paused Hourglass on Left */}
      <g transform="translate(22, 22)">
        <rect x="0" y="0" width="26" height="4" rx="1.5" fill="var(--surface)" stroke="var(--warn-ink)" strokeWidth="1.75" />
        <rect x="0" y="44" width="26" height="4" rx="1.5" fill="var(--surface)" stroke="var(--warn-ink)" strokeWidth="1.75" />
        <path d="M3,4 C3,18 13,20 13,24 C13,28 3,30 3,44 L23,44 C23,30 13,28 13,24 C13,20 23,18 23,4 Z" fill="var(--surface)" stroke="var(--warn-ink)" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M6,42 C8,36 18,36 20,42 Z" fill="var(--warn-ink)" fillOpacity="0.45" />
      </g>
      {/* Cozy Sleepy Mug with Pause Badge on Right */}
      <g transform="translate(56, 34)">
        <path d="M26,6 C34,6 34,22 26,22" stroke="var(--warn-ink)" strokeWidth="2" strokeLinecap="round" />
        <path d="M0,0 L26,0 L24,28 C23,33 19,36 13,36 C7,36 3,33 2,28 Z" fill="var(--surface)" stroke="var(--warn-ink)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6,11 Q9,14 11,11" stroke="var(--warn-ink)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15,11 Q17,14 20,11" stroke="var(--warn-ink)" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="9" y="18" width="3" height="9" rx="1" fill="var(--brand)" />
        <rect x="14" y="18" width="3" height="9" rx="1" fill="var(--brand)" />
      </g>
      <polyline points="68,14 74,14 68,20 74,20" stroke="var(--warn-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="79,20 83,20 79,25 83,25" stroke="var(--warn-ink)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Open Wallet + Bank Card + Floating Coin. Used in NextActionCard when payout details are needed or payout is pending. */
export function AddPayoutDetailsArt({
  className = "h-20 sm:h-24 w-auto select-none shrink-0",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 115 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft Background Halo */}
      <circle cx="58" cy="56" r="36" fill="var(--warn-surface, #fef3c7)" fillOpacity={0.55} />
      {/* Ground Line */}
      <line x1="16" y1="88" x2="98" y2="88" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" />

      {/* Bank Card Sliding Into Wallet (Tilted) */}
      <g transform="translate(28, 22) rotate(-14)">
        <rect x="0" y="0" width="48" height="32" rx="4" fill="var(--info-surface, #e0e7ff)" stroke="var(--ink, #111827)" strokeWidth="1.75" />
        <rect x="0" y="7" width="48" height="6" fill="var(--brand, #4f46e5)" />
        <line x1="7" y1="21" x2="22" y2="21" stroke="var(--ink, #111827)" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Crisp Green Banknote Peeking Out */}
      <path d="M52,34 L82,26 L86,46 L54,48 Z" fill="var(--ok-surface, #d1fae5)" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="69" cy="37" r="4" fill="var(--surface, #ffffff)" stroke="var(--ok-ink, #065f46)" strokeWidth="1.5" />

      {/* Main Pocket Wallet Body */}
      <rect x="22" y="42" width="66" height="46" rx="8" fill="var(--surface, #ffffff)" stroke="var(--ink, #111827)" strokeWidth="2" />
      {/* Warm Leather Tint Overlay */}
      <rect x="22" y="42" width="66" height="46" rx="8" fill="var(--warn-surface, #fef3c7)" fillOpacity={0.45} stroke="var(--ink, #111827)" strokeWidth="2" />
      {/* Stitching Detail */}
      <line x1="28" y1="48" x2="78" y2="48" stroke="var(--warn-ink, #92400e)" strokeWidth="1.25" strokeDasharray="3 3" strokeLinecap="round" />
      {/* Wallet Clasp Strap */}
      <path d="M70,58 L92,58 C94,58 95,60 95,62 L95,68 C95,70 94,72 92,72 L70,72 C66,72 64,69 64,65 C64,61 66,58 70,58 Z" fill="var(--surface, #ffffff)" stroke="var(--ink, #111827)" strokeWidth="1.85" />
      <circle cx="71" cy="65" r="2.5" fill="var(--brand, #4f46e5)" stroke="var(--ink, #111827)" strokeWidth="1.25" />

      {/* Floating Action "+" Coin (Top Right) */}
      <circle cx="88" cy="20" r="11" fill="var(--brand, #4f46e5)" stroke="var(--ink, #111827)" strokeWidth="1.75" />
      <line x1="88" y1="15.5" x2="88" y2="24.5" stroke="var(--brand-ink, #ffffff)" strokeWidth="2" strokeLinecap="round" />
      <line x1="83.5" y1="20" x2="92.5" y2="20" stroke="var(--brand-ink, #ffffff)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const PendingPayoutArt = AddPayoutDetailsArt;

/**
 * Upgraded Urgent "No Payout Details Attached" Art (Empty Open Wallet + Highlighted Missing Ghost Card + Attention Spark Rays + Bold Urgent "!" Badge)
 * Used in NextActionCard when creator has no payout method connected.
 */
export function UrgentPayoutDetailsArt({
  className = "h-22 sm:h-24 w-auto select-none shrink-0",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Urgent Two-Tone Background Halo */}
      <circle cx="58" cy="58" r="38" fill="var(--surface, #ffffff)" fillOpacity={0.85} />
      <circle cx="58" cy="58" r="32" fill="var(--bad-surface, #ffe4e6)" fillOpacity={0.7} />

      {/* Ground Line */}
      <line x1="14" y1="90" x2="100" y2="90" stroke="var(--ink, #111827)" strokeWidth={2} strokeLinecap="round" />

      {/* Highlighted Missing / Ghost Bank Card (Tilted Above Empty Wallet) */}
      <g transform="translate(26, 18) rotate(-12)">
        <rect
          x="0"
          y="0"
          width="50"
          height="33"
          rx="4.5"
          fill="var(--bad-surface, #ffe4e6)"
          stroke="var(--bad-ink, #9f1239)"
          strokeWidth={1.85}
          strokeDasharray="4 3"
        />
        {/* Dashed Magnetic Stripe & Missing Details Lines */}
        <line x1="6" y1="9" x2="44" y2="9" stroke="var(--bad-ink, #9f1239)" strokeWidth={2} strokeLinecap="round" strokeDasharray="3 3" opacity={0.65} />
        <rect x="7" y="16" width="11" height="8" rx="1.5" fill="var(--surface, #ffffff)" stroke="var(--bad-ink, #9f1239)" strokeWidth={1.4} />
        <line x1="23" y1="20" x2="39" y2="20" stroke="var(--bad-ink, #9f1239)" strokeWidth={1.6} strokeLinecap="round" />
      </g>

      {/* Downward Dotted Prompt Arrow (Showing Card Needs to Go Into Wallet) */}
      <path d="M53,36 L53,43" stroke="var(--bad-ink, #9f1239)" strokeWidth={1.75} strokeLinecap="round" strokeDasharray="2 2.5" />

      {/* Open Empty Wallet Back Interior Flap */}
      <path d="M23,46 C23,39 87,39 87,46" fill="var(--surface-muted, #f3f4f6)" stroke="var(--ink, #111827)" strokeWidth={1.85} />

      {/* Main Wallet Body */}
      <rect x="21" y="44" width="68" height="46" rx="8" fill="var(--surface, #ffffff)" stroke="var(--ink, #111827)" strokeWidth={2} />
      {/* Subtle Warm Leather Overlay */}
      <rect x="21" y="44" width="68" height="46" rx="8" fill="var(--warn-surface, #fef3c7)" fillOpacity={0.35} stroke="var(--ink, #111827)" strokeWidth={2} />

      {/* Empty Stitched Pocket Line */}
      <line x1="28" y1="51" x2="78" y2="51" stroke="var(--warn-ink, #92400e)" strokeWidth={1.4} strokeDasharray="3.5 3.5" strokeLinecap="round" />

      {/* Unfastened / Swinging Open Wallet Clasp Strap */}
      <path
        d="M72,60 L96,56 C98.5,55.5 100,57.5 100,60 L100,66 C100,68.5 98.5,70.5 96,71 L72,74 C67.5,74 64.5,71 64.5,67 C64.5,63 67.5,60 72,60 Z"
        fill="var(--surface, #ffffff)"
        stroke="var(--ink, #111827)"
        strokeWidth={1.85}
      />
      {/* Empty Snap Button Hole */}
      <circle cx="72" cy="67" r={2.5} fill="var(--bad-surface, #ffe4e6)" stroke="var(--ink, #111827)" strokeWidth={1.4} />

      {/* Attention Spark Rays Around Exclamation Badge */}
      <line x1="96" y1="6" x2="94" y2="10" stroke="var(--bad-ink, #9f1239)" strokeWidth={1.75} strokeLinecap="round" />
      <line x1="107" y1="12" x2="103" y2="15" stroke="var(--bad-ink, #9f1239)" strokeWidth={1.75} strokeLinecap="round" />
      <line x1="110" y1="23" x2="105" y2="23" stroke="var(--bad-ink, #9f1239)" strokeWidth={1.75} strokeLinecap="round" />

      {/* Bold Urgent Exclamation Badge ("!") at Top-Right */}
      <circle cx="90" cy="24" r={12.5} fill="#f59e0b" stroke="var(--ink, #111827)" strokeWidth={2} />
      {/* Exclamation Mark Stem & Dot */}
      <line x1="90" y1="17.5" x2="90" y2="25" stroke="#ffffff" strokeWidth={2.6} strokeLinecap="round" />
      <circle cx="90" cy="29.5" r={1.5} fill="#ffffff" />
    </svg>
  );
}

/** Wallet + Floating Golden Coins + Sparkles Art for Payouts Details Header */
export function PayoutHeaderArt({ className = "w-28 sm:w-32 h-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 100" fill="none" aria-hidden="true">
      {/* Wallet Background & Border */}
      <rect x="14" y="30" width="104" height="60" rx="14" fill="var(--m, var(--brand))" fillOpacity={0.16} />
      <rect x="14" y="30" width="104" height="60" rx="14" fill="none" stroke="var(--m, var(--brand))" strokeWidth={2.5} />
      {/* Open Top Flap */}
      <path d="M30 30 98 12a8 8 0 0 1 10 6l2 12" fill="none" stroke="var(--m, var(--brand))" strokeWidth={2.5} strokeLinecap="round" />
      {/* Clasp Pocket */}
      <rect x="88" y="52" width="38" height="20" rx="10" fill="var(--surface, #ffffff)" stroke="var(--m, var(--brand))" strokeWidth={2.5} />
      <circle cx="100" cy="62" r={3.5} fill="var(--m, var(--brand))" />
      {/* Golden Coin 1 */}
      <circle cx="136" cy="26" r={13} fill="#fbbf24" />
      <circle cx="136" cy="26" r={8} fill="none" stroke="#f59e0b" strokeWidth={2} />
      {/* Golden Coin 2 */}
      <circle cx="148" cy="52" r={7} fill="#fcd34d" />
      {/* Sparkles */}
      <path d="M8 12v8M4 16h8M150 80v6M147 83h6" stroke="var(--m, var(--brand))" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

/*
 * Metric art for the Overview's performance cards.
 *
 * One family, so the four cards read as a set: the same 96×72 frame, a soft
 * brand-surface disc behind every object, objects outlined in brand-text at one
 * stroke weight, and exactly one solid brand accent each. Status colours are
 * kept out on purpose — amber means "pending" everywhere else in the portal.
 * All colour comes from the theme tokens, so dark mode needs nothing extra.
 *
 * Each says one literal thing at 56px tall: a bag with a price tag (sales), a
 * parcel with a check (an order credited), a cursor on a link (a click), and a
 * funnel with several visits in and one purchase out (conversion).
 */

type ArtProps = { className?: string };

const STROKE = 2.25;

function MetricFrame({ className, children }: ArtProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 96 72" fill="none" className={className} aria-hidden="true">
      <circle cx="48" cy="38" r="29" className="fill-brand-surface" />
      {children}
    </svg>
  );
}

/** A shopping bag with a price tag. Used for Total sales. */
export function TotalSalesArt({ className = "h-14 w-auto shrink-0 select-none" }: ArtProps) {
  return (
    <MetricFrame className={className}>
      <path
        d="M38 30v-4a8 8 0 0 1 16 0v4"
        className="stroke-brand-text"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d="M29 30h34l3 30a3 3 0 0 1-3 3.3H29a3 3 0 0 1-3-3.3z"
        className="fill-surface"
      />
      {/* The bag's shaded side, drawn under the outline. */}
      <path d="M57 30h6l3 30a3 3 0 0 1-3 3.3h-4.5z" className="fill-brand-line" />
      <path
        d="M29 30h34l3 30a3 3 0 0 1-3 3.3H29a3 3 0 0 1-3-3.3z"
        className="stroke-brand-text"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <circle cx="38" cy="37" r="1.75" className="fill-brand-text" />
      <circle cx="54" cy="37" r="1.75" className="fill-brand-text" />
      <g transform="rotate(-24 65 52)">
        <path
          d="M57 44h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H57l-7-8z"
          className="fill-brand stroke-surface"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <circle cx="57.5" cy="52" r="2.25" className="fill-surface" />
        <path d="M63 52h6" className="stroke-brand-ink" strokeWidth={STROKE} strokeLinecap="round" />
      </g>
    </MetricFrame>
  );
}

/** A parcel with a check badge: an order credited. Used for Referred orders. */
export function ReferredOrdersArt({ className = "h-14 w-auto shrink-0 select-none" }: ArtProps) {
  return (
    <MetricFrame className={className}>
      <path
        d="M27 33l5-9h30l5 9z"
        className="fill-brand-line stroke-brand-text"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <rect
        x="27"
        y="33"
        width="40"
        height="29"
        rx="3"
        className="fill-surface stroke-brand-text"
        strokeWidth={STROKE}
      />
      <path
        d="M47 24v20M33 55h8"
        className="stroke-brand-text"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <circle cx="66" cy="55" r="10.5" className="fill-brand stroke-surface" strokeWidth={2.5} />
      <path
        d="M61.2 55.2l3.3 3.3 6.2-6.6"
        className="stroke-brand-ink"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </MetricFrame>
  );
}

/** A cursor clicking a link. Used for Link clicks. */
export function LinkClicksArt({ className = "h-14 w-auto shrink-0 select-none" }: ArtProps) {
  return (
    <MetricFrame className={className}>
      <rect
        x="18"
        y="22"
        width="56"
        height="22"
        rx="11"
        className="fill-surface stroke-brand-text"
        strokeWidth={STROKE}
      />
      {/* Chain-link glyph, then a bar standing in for the URL. */}
      <path
        d="M33.5 30.5h-3a3.5 3.5 0 0 0 0 7h3M36.5 30.5h3a3.5 3.5 0 0 1 0 7h-3M31.5 34h7"
        className="stroke-brand-text"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M47 33h17" className="stroke-brand-line" strokeWidth={4} strokeLinecap="round" />
      <path
        d="M58 44l.2 19.5 5.2-5 4.2 8.4 3.6-1.7-4.1-8.3 7.2-.2z"
        className="fill-brand stroke-surface"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </MetricFrame>
  );
}

/** A funnel: several visits in, one purchase out. Used for Conversion rate. */
export function ConversionRateArt({ className = "h-14 w-auto shrink-0 select-none" }: ArtProps) {
  return (
    <MetricFrame className={className}>
      {[
        [34, 17],
        [45, 12],
        [56, 18],
        [66, 13],
      ].map(([cx, cy]) => (
        <circle
          key={cx}
          cx={cx}
          cy={cy}
          r="2.75"
          className="fill-brand-line stroke-brand-text"
          strokeWidth={1.5}
        />
      ))}
      <path
        d="M24 23h48l-16 20v13h-16v-13z"
        className="fill-surface stroke-brand-text"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M24 23h48l-4 5h-40z"
        className="fill-brand-line stroke-brand-text"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <circle cx="48" cy="64" r="5" className="fill-brand" />
    </MetricFrame>
  );
}
