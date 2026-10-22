// Keeps secrets out of logs. Everything Autopilot logs goes through log(), which redacts first.
const SECRET_KEY = /token|secret|password|passphrase|authorization|api[-_]?key|ciphertext|cookie|signature|merchant[-_]?key|private/i;
const SECRET_TEXT = [
  [/Bearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, "Bearer [redacted]"],
  [/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, "[redacted jwt]"],      // Supabase and Google tokens
  [/\bre_[A-Za-z0-9_]{16,}/g, "[redacted resend key]"],
  [/\bsk-[A-Za-z0-9_-]{16,}/g, "[redacted api key]"],
  [/\bya29\.[A-Za-z0-9_-]{16,}/g, "[redacted google token]"],
  [/\b(?:v1)\.\d+\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]+/g, "[redacted ciphertext]"],
];

export function redact(value, depth = 0) {
  if (depth > 8) return "[too deep]";
  if (typeof value === "string") return SECRET_TEXT.reduce((s, [re, to]) => s.replace(re, to), value);
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = SECRET_KEY.test(k) ? "[redacted]" : redact(v, depth + 1);
    return out;
  }
  return value;
}

export function log(level, msg, ctx = {}, sink = console) {
  const line = JSON.stringify({ at: new Date().toISOString(), level, msg: redact(String(msg)), ...redact(ctx) });
  (sink[level] || sink.log).call(sink, line);
}
