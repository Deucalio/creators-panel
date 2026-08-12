// Re-copies the canonical Prisma schema from the Shopify admin app so both
// projects always generate a client for the same tables.
//
// Usage: npm run schema:sync   (copies, then runs `prisma generate`)
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, "../../partner-loop-creator-growth/prisma/schema.prisma");
const TARGET = resolve(here, "../prisma/schema.prisma");

const HEADER = `// ─────────────────────────────────────────────────────────────────────────────
// GENERATED COPY — DO NOT EDIT, AND DO NOT MIGRATE FROM HERE.
//
// Canonical schema: ../partner-loop-creator-growth/prisma/schema.prisma
//
// The Shopify admin app owns this database and is the only project that runs
// \`prisma db push\` / \`prisma migrate\`. This copy exists so \`prisma generate\`
// can produce a typed client for the same tables. After any schema change:
//
//   npm run schema:sync
// ─────────────────────────────────────────────────────────────────────────────
`;

const source = await readFile(SOURCE, "utf8");

// Strip the canonical file's own leading comment block so headers don't stack.
const body = source.replace(/^(\/\/[^\n]*\n)+/, "");

await writeFile(TARGET, `${HEADER}${body}`, "utf8");
console.log(`Synced schema from ${SOURCE}`);
