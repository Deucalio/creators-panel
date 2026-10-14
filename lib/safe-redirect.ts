/**
 * Confining a post-login `?redirectTo=` to this site.
 *
 * Pure so it can be tested directly. A prefix check ("starts with / but not
 * //") is not enough: browsers treat `\` as `/` and strip tabs and newlines from
 * URLs, so `/\evil.com` and `/<tab>/evil.com` both pass that check and still
 * navigate to evil.com. Parsing with the WHATWG URL parser — the one browsers
 * use — against a placeholder origin settles it the same way the browser will:
 * if the result has left that origin, it was never a local path.
 */

const FALLBACK = "/dashboard";
const PLACEHOLDER_ORIGIN = "http://partnerloop.invalid";

export function safeRedirectTarget(target: string | null | undefined): string {
  if (!target || !target.startsWith("/")) return FALLBACK;

  let parsed: URL;
  try {
    parsed = new URL(target, PLACEHOLDER_ORIGIN);
  } catch {
    return FALLBACK;
  }

  if (parsed.origin !== PLACEHOLDER_ORIGIN) return FALLBACK;
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
