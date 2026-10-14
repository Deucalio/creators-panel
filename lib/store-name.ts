/**
 * What to call a store in front of a creator.
 *
 * `Store.name` is the shop's own name, mirrored by the Shopify app; until the
 * merchant's dashboard has loaded once it is null, and the myshopify handle is
 * the only thing left. Pure, so client and server components can both use it.
 */
export function storeDisplayName(store: { shop: string; name?: string | null }): string {
  return store.name?.trim() || store.shop.replace(/\.myshopify\.com$/, "");
}
