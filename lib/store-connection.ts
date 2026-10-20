import "server-only";

import prisma from "@/lib/db";

/**
 * Whether the store still has PartnerLoop installed.
 *
 * There's no "installed" column. The Shopify app's `app/uninstalled` webhook
 * deletes the store's sessions, and installing or reinstalling creates one, so a
 * store with no session row is one whose merchant removed the app. Its programs
 * and memberships stay for 48 hours, until `shop/redact` erases them. In that
 * window nothing is tracked: the storefront embed is gone and order webhooks
 * stop. Without this check, the portal kept calling such a program active.
 *
 * Reads only a row id, never a token.
 */
export async function isStoreConnected(shop: string): Promise<boolean> {
  const session = await prisma.session.findFirst({ where: { shop }, select: { id: true } });
  return session !== null;
}
