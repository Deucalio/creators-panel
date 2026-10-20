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
  className = "h-20 sm:h-24 w-auto shrink-0 select-none hidden sm:block",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`il ${className}`}
      viewBox="0 0 220 104"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A cat asleep next to an alarm clock"
    >
      <ellipse className="fl-shadow" cx="140" cy="99" rx="68" ry="4" />

      {/* alarm clock */}
      <path d="M42 72 L36 82 M66 72 L72 82" />
      <circle className="f-indigo" cx="36" cy="28" r="8" />
      <circle className="f-indigo" cx="72" cy="28" r="8" />
      <path d="M54 22 V15 M49 15 H59" />
      <circle className="f-lilac" cx="54" cy="50" r="25" />
      <circle className="f-paper th" cx="54" cy="50" r="19" />
      <path className="th" d="M54 34 V37 M54 63 V66 M38 50 H41 M67 50 H70" />
      <path d="M54 50 V39 M54 50 L61 55" />
      <circle className="ns f-line" cx="54" cy="50" r="2.4" />

      {/* cat */}
      <ellipse className="f-orange" cx="152" cy="78" rx="48" ry="21" />
      <path className="th" opacity={0.45} d="M141 59 q4 7 1 14 M155 57 q4 8 0 15 M169 59 q4 7 0 14" />
      <path strokeWidth="11" d="M196 74 C211 77 208 94 188 94 L134 94" />
      <path className="st-orange" strokeWidth="7" d="M196 74 C211 77 208 94 188 94 L134 94" />
      <circle className="ns f-orange" cx="195" cy="74" r="6.5" />

      <path className="f-orange" d="M98 70 L97 53 L110 62 Z" />
      <path className="f-orange" d="M114 62 L127 53 L126 70 Z" />
      <path className="ns f-pink" d="M100.5 64 L100.3 58 L105.5 61.5 Z" />
      <path className="ns f-pink" d="M119 61.5 L124 58 L123.8 64 Z" />
      <circle className="f-orange" cx="112" cy="78" r="17" />
      <ellipse className="ns f-cream" cx="112" cy="85" rx="8" ry="5.5" />
      <path d="M100 77 q5 4.5 10 0 M114 77 q5 4.5 10 0" />
      <path className="f-pink th" d="M109.8 82 h4.4 l-2.2 2.8 Z" />
      <path className="th" d="M112 84.8 v1.6 M112 86.4 q-2.6 2 -4.6 0 M112 86.4 q2.6 2 4.6 0" />
      <circle className="ns f-pink" cx="102" cy="84" r="3" opacity={0.8} />
      <circle className="ns f-pink" cx="122" cy="84" r="3" opacity={0.8} />
      <path className="th" d="M95 83 h-6 M95 86.5 l-6 1.5 M129 83 h6 M129 86.5 l6 1.5" />
      <ellipse className="f-cream" cx="126" cy="93" rx="9" ry="4.5" />

      {/* zzz */}
      <path className="float" d="M97 34 h11 l-11 12 h11" />
      <path className="float d2 th" d="M114 22 h8 l-8 9 h8" />
      <path className="float d3 th" d="M129 10 h6 l-6 7 h6" />

      {/* sparkles */}
      <path className="f-yellow th twinkle" d="M176 23 L178.1 27.9 L183 30 L178.1 32.1 L176 37 L173.9 32.1 L169 30 L173.9 27.9 Z" />
      <path className="f-yellow th twinkle d2" d="M196 48 L197.2 50.8 L200 52 L197.2 53.2 L196 56 L194.8 53.2 L192 52 L194.8 50.8 Z" />
      <circle className="ns f-indigo" cx="160" cy="22" r="2" />
      <circle className="ns f-coral" cx="188" cy="16" r="1.8" />
    </svg>
  );
}

/** Resting Hourglass & Cozy Pause Mug. Used in NextActionCard when program is paused. */
export function PausedNextActionArt({
  className = "h-16 w-auto select-none shrink-0",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`il ${className}`}
      viewBox="0 0 120 84"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A paused hourglass next to a sleepy mug"
    >
      <path className="th" d="M6 71 H114" />

      {/* hourglass */}
      <path className="f-blue" d="M17 20 C17 34 27 37 27 42 C27 47 17 50 17 66 H37 C37 50 27 47 27 42 C27 37 37 34 37 20 Z" />
      <path className="f-yellow th" d="M20 20 H34 C33.6 25 31 28.5 27 30.5 C23 28.5 20.4 25 20 20 Z" />
      <path className="f-yellow th" d="M19 66 C19.6 58 23.5 55 27 52.5 C30.5 55 34.4 58 35 66 Z" />
      <path className="th" d="M15 20 V66 M39 20 V66" />
      <rect className="f-indigo" x="12" y="15" width="30" height="6" rx="3" />
      <rect className="f-indigo" x="12" y="66" width="30" height="5" rx="2.5" />

      {/* sleepy mug */}
      <path d="M91 46 Q104 46 103 55 Q102 64 90 62" />
      <path className="f-lilac" d="M62 40 H92 L90 66 Q89.6 71 85 71 H69 Q64.4 71 64 66 Z" />
      <path className="th" d="M62 40 H92" />
      <path className="th" d="M68 53 q3 3.5 6 0 M80 53 q3 3.5 6 0" />
      <circle className="ns f-pink" cx="67" cy="59" r="2.4" opacity={0.9} />
      <circle className="ns f-pink" cx="87" cy="59" r="2.4" opacity={0.9} />
      <path className="th" d="M75 59 q2 2.2 4 0" />

      {/* pause badge + zzz */}
      <circle className="f-indigo" cx="104" cy="22" r="9" />
      <rect className="ns" fill="var(--brand-ink)" x="100.4" y="17.5" width="2.9" height="9" rx="1.2" />
      <rect className="ns" fill="var(--brand-ink)" x="105.7" y="17.5" width="2.9" height="9" rx="1.2" />
      <path className="float th" d="M66 26 h8 l-8 9 h8" />
      <path className="float d2 th" d="M80 13 h5 l-5 6 h5" />
      <path className="f-yellow th twinkle" d="M52 14 L53.2 16.8 L56 18 L53.2 19.2 L52 22 L50.8 19.2 L48 18 L50.8 16.8 Z" />
    </svg>
  );
}

/** Chunky Link + Flying Paper Plane. Used in My Referral Link card. */
export function ReferralLinkArt({
  className = "h-24 sm:h-26 w-auto select-none shrink-0 hidden sm:block",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`il ${className}`}
      viewBox="0 0 160 104"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse className="fl-shadow" cx="78" cy="99" rx="52" ry="4" />
      <circle className="ns f-lilac" cx="78" cy="58" r="40" opacity={0.55} />

      {/* dotted flight path */}
      <path className="th" strokeDasharray="1.5 5" d="M104 66 C124 68 128 52 119 41" />

      {/* chunky link */}
      <g transform="translate(40 25) scale(3.2)">
        <path strokeWidth="3.3" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path className="st-indigo" strokeWidth="1.95" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path strokeWidth="3.3" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        <path className="st-yellow" strokeWidth="1.95" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </g>

      {/* paper plane */}
      <g transform="translate(131 26) rotate(-16)">
        <g className="plane">
          <path className="f-lilac" d="M-10 0 L22 0 L-18 10 Z" />
          <path className="f-paper" d="M-18 -10 L22 0 L-10 0 Z" />
        </g>
      </g>

      {/* credited coin + heart */}
      <g className="float">
        <circle className="f-yellow" cx="140" cy="74" r="8.5" />
        <text className="ns" x="140" y="77.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--il-line)">$</text>
      </g>
      <path className="f-coral th" d="M26 52 C19 47 20 40 24 40 C26 40 26 42 26 42 C26 42 27 40 29 40 C33 40 33 47 26 52 Z" />

      <path className="f-yellow th twinkle" d="M30 20 L31.6 24.4 L36 26 L31.6 27.6 L30 32 L28.4 27.6 L24 26 L28.4 24.4 Z" />
      <path className="f-yellow th twinkle d2" d="M146 48 L147.2 50.8 L150 52 L147.2 53.2 L146 56 L144.8 53.2 L142 52 L144.8 50.8 Z" />
      <circle className="ns f-indigo" cx="104" cy="14" r="2" />
      <circle className="ns f-coral" cx="150" cy="14" r="1.8" />
    </svg>
  );
}

/** Coupon Ticket Voucher with Tracking Toggle Switch. Used in My Coupon Code card. */
export function CouponCodeArt({
  enabled = false,
  className = "h-24 sm:h-26 w-auto select-none shrink-0 hidden sm:block",
}: {
  enabled?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`il ${className}`}
      viewBox="0 0 140 104"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse className="fl-shadow" cx="70" cy="99" rx="46" ry="4" />
      <circle className="ns f-lilac" cx="68" cy="56" r="40" opacity={0.5} />

      <g transform="translate(20 24) rotate(-6 48 26)">
        <path className="f-cream" d="M8 0 H88 A8 8 0 0 1 96 8 V19 A7 7 0 0 0 96 33 V44 A8 8 0 0 1 88 52 H8 A8 8 0 0 1 0 44 V33 A7 7 0 0 0 0 19 V8 A8 8 0 0 1 8 0 Z" />
        <path className="th" strokeDasharray="3 3.5" d="M68 8 V44" />
        <circle className="f-yellow" cx="30" cy="26" r="14" />
        <path d="M24.5 32 L35.5 20" />
        <circle className="f-paper th" cx="25.5" cy="21.5" r="2.7" />
        <circle className="f-paper th" cx="34.5" cy="30.5" r="2.7" />
        <path className="th" strokeDasharray="2.5 3" d="M76 26 H89" />
      </g>

      {/* switch */}
      {enabled ? (
        <g transform="translate(76 66)">
          <rect className="f-mint" width="48" height="26" rx="13" />
          <circle className="f-paper" cx="35" cy="13" r="8.5" />
          <text className="ns" x="17" y="16.4" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--il-line)">ON</text>
        </g>
      ) : (
        <g transform="translate(76 66)">
          <rect className="f-grey" width="48" height="26" rx="13" />
          <circle className="f-paper" cx="13" cy="13" r="8.5" />
          <text className="ns" x="34" y="16.4" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--il-line)" opacity={0.6}>OFF</text>
        </g>
      )}

      <path className="float th" d="M104 20 h8 l-8 9 h8" />
      <path className="float d2 th" d="M118 8 h5 l-5 6 h5" />
      <path className="f-yellow th twinkle" d="M16 42 L17.2 44.8 L20 46 L17.2 47.2 L16 50 L14.8 47.2 L12 46 L14.8 44.8 Z" />
      <circle className="ns f-coral" cx="26" cy="88" r="2" />
    </svg>
  );
}

/** Creator with Laptop, Camera, Photos & Sparkles. Used in Welcome Header. */
export function WelcomeHeaderArt({
  className = "h-32 sm:h-36 w-auto shrink-0 select-none hidden xl:block",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`il ${className}`}
      viewBox="0 0 300 160"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A creator working on a laptop surrounded by photos, a camera and social icons"
    >
      <ellipse className="fl-shadow" cx="150" cy="150" rx="132" ry="4" />
      <path className="th" d="M8 147 H292" />

      {/* photo frame, landscape */}
      <g transform="rotate(-7 38 56)">
        <rect className="f-paper" x="14" y="34" width="48" height="38" rx="4" />
        <rect className="f-blue th" x="19" y="39" width="38" height="28" rx="2" />
        <circle className="ns f-yellow" cx="48" cy="48" r="4.5" />
        <path className="f-mint th" d="M19 67 L30 52 L38 61 L44 55 L57 67 Z" />
      </g>
      {/* photo frame, portrait */}
      <g transform="rotate(6 78 36)">
        <rect className="f-paper" x="66" y="18" width="26" height="34" rx="3.5" />
        <rect className="f-lilac th" x="70" y="22" width="18" height="26" rx="2" />
        <circle className="f-skin th" cx="79" cy="31" r="4" />
        <path className="f-coral th" d="M71 48 C71 40 75 37 79 37 C83 37 87 40 87 48 Z" />
      </g>

      {/* play bubble */}
      <rect className="f-coral" x="106" y="16" width="38" height="28" rx="8" />
      <path className="f-paper th" d="M120 24 L132 30 L120 36 Z" />

      {/* lightbulb */}
      <path className="th" d="M180 12 V8 M166 18 L163 15 M194 18 L197 15" />
      <circle className="f-yellow" cx="180" cy="28" r="10" />
      <path className="th" d="M177 30 L180 26 L183 30" />
      <path className="f-paper" d="M175 37 h10 v4 q0 3 -3 3 h-4 q-3 0 -3 -3 Z" />

      {/* heart bubble */}
      <path className="f-pink" d="M214 18 H228 Q238 18 238 28 V34 Q238 44 228 44 H222 L209 53 L214 44 Q204 44 204 34 V28 Q204 18 214 18 Z" />
      <path className="f-coral th" d="M221 38 C212 32 214 24 218.5 24.5 C220 24.7 221 26 221 27 C221 26 222 24.7 223.5 24.5 C228 24 230 32 221 38 Z" />
      <path className="f-pink th" d="M250 70 C242 64 243 56 247 56 C249 56 250 58 250 59 C250 58 251 56 253 56 C257 56 258 64 250 70 Z" />

      {/* camera */}
      <rect className="f-yellow th" x="50" y="116" width="9" height="5" rx="1.5" />
      <rect className="f-indigo" x="27" y="115" width="14" height="7" rx="2" />
      <rect className="f-indigo" x="20" y="121" width="46" height="26" rx="5" />
      <rect className="f-yellow th" x="54" y="125" width="8" height="5" rx="1.5" />
      <circle className="f-paper" cx="43" cy="134" r="10" />
      <circle className="f-blue th" cx="43" cy="134" r="6" />
      <circle className="ns f-paper" cx="41" cy="132" r="1.7" />

      {/* creator */}
      <path className="f-hair" d="M134 80 C132 62 140 55 150 55 C160 55 168 62 166 80 C165 92 170 100 166 108 L134 108 C130 100 135 92 134 80 Z" />
      <path className="f-yellow" d="M122 124 C122 106 130 97 150 97 C170 97 178 106 178 124 Z" />
      <rect className="f-skin" x="145" y="86" width="10" height="12" rx="3" />
      <circle className="f-skin" cx="150" cy="76" r="14" />
      <path className="f-hair" d="M135 77 C134 62 142 58 150 58 C158 58 166 62 165 77 C161 70 157 66 150 66 C143 66 139 70 135 77 Z" />
      <circle className="ns f-line" cx="144.5" cy="79" r="1.5" />
      <circle className="ns f-line" cx="155.5" cy="79" r="1.5" />
      <path className="th" d="M146 84 q4 3.5 8 0" />
      <circle className="ns f-pink" cx="141" cy="83" r="2.8" opacity={0.85} />
      <circle className="ns f-pink" cx="159" cy="83" r="2.8" opacity={0.85} />

      {/* laptop */}
      <rect className="f-paper" x="122" y="118" width="56" height="25" rx="3" />
      <circle className="f-yellow th" cx="150" cy="130.5" r="4" />
      <rect className="f-lilac" x="114" y="143" width="72" height="4" rx="2" />
      {/* hands on the lid */}
      <circle className="f-skin" cx="138" cy="117" r="5" />
      <circle className="f-skin" cx="162" cy="117" r="5" />

      {/* coffee */}
      <path className="th" d="M214 122 q-3 -3.5 0 -7 q3 -3.5 0 -7 M222 122 q-3 -3.5 0 -7 q3 -3.5 0 -7" />
      <path d="M228 131 Q237 131 236 138 Q235 144 226 143" />
      <path className="f-paper" d="M208 128 H228 L225.5 144 Q225 147 222 147 H214 Q211 147 210.5 144 Z" />
      <path className="f-lilac th" d="M208.6 133 H227.4 L226.5 139 H209.5 Z" />

      {/* plant */}
      <path className="f-mint" d="M265 134 C257 126 258 114 266 111 C271 119 270 128 265 134 Z" />
      <path className="f-mint" d="M265 134 C268 124 276 118 284 118 C284 127 276 134 265 134 Z" />
      <path className="f-orange" d="M255 147 L258 134 H274 L277 147 Z" />

      {/* sparkles */}
      <path className="f-yellow th twinkle" d="M100 71 L101.5 74.5 L105 76 L101.5 77.5 L100 81 L98.5 77.5 L95 76 L98.5 74.5 Z" />
      <path className="f-yellow th twinkle d2" d="M196 64 L197.8 68.2 L202 70 L197.8 71.8 L196 76 L194.2 71.8 L190 70 L194.2 68.2 Z" />
      <circle className="ns f-indigo" cx="120" cy="58" r="2" />
      <circle className="ns f-coral" cx="232" cy="84" r="2.2" />
      <circle className="ns f-mint" cx="96" cy="104" r="2" />
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
