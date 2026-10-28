// The email to the client: a plain-text draft the owner edits, turned into safe branded HTML by the server, and sent
// through Resend from hello@heykoda.co.za. The server rebuilds the HTML from the text on every preview and send, so what
// is previewed is what is sent and nothing from the browser is ever trusted as markup.
import { LOGO_PNG_BASE64 } from "./email-logo.js";
import { SIGNATURE_PNG_BASE64, SIGNATURE_ATTACHMENT, SIGNATURE_TEXT, signatureHtml } from "./email-signature.js";

export const REPLY_TO = "hello@heykoda.co.za";
export const FROM = () => process.env.COMMAND_FROM || "KODA <hello@heykoda.co.za>";
export const PUBLIC_BASE = "https://www.heykoda.co.za";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const cleanSubject = (s) => String(s ?? "").replace(/[\r\n\u0000-\u001f]+/g, " ").trim().slice(0, 150);
export const cleanBody = (s) => String(s ?? "").replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, 8000).trim();
export const validEmail = (e) => typeof e === "string" && e.length <= 200 && /^[^\s@,;<>"'?&#%]+@[^\s@,;<>"'?&#%]+\.[^\s@,;<>"'?&#%]+$/.test(e);

// A base URL for the report link: the live site, or the address the owner is on (previews, for tests to themselves).
const BASE_OK = /^https:\/\/(www\.heykoda\.co\.za|koda-3-[a-z0-9-]+-koda12\.vercel\.app)$/;
export const safeBase = (b) => (BASE_OK.test(String(b || "")) ? String(b) : PUBLIC_BASE);

export function defaultEmail({ request, report, url, expires }) {
  const c = report.counts;
  const total = c.fix_first + c.next + c.later;
  const counts = total
    ? `${c.fix_first} ${c.fix_first === 1 ? "thing" : "things"} to fix first, ${c.next} to do next and ${c.later} that can wait`
    : "nothing urgent in what we checked";
  const wins = report.wins.slice(0, 3).map((w) => `- ${w.title.replace(/\.$/, "")}`);
  const until = expires ? new Date(expires).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "";
  const lines = [
    "Hi,",
    "",
    `Thanks for asking us to take a closer look at ${report.site}. We have finished your detailed audit and put it in a private report you can read on your phone or computer:`,
    "",
    url || "(create the private link first, then this line fills in)",
    "",
    `In short, we found ${counts}.${wins.length ? " The three biggest wins:" : ""}`,
    ...(wins.length ? ["", ...wins] : []),
    "",
    "The report explains each one in plain English, what it would take to fix, and what we would recommend. It also has an honest note: we cannot promise rankings or sales, only fix what is holding the site back.",
    "",
    until ? `The link is private and works until ${until}.` : "The link is private.",
    "",
    "If you would like to talk it through, or have us fix any of it, just reply to this email.",
    "",
    "Kind regards",
  ];
  return { subject: `Your website audit for ${report.site}`, body: lines.join("\n") };
}

const link = (s) => s.replace(/https:\/\/[^\s<]+/g, (u) => {
  const trail = (u.match(/[.,;:)!?]+$/) || [""])[0];
  const clean = trail ? u.slice(0, -trail.length) : u;
  return `<a href="${clean}" style="color:#101010;text-decoration:underline">${clean}</a>${trail}`;
});

export function renderEmailHtml(body, { logoSrc = "cid:kodalogo", sigSrc = "cid:kodasig" } = {}) {
  const blocks = cleanBody(body).split(/\n{2,}/).filter(Boolean);
  const out = blocks.map((b) => {
    const lines = b.split("\n");
    if (lines.every((l) => l.startsWith("- "))) return `<ul style="margin:0 0 16px;padding-left:20px">${lines.map((l) => `<li style="margin:4px 0">${link(esc(l.slice(2)))}</li>`).join("")}</ul>`;
    if (lines.length === 1 && /^https:\/\/\S+$/.test(b)) {
      const e = esc(b);
      return `<p style="margin:0 0 6px"><a href="${e}" style="display:inline-block;background:#BDF64F;color:#101010;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:999px">View your audit report</a></p><p style="margin:0 0 16px;font-size:12px;color:#595958;word-break:break-all">${e}</p>`;
    }
    return `<p style="margin:0 0 16px">${link(esc(b)).replace(/\n/g, "<br>")}</p>`;
  });
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F6F6F4"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F6F6F4"><tr><td align="center" style="padding:28px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px"><tr><td style="padding:0 0 22px"><img src="${logoSrc}" width="134" height="40" alt="KODA" style="display:block;border:0"></td></tr><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#101010">${out.join("")}${signatureHtml(sigSrc)}</td></tr><tr><td style="padding:20px 0 0;border-top:1px solid #E8E7E5;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#595958">Durban, South Africa &middot; ${REPLY_TO}<br>You are receiving this once because you asked for a detailed website audit at heykoda.co.za. We have not added you to any mailing list. <a href="${PUBLIC_BASE}/privacy-policy" style="color:#595958">Privacy notice</a></td></tr></table></td></tr></table></body></html>`;
}

export const previewHtml = (body) => renderEmailHtml(body, { logoSrc: `data:image/png;base64,${LOGO_PNG_BASE64}`, sigSrc: `data:image/png;base64,${SIGNATURE_PNG_BASE64}` });
export const plainText = (body) => `${cleanBody(body)}\n\n${SIGNATURE_TEXT}\n\n--\nDurban, South Africa - ${REPLY_TO}\nYou are receiving this once because you asked for a detailed website audit at heykoda.co.za. We have not added you to any mailing list.`;

// Sends through Resend. Returns {ok, id, error}; the error text never contains the key.
export async function sendViaResend({ to, subject, body, bcc, idem }, { fetcher = fetch, key = process.env.RESEND_API_KEY, from = FROM() } = {}) {
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set for this environment." };
  try {
    const res = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json", ...(idem ? { "idempotency-key": idem } : {}) },
      body: JSON.stringify({
        from, to: [to], subject: cleanSubject(subject), reply_to: REPLY_TO, ...(bcc ? { bcc: [bcc] } : {}),
        html: renderEmailHtml(body), text: plainText(body),
        attachments: [{ filename: "logo.png", content: LOGO_PNG_BASE64, content_type: "image/png", content_id: "kodalogo" }, SIGNATURE_ATTACHMENT],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, id: String(j.id || "") };
    const why = String(j.message || j.name || "").replace(/re_[A-Za-z0-9_]+/g, "[key]").slice(0, 200);
    return { ok: false, error: `Resend answered ${res.status}${why ? `: ${why}` : ""}` };
  } catch (e) {
    return { ok: false, error: e?.name === "TimeoutError" ? "Resend took too long to answer." : "Could not reach Resend." };
  }
}
