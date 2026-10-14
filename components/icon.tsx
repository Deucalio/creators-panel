/**
 * The portal's icon set, drawn inline.
 *
 * Hand-built rather than a library because every stroke uses `currentColor`,
 * which means an icon inherits whatever token its container sets and both
 * themes work with no extra rules. A third-party set would arrive with its own
 * visual voice and its own colours to override.
 *
 * All icons are decorative: they sit beside a text label that already says the
 * same thing, so they are `aria-hidden` and add nothing for a screen reader to
 * repeat. Anywhere an icon has to carry meaning on its own, it needs a label at
 * the call site instead.
 */

const PATHS = {
  // Navigation
  overview:
    "M3.5 4.5a1 1 0 0 1 1-1h4.5a1 1 0 0 1 1 1V9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1zM14 4.5a1 1 0 0 1 1-1h4.5a1 1 0 0 1 1 1V9a1 1 0 0 1-1 1H15a1 1 0 0 1-1-1zM3.5 15a1 1 0 0 1 1-1H9a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1zM14 15a1 1 0 0 1 1-1h4.5a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1H15a1 1 0 0 1-1-1z",
  earnings: "M6 2.5h12a1 1 0 0 1 1 1v18l-3.3-2.2L12.4 21 9 18.8 5 21V3.5a1 1 0 0 1 1-1zM9 8h6M9 12h6",
  payouts: "M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 15.5zM3 10.5h18M16.5 14.5h1.5",
  program: "M12 6.8v13M4 4.5h5.4A2.6 2.6 0 0 1 12 7v12a2 2 0 0 0-2-1.4H4zM20 4.5h-5.4A2.6 2.6 0 0 0 12 7v12a2 2 0 0 1 2-1.4h6z",
  share: "M8.4 10.6l7.2-4.2M8.4 13.4l7.2 4.2",

  // Metrics
  sales: "M3.5 17.5l6-6 4 4 7-7M16.5 8.5h4v4",
  clicks: "M5 3.5l6.5 16 2.4-6.3 6.1-2.3z",
  orders: "M5.5 8h13l-1 12h-11zM9 8V6.2a3 3 0 0 1 6 0V8",
  commission: "M12 7.2v9.6M14.4 9.9c0-1-1-1.6-2.4-1.6s-2.4.6-2.4 1.7c0 2.3 4.8 1.3 4.8 3.5 0 1.1-1 1.7-2.4 1.7s-2.4-.6-2.4-1.6",
  pending: "M12 7.4v4.9l3.1 1.9",
  paid: "M8.4 12.3l2.4 2.4 4.7-5.1",
  conversion: "M18.5 5.5l-13 13",

  // Actions & UI
  arrow: "M5 12h13M12.5 6l6 6-6 6",
  copy: "M9 9.5A1.5 1.5 0 0 1 10.5 8h8A1.5 1.5 0 0 1 20 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 9 17.5zM15 8V6.5A1.5 1.5 0 0 0 13.5 5h-8A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16H7",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 18L18 6M6 6l12 12",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 5l7 7-7 7",
  chevronUpDown: "M8 9l4-4 4 4M8 15l4 4 4-4",
  store: "M3 9l2-5h14l2 5M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  signOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  monitor: "M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM8 20h8M12 16v4",
  external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
  check: "M20 6L9 17l-5-5",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  sparkles: "M12 3l1.9 5.6L20 10.5l-4.5 4.1 1.3 5.9-4.8-3.1-4.8 3.1 1.3-5.9L4 10.5l6.1-1.9z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  info: "M12 16v-4M12 8h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
} as const;

/** Icons whose shape needs a circle the path data can't express. */
const CIRCLES: Partial<Record<IconName, Array<[number, number, number]>>> = {
  eye: [[12, 12, 3]],
  share: [
    [18, 5.5, 2.4],
    [6, 12, 2.4],
    [18, 18.5, 2.4],
  ],
  commission: [[12, 12, 8.6]],
  pending: [[12, 12, 8.6]],
  paid: [[12, 12, 8.6]],
  conversion: [
    [7.4, 7.4, 2.4],
    [16.6, 16.6, 2.4],
  ],
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {CIRCLES[name]?.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
      <path d={PATHS[name]} />
    </svg>
  );
}
