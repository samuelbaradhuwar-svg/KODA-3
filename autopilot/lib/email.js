// Sending email through Resend. Moved out of api/audit.js so the audit and Autopilot share it.
// `from` is passed in by the caller, so each use keeps its own sender name.
export async function sendEmail({ from, to, subject, html, replyTo, bcc, scheduledAt, attachments }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "no-key" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}), ...(bcc ? { bcc } : {}), ...(scheduledAt ? { scheduled_at: scheduledAt.toISOString() } : {}), ...(attachments?.length ? { attachments } : {}) }),
  });
  return { ok: res.ok, reason: res.ok ? "" : `status-${res.status}` };
}
