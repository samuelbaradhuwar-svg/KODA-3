// PayFast (South African payments): ITN verification and checkout fields.
//
// STATUS: the signature rules and the four ITN security checks below follow PayFast's published integration
// requirements. PayFast's developer docs could not be loaded while this was written, so everything marked VERIFY must
// be checked against https://developers.payfast.co.za and run through the PayFast SANDBOX before any real payment:
//   - VERIFY the list of valid PayFast hosts (PAYFAST_HOSTS)
//   - VERIFY the subscription field names and values in checkoutFields()
//   - VERIFY whether empty values belong in the ITN signature string (they are included here, as PayFast's sample does)
import dns from "node:dns/promises";
import { createHash } from "node:crypto";

// VERIFY against the docs. Source IPs of ITN calls must resolve from these hosts.
export const PAYFAST_HOSTS = ["www.payfast.co.za", "w1w.payfast.co.za", "w2w.payfast.co.za", "sandbox.payfast.co.za"];

// PHP urlencode(): spaces as +, and everything except - _ . encoded (JavaScript leaves ! ' ( ) * ~ alone).
export function pfEncode(v) {
  return encodeURIComponent(String(v).trim())
    .replace(/[!'()*~]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, "+");
}

const md5 = (s) => createHash("md5").update(s).digest("hex");

function paramString(pairs, passphrase, { skipEmpty }) {
  const parts = pairs
    .filter(([k, v]) => k !== "signature" && !(skipEmpty && (v === "" || v == null)))
    .map(([k, v]) => `${k}=${pfEncode(v ?? "")}`);
  if (passphrase) parts.push(`passphrase=${pfEncode(passphrase)}`);
  return parts.join("&");
}

// ITN: every variable in the order received, signature excluded.
export const itnSignature = (pairs, passphrase) => md5(paramString(pairs, passphrase, { skipEmpty: false }));
// Checkout: documented field order, blank values left out.
export const checkoutSignature = (pairs, passphrase) => md5(paramString(pairs, passphrase, { skipEmpty: true }));

// "1499.00" -> 149900. Strict: anything else is rejected rather than guessed at.
export function toCents(amount) {
  const m = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(String(amount ?? "").trim());
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] || "").padEnd(2, "0") || 0);
}
export const centsToAmount = (c) => `${Math.floor(c / 100)}.${String(c % 100).padStart(2, "0")}`;

async function defaultResolveHosts(hosts) {
  const ips = new Set();
  await Promise.all(hosts.map((h) => dns.resolve4(h).then((a) => a.forEach((x) => ips.add(x))).catch(() => {})));
  return [...ips];
}

async function defaultConfirm(paramStr, sandbox) {
  const host = sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";
  const res = await fetch(`https://${host}/eng/query/validate`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: paramStr,
  });
  return res.ok && (await res.text()).trim() === "VALID";
}

// The four checks PayFast requires of every ITN. All four must pass before anything changes.
//   1. signature matches   2. the call comes from a PayFast host   3. the amount is what we expect
//   4. PayFast itself confirms it sent this notification
export async function verifyItn({ rawBody, remoteIp, passphrase, expectedAmountCents, skipAmount = false, sandbox = false, resolveHosts = defaultResolveHosts, confirm = defaultConfirm }) {
  const pairs = [...new URLSearchParams(String(rawBody || ""))].map(([k, v]) => [k, v]);
  const params = Object.fromEntries(pairs);
  const checks = { signature: false, source: false, amount: false, server: false };

  checks.signature = Boolean(params.signature) && itnSignature(pairs, passphrase) === params.signature;
  if (!checks.signature) return { ok: false, params, checks };

  const ips = await resolveHosts(PAYFAST_HOSTS);
  checks.source = Boolean(remoteIp) && ips.includes(remoteIp);

  const got = toCents(params.amount_gross);
  // skipAmount is only for cancellation notices, which may not carry the monthly amount (VERIFY); the other three checks still apply
  checks.amount = skipAmount || (got !== null && expectedAmountCents != null && got === Number(expectedAmountCents));

  if (checks.source && checks.amount) {
    const withoutSig = pairs.filter(([k]) => k !== "signature").map(([k, v]) => `${k}=${pfEncode(v)}`).join("&");
    checks.server = await confirm(withoutSig, sandbox).catch(() => false);
  }
  return { ok: Object.values(checks).every(Boolean), params, checks };
}

// Fields for a monthly subscription checkout form. VERIFY every subscription field against the PayFast docs and test in the sandbox.
export function checkoutFields({ merchantId, merchantKey, passphrase, amountCents, itemName, clientId, paymentId, email, returnUrl, cancelUrl, notifyUrl, billingDate }) {
  const pairs = [
    ["merchant_id", merchantId], ["merchant_key", merchantKey],
    ["return_url", returnUrl], ["cancel_url", cancelUrl], ["notify_url", notifyUrl],
    ["email_address", email],
    ["m_payment_id", paymentId],
    ["amount", centsToAmount(amountCents)],
    ["item_name", itemName],
    ["custom_str1", clientId],
    ["subscription_type", "1"],                // 1 = subscription (VERIFY)
    ["billing_date", billingDate],             // YYYY-MM-DD (VERIFY)
    ["recurring_amount", centsToAmount(amountCents)],
    ["frequency", "3"],                        // 3 = monthly (VERIFY)
    ["cycles", "0"],                           // 0 = until cancelled (VERIFY)
  ];
  return [...pairs, ["signature", checkoutSignature(pairs, passphrase)]].filter(([, v]) => v !== "" && v != null);
}
