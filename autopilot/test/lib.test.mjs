import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { encrypt, decrypt, keyringFromEnv, accountContext, CryptoError } from "../lib/crypto.js";
import { sign, verify, safeEqual, SigningError } from "../lib/signing.js";
import { redact, log } from "../lib/redact.js";
import { STATES, TRANSITIONS, canTransition } from "../lib/states.js";
import { pfEncode, itnSignature, checkoutSignature, toCents, centsToAmount, verifyItn, checkoutFields } from "../lib/payfast.js";
import { deliveryTime } from "../lib/schedule.js";
import { isPrivateIp } from "../lib/net.js";
import { newDb } from "./helpers/db.mjs";

const key = () => randomBytes(32).toString("base64");
const ring = (version = 1) => keyringFromEnv({ AUTOPILOT_ENC_KEY: key(), AUTOPILOT_ENC_KEY_VERSION: String(version) });

// ------------------------------------------------------------------ crypto
test("encrypt and decrypt round trip; never stores plaintext", () => {
  const kr = ring();
  const ctx = accountContext("c1", "google", "acct-9");
  const { value } = encrypt("ya29.super-secret-token", ctx, kr);
  assert.ok(!value.includes("super-secret"));
  assert.equal(decrypt(value, ctx, kr), "ya29.super-secret-token");
  assert.notEqual(encrypt("same", ctx, kr).value, encrypt("same", ctx, kr).value, "a fresh IV each time");
});

test("a token moved to another client or provider does not decrypt", () => {
  const kr = ring();
  const { value } = encrypt("secret", accountContext("client-A", "google", "x"), kr);
  assert.throws(() => decrypt(value, accountContext("client-B", "google", "x"), kr), { code: "decrypt_failed" });
  assert.throws(() => decrypt(value, accountContext("client-A", "meta", "x"), kr), { code: "decrypt_failed" });
});

test("tampering, wrong key and bad formats are rejected without leaking anything", () => {
  const kr = ring();
  const ctx = "ctx";
  const { value } = encrypt("secret", ctx, kr);
  const parts = value.split(".");
  parts[4] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => decrypt(parts.join("."), ctx, kr), CryptoError);
  assert.throws(() => decrypt(value, ctx, ring()), { code: "decrypt_failed" });
  assert.throws(() => decrypt("garbage", ctx, kr), { code: "bad_format" });
  assert.throws(() => decrypt(value.replace(/^v1\.1/, "v1.7"), ctx, kr), { code: "unknown_key_version" });
  try { decrypt(value, "other", kr); } catch (e) { assert.ok(!e.message.includes("secret")); }
});

test("key rotation: old key still reads old data while new data uses the new key", () => {
  const oldKey = key();
  const oldRing = keyringFromEnv({ AUTOPILOT_ENC_KEY: oldKey, AUTOPILOT_ENC_KEY_VERSION: "1" });
  const stored = encrypt("secret", "ctx", oldRing).value;
  const newRing = keyringFromEnv({ AUTOPILOT_ENC_KEY: key(), AUTOPILOT_ENC_KEY_VERSION: "2", AUTOPILOT_ENC_KEY_PREV: oldKey, AUTOPILOT_ENC_KEY_PREV_VERSION: "1" });
  assert.equal(decrypt(stored, "ctx", newRing), "secret");
  const fresh = encrypt("secret", "ctx", newRing);
  assert.equal(fresh.keyVersion, 2);
  assert.ok(fresh.value.startsWith("v1.2."));
});

test("a missing or short key is an error, not a silent default", () => {
  assert.throws(() => keyringFromEnv({}), { code: "no_key" });
  assert.throws(() => keyringFromEnv({ AUTOPILOT_ENC_KEY: Buffer.from("short").toString("base64") }), { code: "bad_key_length" });
});

// ------------------------------------------------------------------ signing
test("signed links verify, expire, and only work for their purpose", () => {
  const now = Date.parse("2026-10-22T10:00:00Z");
  const t = sign({ approval: "a1", action: "approve", hash: "h" }, "secret", { purpose: "approval", ttlSeconds: 3600, now });
  assert.equal(verify(t, "secret", { purpose: "approval", now }).approval, "a1");
  assert.throws(() => verify(t, "secret", { purpose: "approval", now: now + 3601_000 }), { code: "expired" });
  assert.throws(() => verify(t, "secret", { purpose: "onboarding", now }), { code: "wrong_purpose" });
  assert.throws(() => verify(t, "other-secret", { purpose: "approval", now }), { code: "bad_signature" });
  const [body, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, "base64url")), action: "reject" })).toString("base64url");
  assert.throws(() => verify(`${forged}.${sig}`, "secret", { purpose: "approval", now }), { code: "bad_signature" });
  assert.throws(() => verify("a.b.c", "secret", { purpose: "approval", now }), SigningError);
  assert.throws(() => verify("", "secret", { purpose: "approval", now }), { code: "malformed" });
  assert.throws(() => verify(t, "", { purpose: "approval", now }), { code: "no_secret" });
});

test("safeEqual compares secrets and refuses empty ones", () => {
  assert.equal(safeEqual("abc", "abc"), true);
  assert.equal(safeEqual("abc", "abd"), false);
  assert.equal(safeEqual("abc", "abcd"), false);
  assert.equal(safeEqual("", ""), false);
  assert.equal(safeEqual(undefined, undefined), false);
});

// ------------------------------------------------------------------ redaction
test("secrets are removed from log lines", () => {
  const r = redact({
    msg: "calling with Bearer abcdefghijklmnop1234",
    api_key: "abc", ANTHROPIC_API_KEY: "sk-ant-aaaaaaaaaaaaaaaaaaaa", nested: { password: "x", ok: "fine", list: ["re_abcdefghijklmnopqrstuv"] },
    jwt: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop",
    token_ciphertext: "v1.1.AAAAAAAAAAAAAAAA.BBBBBBBBBBBBBBBBBBBB.CCCC",
    stored: "v1.1.AAAAAAAAAAAAAAAA.BBBBBBBBBBBBBBBBBBBB.CCCC",
  });
  const text = JSON.stringify(r);
  for (const leak of ["abcdefghijklmnop1234", "sk-ant-aaaa", "re_abcdefghijkl", "eyJhbGci", "BBBBBBBBBBBB", '"abc"']) assert.ok(!text.includes(leak), leak);
  assert.equal(r.nested.ok, "fine");
});

test("log() redacts before writing", () => {
  const lines = [];
  log("info", "token Bearer abcdefghijklmnop1234", { client: "c1", secret: "hunter2hunter2" }, { info: (l) => lines.push(l), log: (l) => lines.push(l) });
  assert.equal(lines.length, 1);
  assert.ok(!lines[0].includes("hunter2") && !lines[0].includes("abcdefghijklmnop1234"));
  assert.ok(lines[0].includes("c1"));
});

// ------------------------------------------------------------------ state machine parity with the database
test("the JavaScript state table is identical to the database's", async () => {
  const db = await newDb();
  const { rows } = await db.query(`select from_state, to_state from ap_task_transitions`);
  const sql = rows.map((r) => `${r.from_state}>${r.to_state}`).sort();
  assert.deepEqual(TRANSITIONS.map(([a, b]) => `${a}>${b}`).sort(), sql);
  const allowed = new Set(sql);
  for (const a of STATES) for (const b of STATES) assert.equal(canTransition(a, b), allowed.has(`${a}>${b}`));
});

// ------------------------------------------------------------------ PayFast
test("pfEncode matches PHP urlencode for the characters that differ from JavaScript", () => {
  assert.equal(pfEncode("a b"), "a+b");
  assert.equal(pfEncode("!'()*~"), "%21%27%28%29%2A%7E");
  assert.equal(pfEncode(" padded "), "padded");
  assert.equal(pfEncode("a&b=c/d@e.co.za"), "a%26b%3Dc%2Fd%40e.co.za");
  assert.equal(pfEncode("R1,499.00"), "R1%2C499.00");
});

test("money amounts are parsed strictly", () => {
  assert.equal(toCents("1499.00"), 149900);
  assert.equal(toCents("1499"), 149900);
  assert.equal(toCents("1499.5"), 149950);
  for (const bad of ["", "abc", "-5", "1,499.00", "14.999", "1e3", null, undefined, "12345678901"]) assert.equal(toCents(bad), null, String(bad));
  assert.equal(centsToAmount(149905), "1499.05");
});

function itn(over = {}, passphrase = "pass phrase") {
  const pairs = Object.entries({ m_payment_id: "c1", pf_payment_id: "123", payment_status: "COMPLETE", item_name: "KODA Presence", amount_gross: "1499.00", custom_str1: "c1", ...over });
  return { body: new URLSearchParams([...pairs, ["signature", itnSignature(pairs, passphrase)]]).toString(), passphrase };
}
const PF_IP = "197.97.145.144";
const base = { remoteIp: PF_IP, expectedAmountCents: 149900, resolveHosts: async () => [PF_IP], confirm: async () => true };

test("a genuine notification passes all four checks", async () => {
  const { body, passphrase } = itn();
  const r = await verifyItn({ ...base, rawBody: body, passphrase });
  assert.deepEqual(r.checks, { signature: true, source: true, amount: true, server: true });
  assert.equal(r.ok, true);
  assert.equal(r.params.payment_status, "COMPLETE");
});

test("each check on its own is enough to refuse", async () => {
  const good = itn();
  // tampered amount (signature no longer matches)
  const tampered = good.body.replace("1499.00", "1.00");
  assert.equal((await verifyItn({ ...base, rawBody: tampered, passphrase: good.passphrase })).checks.signature, false);
  // wrong passphrase
  assert.equal((await verifyItn({ ...base, rawBody: good.body, passphrase: "wrong" })).ok, false);
  // validly signed but from somewhere else
  assert.equal((await verifyItn({ ...base, rawBody: good.body, passphrase: good.passphrase, remoteIp: "6.6.6.6" })).ok, false);
  // validly signed, from PayFast, but the amount is not what we expect for this client
  assert.equal((await verifyItn({ ...base, rawBody: good.body, passphrase: good.passphrase, expectedAmountCents: 299900 })).checks.amount, false);
  const cheap = itn({ amount_gross: "1.00" });
  assert.equal((await verifyItn({ ...base, rawBody: cheap.body, passphrase: cheap.passphrase })).ok, false);
  // PayFast does not confirm it sent it
  assert.equal((await verifyItn({ ...base, rawBody: good.body, passphrase: good.passphrase, confirm: async () => false })).ok, false);
  assert.equal((await verifyItn({ ...base, rawBody: good.body, passphrase: good.passphrase, confirm: async () => { throw new Error("down"); } })).ok, false);
  // unsigned
  assert.equal((await verifyItn({ ...base, rawBody: "amount_gross=1499.00", passphrase: "x" })).ok, false);
  assert.equal((await verifyItn({ ...base, rawBody: "", passphrase: "x" })).ok, false);
});

test("the server confirmation is only asked once the cheaper checks pass", async () => {
  let asked = 0;
  const { body, passphrase } = itn();
  await verifyItn({ ...base, rawBody: body, passphrase, remoteIp: "6.6.6.6", confirm: async () => { asked++; return true; } });
  assert.equal(asked, 0);
});

test("checkout fields carry a signature and leave out blanks", () => {
  const f = checkoutFields({ merchantId: "1", merchantKey: "k", passphrase: "p", amountCents: 149900, itemName: "KODA Presence", clientId: "c1", paymentId: "c1", email: "a@b.co", returnUrl: "https://x/r", cancelUrl: "https://x/c", notifyUrl: "https://x/n", billingDate: "2026-11-01" });
  const m = Object.fromEntries(f);
  assert.equal(m.amount, "1499.00");
  assert.equal(m.recurring_amount, "1499.00");
  assert.equal(m.signature, checkoutSignature(f.filter(([k]) => k !== "signature"), "p"));
  assert.ok(!("custom_str2" in m));
});

// ------------------------------------------------------------------ code moved out of audit.js still behaves
test("business-hours delivery and the private address guard still work from their new home", () => {
  const t = deliveryTime(new Date("2026-10-24T10:00:00Z")); // a Saturday: next Monday 08:30 South African time
  assert.equal(t.toISOString(), "2026-10-26T06:30:00.000Z");
  assert.equal(isPrivateIp("10.0.0.1"), true);
  assert.equal(isPrivateIp("127.0.0.1"), true);
  assert.equal(isPrivateIp("169.254.169.254"), true);
  assert.equal(isPrivateIp("8.8.8.8"), false);
});
