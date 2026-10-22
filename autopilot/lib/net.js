// Fetching other people's websites safely. Moved out of api/audit.js so the free audit and Autopilot share one guard.
// Only ever fetches public web addresses (private networks, localhost and similar are refused, also after redirects),
// with a size limit and a time limit.
import dns from "node:dns/promises";
import net from "node:net";

const MAX_HTML = 1_500_000;

export function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
    );
  }
  const v = ip.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:127.") || v.startsWith("::ffff:10.") || v.startsWith("::ffff:192.168.");
}

export async function assertPublic(url) {
  const u = new URL(url);
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Only web addresses are supported");
  if (u.username || u.password) throw new Error("Addresses with a login are not supported");
  if (process.env.AUDIT_ALLOW_PRIVATE === "1") return u;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("That address is not public");
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error("That address is not public");
  return u;
}

export async function safeFetch(url, { timeout = 8000, maxBytes = MAX_HTML, accept = "text/html,*/*;q=0.5" } = {}) {
  let current = url;
  for (let hop = 0; hop < 5; hop++) {
    await assertPublic(current);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const started = Date.now();
    try {
      const res = await fetch(current, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "user-agent": "KODA-Audit/1.0 (+https://www.heykoda.co.za)", accept },
      });
      if ([301, 302, 303, 307, 308].includes(res.status) && res.headers.get("location")) {
        current = new URL(res.headers.get("location"), current).toString();
        continue;
      }
      let body = "";
      if (res.body) {
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          got += value.length;
          body += dec.decode(value, { stream: true });
          if (got > maxBytes) {
            await reader.cancel();
            break;
          }
        }
      }
      return { status: res.status, url: current, body, ms: Date.now() - started, type: res.headers.get("content-type") || "", headers: Object.fromEntries(res.headers) };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("Too many redirects");
}
