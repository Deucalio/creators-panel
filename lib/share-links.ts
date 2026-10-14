/**
 * Building tracked storefront links.
 *
 * Pure — no `server-only` — because the link builder is a client component that
 * has to rebuild the URL on every keystroke. Putting this in a server module
 * would compile, typecheck, and then fail in the browser.
 */

const REF_PARAM = "ref";

/**
 * Where a store can be reached. `shop` is the permanent `*.myshopify.com`
 * domain; `primaryDomain` is the merchant's own (`brand.com`), mirrored by the
 * Shopify app and null until the merchant's dashboard first loads.
 *
 * A live store sells on its primary domain, so that is the address a creator
 * copies out of their browser and the one shoppers trust in a link. Shopify
 * redirects the myshopify domain to it with the query string intact, so links
 * built on either still track.
 */
export type Storefront = { shop: string; primaryDomain?: string | null };

/** The host links are built on: the merchant's own domain once it is known. */
export function linkHost(store: Storefront): string {
  return (store.primaryDomain || store.shop).toLowerCase();
}

/** `www.brand.com` and `brand.com` are the same storefront to a shopper. */
function bareHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function belongsToStore(store: Storefront, host: string): boolean {
  const candidate = bareHost(host);
  return [store.shop, store.primaryDomain]
    .filter((known): known is string => Boolean(known))
    .some((known) => bareHost(known) === candidate);
}

/**
 * Turn whatever a creator pastes into a tracked link on their merchant's store.
 *
 * They will paste a full product URL copied from the browser, or a bare path,
 * so both are accepted. Anything pointing at a different domain is rejected
 * rather than silently rehosted: a creator who pastes a competitor's URL should
 * be told, not handed a link that quietly points somewhere they did not mean.
 */
export function buildTrackedLink(
  store: Storefront,
  referralCode: string,
  input: string,
): { url: string } | { error: string } {
  const host = linkHost(store);
  const origin = `https://${host}`;
  const raw = input.trim();

  if (!raw) return { url: storeLink(store, referralCode) };

  let parsed: URL;
  try {
    // A bare path has no scheme, so resolve it against the store.
    parsed = new URL(raw, `${origin}/`);
  } catch {
    return { error: "That doesn't look like a link or a page address." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { error: "Only web links can be tracked." };
  }

  if (!belongsToStore(store, parsed.hostname)) {
    return {
      error: `That link points at ${parsed.hostname}, not ${host}. Only pages on the store you're promoting can be tracked.`,
    };
  }

  // Always https and always the canonical host, whatever was pasted.
  const url = new URL(parsed.pathname + parsed.search + parsed.hash, origin);
  // Overwrite rather than append: pasting an already-tracked link — including
  // another creator's — must not produce a URL with two ref values, where the
  // storefront would pick one and the creator would never know which.
  url.searchParams.set(REF_PARAM, referralCode);

  return { url: url.toString() };
}

/** The creator's plain store link, used as the default and on the overview. */
export function storeLink(store: Storefront, referralCode: string): string {
  return `https://${linkHost(store)}/?${REF_PARAM}=${encodeURIComponent(referralCode)}`;
}

/** A product link, when the handle is known. */
export function productLink(store: Storefront, referralCode: string, handle: string): string {
  return `https://${linkHost(store)}/products/${encodeURIComponent(handle)}?${REF_PARAM}=${encodeURIComponent(referralCode)}`;
}
