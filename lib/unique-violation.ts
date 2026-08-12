import { Prisma } from "@prisma/client";

/**
 * Which columns a Prisma unique-constraint (P2002) failure was raised on, or
 * null when the error is something else.
 *
 * Used instead of a check-then-insert: asking "does this exist?" before writing
 * races against concurrent requests, whereas the database index cannot.
 */
export function uniqueViolationTargets(error: unknown): string[] | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return null;
  }

  const target = error.meta?.target;

  if (Array.isArray(target)) return target as string[];
  if (typeof target === "string") return [target];
  return [];
}
