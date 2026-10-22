// Emails to the KODA admin. An approval email shows what will be done and links to a confirmation page; the link
// itself never changes anything (mail scanners open links), a button press on that page does.
import { sign } from "./signing.js";
import { esc } from "./html.js";

export function approvalLinks({ approval, secret, baseUrl, now = Date.now() }) {
  const ttlSeconds = Math.max(60, Math.min(7 * 86400, Math.floor((new Date(approval.expires_at).getTime() - now) / 1000)));
  const mk = (d) => `${baseUrl}/api/autopilot/approval?t=${sign({ a: approval.id, h: approval.payload_hash, d }, secret, { purpose: "approval", ttlSeconds, now })}`;
  return { approve: mk("approve"), reject: mk("reject") };
}

export function createNotifier({ sendEmail, env = process.env, now = () => Date.now() }) {
  return {
    async approvalRequested({ approval, task }) {
      const to = env.APPROVAL_NOTIFY_TO || env.ADMIN_EMAIL;
      if (!to) return { ok: false, reason: "no-recipient" };
      const baseUrl = env.APP_BASE_URL || "https://www.heykoda.co.za";
      const links = approvalLinks({ approval, secret: env.APPROVAL_LINK_SECRET, baseUrl, now: now() });
      const preview = JSON.stringify(approval.preview, null, 2).slice(0, 3000);
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;line-height:1.55">
<h3>Approval needed: ${esc(task.task_type)}</h3>
<p>Here is exactly what will be done if you approve:</p>
<pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px">${esc(preview)}</pre>
<p><a href="${esc(links.approve)}"><b>Review and approve</b></a> &nbsp;|&nbsp; <a href="${esc(links.reject)}">Review and reject</a></p>
<p style="color:#666;font-size:13px">Nothing happens until you press the button on the next page. If nobody answers by ${esc(new Date(approval.expires_at).toUTCString())}, the draft lapses. You can also decide in the admin page: ${esc(baseUrl)}/admin</p></div>`;
      return sendEmail({ from: env.AUTOPILOT_FROM || "KODA Autopilot <onboarding@resend.dev>", to, subject: `Approve: ${task.task_type}`, html });
    },
  };
}
