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

/** Tilted cart basket with shipping boxes & motion lines. Used in PerformanceMetrics for Total Sales. */
export function TotalSalesArt({
  className = "h-14 w-auto shrink-0 select-none",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 110 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="35" x2="26" y2="38" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="11" y1="45" x2="27" y2="45" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="16" y1="52" x2="30" y2="51" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="13" y1="59" x2="28" y2="57" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" />

      <g transform="translate(58, 40) rotate(-13)">
        <rect x="-19" y="-14" width="14" height="14" rx="1" fill="var(--warn-surface, #fef3c7)" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinejoin="round" />
        <line x1="-12" y1="-14" x2="-12" y2="-8" stroke="var(--ink, #111827)" strokeWidth="1.5" strokeLinecap="round" />

        <rect x="-5" y="-21" width="15" height="21" rx="1" fill="var(--warn-surface, #fef3c7)" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinejoin="round" />
        <line x1="2.5" y1="-21" x2="2.5" y2="-13" stroke="var(--ink, #111827)" strokeWidth="1.5" strokeLinecap="round" />

        <rect x="10" y="-13" width="11" height="13" rx="1" fill="var(--warn-surface, #fef3c7)" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinejoin="round" />
        <line x1="15.5" y1="-13" x2="15.5" y2="-7" stroke="var(--ink, #111827)" strokeWidth="1.5" strokeLinecap="round" />

        <polygon points="-24,0 24,0 21,20 -19,20" fill="var(--surface, #ffffff)" />
        <polygon points="-22.5,6.5 23,6.5 21,20 -19,20" fill="var(--info-surface, #e0e7ff)" />
        <polygon points="-24,0 24,0 21,20 -19,20" stroke="var(--ink, #111827)" strokeWidth="1.85" strokeLinejoin="round" />

        <line x1="-22.5" y1="6.5" x2="23" y2="6.5" stroke="var(--ink, #111827)" strokeWidth="1.5" />
        <line x1="-21" y1="13.5" x2="22" y2="13.5" stroke="var(--ink, #111827)" strokeWidth="1.5" />

        <line x1="-14" y1="0" x2="-11" y2="20" stroke="var(--ink, #111827)" strokeWidth="1.5" />
        <line x1="-5" y1="0" x2="-3" y2="20" stroke="var(--ink, #111827)" strokeWidth="1.5" />
        <line x1="5" y1="0" x2="5" y2="20" stroke="var(--ink, #111827)" strokeWidth="1.5" />
        <line x1="14" y1="0" x2="13" y2="20" stroke="var(--ink, #111827)" strokeWidth="1.5" />

        <path d="M24,0 L28,-3 C31,-5 33,-1 30,2 L23.5,4" fill="var(--surface, #ffffff)" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <path d="M44,63 L83,55 L85,63 L46,66" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="86" cy="62.5" r="2" fill="var(--surface, #ffffff)" stroke="var(--ink, #111827)" strokeWidth="1.5" />

      <circle cx="57" cy="70" r="5" fill="var(--surface, #ffffff)" stroke="var(--ink, #111827)" strokeWidth="1.85" />
      <circle cx="57" cy="70" r="1.75" fill="var(--ink, #111827)" />

      <circle cx="75" cy="70" r="5" fill="var(--surface, #ffffff)" stroke="var(--ink, #111827)" strokeWidth="1.85" />
      <circle cx="75" cy="70" r="1.75" fill="var(--ink, #111827)" />

      <line x1="36" y1="76" x2="42" y2="76" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="47" y1="76" x2="86" y2="76" stroke="var(--ink, #111827)" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** High-five partners with megaphone & stars. Used in PerformanceMetrics for Referred Orders. */
export function ReferredOrdersArt({
  className = "h-14 w-auto shrink-0 select-none",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 105 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(22, 8) rotate(-20)">
        <polygon points="0,8 12,2 12,16 0,11" fill="var(--info-surface)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2,11 L1,16" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <polygon points="52,8 53.5,12 58,12 54.5,14.5 56,18.5 52,16 48,18.5 49.5,14.5 46,12 50.5,12" fill="var(--warn-surface)" stroke="var(--ink)" strokeWidth="1.25" />
      <polygon points="68,16 69,19 72,19 69.5,21 70.5,24 68,22 65.5,24 66.5,21 64,19 67,19" fill="var(--warn-surface)" stroke="var(--ink)" strokeWidth="1.25" />

      <path d="M32,54 L49,26" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      <path d="M72,54 L53,26" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="20" x2="46" y2="17" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="20" x2="56" y2="17" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" />

      <path d="M12,76 L15,54 C16,50 28,50 30,54 L33,76 Z" fill="var(--warn-surface)" stroke="var(--ink)" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="23" cy="41" r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.75" />
      <path d="M16,42 C14,34 26,31 28,37 C23,37 19,39 16,42 Z" fill="var(--ink)" />

      <path d="M68,76 L71,54 C72,50 84,50 86,54 L89,76 Z" fill="var(--info-surface)" stroke="var(--ink)" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="78" cy="41" r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.75" />
      <path d="M72,37 C74,31 85,32 85,39 C82,36 76,36 72,37 Z" fill="var(--ink)" />
    </svg>
  );
}

/** Clicking cursor & hand with sprouting leaves. Used in PerformanceMetrics for Link Clicks. */
export function LinkClicksArt({
  className = "h-14 w-auto shrink-0 select-none",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <line x1="22" y1="16" x2="25" y2="21" stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="32" y1="13" x2="31" y2="19" stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="14" y1="25" x2="20" y2="26" stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="16" y1="35" x2="21" y2="32" stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round" />

      <polygon points="26,25 46,35 37,39 43,50 38,53 32,42 26,48" fill="var(--info-surface)" stroke="var(--ink)" strokeWidth="1.75" strokeLinejoin="round" />

      <path d="M46,44 Q56,42 62,48" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />

      <path d="M72,38 C62,38 60,26 70,28 C72,29 72,34 72,38 Z" fill="var(--ok-surface)" stroke="var(--ink)" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M72,38 C82,38 84,26 74,28 C72,29 72,34 72,38 Z" fill="var(--ok-surface)" stroke="var(--ink)" strokeWidth="1.75" strokeLinejoin="round" />

      <path d="M69,42 L69,56 L64,53 C61,51 59,54 61,57 L68,68 C70,70 73,72 78,72 L84,72 C88,72 90,68 90,62 L90,52 C90,49 86,49 86,52 L86,50 C86,47 82,47 82,50 L82,48 C82,45 77,45 77,48 L77,42 C77,39 69,39 69,42 Z" fill="var(--warn-surface)" stroke="var(--ink)" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

/** Target bullseye with arrow & % flag. Used in PerformanceMetrics for Conversion Rate. */
export function ConversionRateArt({
  className = "h-14 w-auto shrink-0 select-none",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 95 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <line x1="48" y1="66" x2="42" y2="75" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      <line x1="64" y1="66" x2="70" y2="75" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />

      <circle cx="56" cy="46" r="22" fill="var(--info-surface)" stroke="var(--ink)" strokeWidth="1.75" />
      <circle cx="56" cy="46" r="15" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.75" />
      <circle cx="56" cy="46" r="8" fill="var(--warn-surface)" stroke="var(--ink)" strokeWidth="1.75" />
      <circle cx="56" cy="46" r="2.5" fill="var(--ink)" />

      <line x1="46" y1="25" x2="46" y2="8" stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round" />
      <polygon points="46,8 68,8 64,14 68,20 46,20" fill="var(--info-surface)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="51" y="17" fill="var(--ink)" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
        %
      </text>

      <line x1="16" y1="24" x2="56" y2="46" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      <polygon points="16,24 22,21 26,24 20,27" fill="var(--warn-surface)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="16,24 14,30 18,33 20,27" fill="var(--warn-surface)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
