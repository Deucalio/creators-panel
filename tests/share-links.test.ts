import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTrackedLink, productLink, storeLink, type Storefront } from "@/lib/share-links";

const devStore: Storefront = { shop: "quickstart-65d173cf.myshopify.com", primaryDomain: null };
const liveStore: Storefront = { shop: "brand-co.myshopify.com", primaryDomain: "www.brand.com" };

const url = (result: ReturnType<typeof buildTrackedLink>) => {
  if ("error" in result) throw new Error(`expected a link, got: ${result.error}`);
  return result.url;
};

test("empty input is the home page; bare paths resolve against the store", () => {
  assert.equal(url(buildTrackedLink(devStore, "SARAHQ7X2", "")), "https://quickstart-65d173cf.myshopify.com/?ref=SARAHQ7X2");
  assert.equal(
    url(buildTrackedLink(devStore, "SARAHQ7X2", "/collections/all")),
    "https://quickstart-65d173cf.myshopify.com/collections/all?ref=SARAHQ7X2",
  );
});

test("someone else's ref is replaced, never duplicated", () => {
  const link = url(
    buildTrackedLink(devStore, "SARAHQ7X2", "https://quickstart-65d173cf.myshopify.com/products/board?ref=SOMEONEELSE&variant=1"),
  );
  assert.equal(new URL(link).searchParams.getAll("ref").join(","), "SARAHQ7X2");
  assert.equal(new URL(link).searchParams.get("variant"), "1");
});

test("off-store and non-web links are refused", () => {
  assert.match((buildTrackedLink(devStore, "X", "https://competitor.com/products/a") as { error: string }).error, /competitor\.com/);
  assert.ok("error" in buildTrackedLink(devStore, "X", "javascript:alert(1)"));
});

test("a live store's own domain is accepted — that is what creators copy", () => {
  const pasted = "https://www.brand.com/products/hoodie?variant=42";
  assert.equal(url(buildTrackedLink(liveStore, "SARAHQ7X2", pasted)), "https://www.brand.com/products/hoodie?variant=42&ref=SARAHQ7X2");

  // The bare and www forms are the same storefront.
  assert.equal(
    url(buildTrackedLink(liveStore, "SARAHQ7X2", "https://brand.com/products/hoodie")),
    "https://www.brand.com/products/hoodie?ref=SARAHQ7X2",
  );
});

test("a myshopify link for a live store is accepted and rebuilt on the brand domain", () => {
  assert.equal(
    url(buildTrackedLink(liveStore, "SARAHQ7X2", "https://brand-co.myshopify.com/collections/sale")),
    "https://www.brand.com/collections/sale?ref=SARAHQ7X2",
  );
});

test("store and product links use the brand domain once it is known", () => {
  assert.equal(storeLink(liveStore, "SARAHQ7X2"), "https://www.brand.com/?ref=SARAHQ7X2");
  assert.equal(productLink(liveStore, "SARAHQ7X2", "hoodie"), "https://www.brand.com/products/hoodie?ref=SARAHQ7X2");
  assert.equal(storeLink(devStore, "SARAHQ7X2"), "https://quickstart-65d173cf.myshopify.com/?ref=SARAHQ7X2");
});
