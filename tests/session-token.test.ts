import { test } from "node:test";
import assert from "node:assert/strict";
import { credentialStamp, deserializeSession, serializeSession } from "@/lib/session-token";

const secret = Buffer.from("test-secret-0123456789abcdefghij");
const hash = "scrypt$c2FsdA$a2V5";
const later = Math.floor(Date.now() / 1000) + 3600;

const token = (overrides = {}) =>
  serializeSession(secret, { sub: "acct-1", exp: later, pwd: credentialStamp(secret, hash), ...overrides });

test("an authentic, unexpired token round-trips", () => {
  assert.deepEqual(deserializeSession(secret, token()), {
    sub: "acct-1",
    exp: later,
    pwd: credentialStamp(secret, hash),
  });
});

test("tampering, the wrong secret, expiry and junk all read as signed out", () => {
  const [body, signature] = token().split(".");
  const forged = Buffer.from(JSON.stringify({ sub: "acct-2", exp: later, pwd: "x" })).toString("base64url");

  assert.equal(deserializeSession(secret, `${forged}.${signature}`), null);
  assert.equal(deserializeSession(Buffer.from("another-secret"), token()), null);
  assert.equal(deserializeSession(secret, token({ exp: 1 })), null);
  assert.equal(deserializeSession(secret, `${body}.`), null);
  assert.equal(deserializeSession(secret, "not-a-token"), null);
  assert.equal(deserializeSession(secret, undefined), null);
});

test("tokens issued before credential stamps existed are refused", () => {
  const legacy = serializeSession(secret, { sub: "acct-1", exp: later } as never);
  assert.equal(deserializeSession(secret, legacy), null);
});

test("a new password produces a different stamp, so older sessions stop matching", () => {
  assert.notEqual(credentialStamp(secret, hash), credentialStamp(secret, "scrypt$bmV3$c2FsdA"));
  assert.equal(credentialStamp(secret, hash), credentialStamp(secret, hash));
});

test("the stamp reveals nothing of the hash", () => {
  assert.equal(credentialStamp(secret, hash).includes("c2FsdA"), false);
  assert.notEqual(credentialStamp(secret, hash), credentialStamp(Buffer.from("other"), hash));
});
