import QRCode from "qrcode";
import { getCreatorAccount, selectMembership } from "@/lib/auth";
import { buildTrackedLink } from "@/lib/share-links";

export const dynamic = "force-dynamic";

/**
 * QR image for a tracked link, as SVG.
 *
 * Rendered here rather than in the browser so no QR library reaches the client
 * bundle, and so the encoded URL is always one this server built.
 *
 * The endpoint deliberately never encodes an arbitrary `?url=`. It takes a
 * membership and a path, resolves the membership against the signed-in
 * account's own list, and runs the path through `buildTrackedLink`, which
 * refuses anything off the merchant's domain. Otherwise this would be an open
 * QR generator on someone else's origin — a neat way to dress up a phishing
 * link as a PartnerLoop URL.
 */
export async function GET(request: Request) {
  const account = await getCreatorAccount();
  if (!account) return new Response("Not signed in", { status: 401 });

  const params = new URL(request.url).searchParams;
  const membership = selectMembership(account, params.get("program") ?? undefined);

  if (!membership || membership.status !== "ACTIVE") {
    return new Response("No active membership", { status: 404 });
  }

  const built = buildTrackedLink(
    membership.program.store,
    membership.referralCode,
    params.get("path") ?? "",
  );

  if ("error" in built) return new Response(built.error, { status: 400 });

  const svg = await QRCode.toString(built.url, {
    type: "svg",
    margin: 1,
    // Medium recovery tolerates a logo overlay or a scuffed print without
    // bloating the pattern the way High would.
    errorCorrectionLevel: "M",
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // Private: the URL embeds this creator's referral code, so a shared cache
      // handing it to someone else would credit the wrong person.
      "Cache-Control": "private, max-age=300",
    },
  });
}
