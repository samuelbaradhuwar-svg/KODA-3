// Signed, expiring tokens for approval links and the like. HMAC-SHA256; the secret never leaves the server.
// A token is only valid for the `purpose` it was made for, so an approval link cannot be reused as anything else.
import { createHmac, timingSafeEqual } from "node:crypto";

export class SigningError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // malformed | bad_signature | expired | wrong_purpose | no_secret
  }
}

const mac = (secret, body) => createHmac("sha256", secret).update(body).digest();

export function sign(payload, secret, { purpose, ttlSeconds, now = Date.now() }) {
  if (!secret) throw new SigningError("no_secret");
  if (!purpose || !ttlSeconds) throw new SigningError("malformed");
  const body = Buffer.from(JSON.stringify({ ...payload, p: purpose, exp: Math.floor(now / 1000) + ttlSeconds })).toString("base64url");
  return `${body}.${mac(secret, body).toString("base64url")}`;
}

export function verify(token, secret, { purpose, now = Date.now() }) {
  if (!secret) throw new SigningError("no_secret");
  const [body, sig, extra] = String(token || "").split(".");
  if (!body || !sig || extra !== undefined) throw new SigningError("malformed");
  const given = Buffer.from(sig, "base64url");
  const want = mac(secret, body);
  if (given.length !== want.length || !timingSafeEqual(given, want)) throw new SigningError("bad_signature");
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    throw new SigningError("malformed");
  }
  if (payload.p !== purpose) throw new SigningError("wrong_purpose");
  if (!Number.isFinite(payload.exp) || payload.exp * 1000 < now) throw new SigningError("expired");
  return payload;
}

// constant-time string compare for shared secrets (for example the cron secret)
export function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? ""));
  const y = Buffer.from(String(b ?? ""));
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}
