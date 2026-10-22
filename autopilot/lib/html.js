// Small server-rendered pages for the email approval links. No scripts, and a strict content policy.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title>
<style>body{font:16px/1.55 Arial,Helvetica,sans-serif;margin:0;background:#f4f1ea;color:#101010}main{max-width:640px;margin:0 auto;padding:28px 18px}
pre{white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid #d9d4c7;border-radius:10px;padding:14px;font-size:14px}
button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:12px 22px;cursor:pointer}.ok{background:#101010;color:#fff}.no{background:#fff;border:1px solid #101010}
.muted{color:#666;font-size:14px}form{display:inline-block;margin:6px 8px 6px 0}</style></head><body><main>${body}</main></body></html>`;
}

export function sendHtml(res, status, html) {
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-robots-tag", "noindex");
  res.setHeader("content-security-policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
  res.setHeader("referrer-policy", "no-referrer");
  res.status(status).send(html);
}
