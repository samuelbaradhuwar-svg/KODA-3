// Encrypts client credentials (OAuth tokens) before they are stored. AES-256-GCM, one random IV per message.
//
// Stored format:  v1.<keyVersion>.<iv>.<tag>.<ciphertext>   (base64url parts)
// The `context` (client id + provider + account id) is bound into the encryption as authenticated data, so a stored
// token copied onto a different client's row fails to decrypt instead of being used for the wrong account.
//
// Keys come from the environment and are never written to the repo or to logs:
//   AUTOPILOT_ENC_KEY          32 random bytes, base64 (generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
//   AUTOPILOT_ENC_KEY_VERSION  number, default 1
//   AUTOPILOT_ENC_KEY_PREV / AUTOPILOT_ENC_KEY_PREV_VERSION   the old key, kept while re-encrypting after a rotation
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const b64u = (buf) => Buffer.from(buf).toString("base64url");
const fromB64u = (s) => Buffer.from(s, "base64url");

export class CryptoError extends Error {
  constructor(code) {
    super(code); // never includes the plaintext, the key or the ciphertext
    this.code = code;
  }
}

function toKey(b64) {
  const key = Buffer.from(String(b64 || ""), "base64");
  if (key.length !== 32) throw new CryptoError("bad_key_length");
  return key;
}

export function keyringFromEnv(env = process.env) {
  if (!env.AUTOPILOT_ENC_KEY) throw new CryptoError("no_key");
  const current = Number(env.AUTOPILOT_ENC_KEY_VERSION || 1);
  const keys = { [current]: toKey(env.AUTOPILOT_ENC_KEY) };
  if (env.AUTOPILOT_ENC_KEY_PREV) keys[Number(env.AUTOPILOT_ENC_KEY_PREV_VERSION || current - 1)] = toKey(env.AUTOPILOT_ENC_KEY_PREV);
  return { current, keys };
}

export function encrypt(plaintext, context, keyring = keyringFromEnv()) {
  if (typeof plaintext !== "string" || !context) throw new CryptoError("bad_input");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyring.keys[keyring.current], iv);
  cipher.setAAD(Buffer.from(String(context)));
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return { value: ["v1", keyring.current, b64u(iv), b64u(cipher.getAuthTag()), b64u(ct)].join("."), keyVersion: keyring.current };
}

export function decrypt(stored, context, keyring = keyringFromEnv()) {
  const parts = String(stored || "").split(".");
  if (parts.length !== 5 || parts[0] !== "v1") throw new CryptoError("bad_format");
  const key = keyring.keys[Number(parts[1])];
  if (!key) throw new CryptoError("unknown_key_version");
  try {
    const d = createDecipheriv("aes-256-gcm", key, fromB64u(parts[2]));
    d.setAAD(Buffer.from(String(context)));
    d.setAuthTag(fromB64u(parts[3]));
    return Buffer.concat([d.update(fromB64u(parts[4])), d.final()]).toString("utf8");
  } catch {
    throw new CryptoError("decrypt_failed"); // wrong key, wrong context, or tampered data
  }
}

export const accountContext = (clientId, provider, externalAccountId) => `${clientId}|${provider}|${externalAccountId}`;
