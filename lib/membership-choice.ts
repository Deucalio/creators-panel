/**
 * Which of a creator's memberships a page shows: the one the link asks for,
 * else the first active one, else the first.
 *
 * The pages (through `selectMembership`) and the sidebar both use this, so they
 * can't disagree. They used to fall back differently, and an old link to a
 * deleted program showed one store in the sidebar and another in the page.
 * No server imports, because the sidebar is a Client Component.
 */
export function pickMembership<T extends { id: string; status: string }>(
  memberships: readonly T[],
  requested: string | null | undefined,
): T | undefined {
  return (
    memberships.find((m) => m.id === requested) ??
    memberships.find((m) => m.status === "ACTIVE") ??
    memberships[0]
  );
}
