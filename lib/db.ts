import { PrismaClient } from "@prisma/client";

// Reuse one client across dev hot reloads so we don't exhaust the connection
// pool on the Postgres instance shared with the Shopify admin app.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
