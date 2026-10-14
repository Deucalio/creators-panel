import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Lets plain Node load the portal's TypeScript the way the bundler does:
 * `@/lib/x` resolves from the project root (tsconfig `paths`), and extensionless
 * specifiers find their `.ts` file. Node strips the types itself.
 */
const ROOT = new URL("../../", import.meta.url);
const EXTENSIONS = [".ts", ".tsx", ".js", ".mjs"];

function withExtension(base) {
  for (const extension of EXTENSIONS) {
    const candidate = new URL(`${base.href}${extension}`);
    if (existsSync(fileURLToPath(candidate))) return candidate.href;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const found = withExtension(new URL(specifier.slice(2), ROOT));
    if (found) return next(found, context);
  }

  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  if (relative && context.parentURL && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    const found = withExtension(new URL(specifier, context.parentURL));
    if (found) return next(found, context);
  }

  return next(specifier, context);
}
