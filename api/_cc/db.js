// Minimal Supabase (PostgREST) client for the command centre. Server only: it uses the service role key.
// Tables have row level security with no policies, so this key is the only way in.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v) => typeof v === "string" && UUID.test(v);

// Supabase has two key styles: old JWT keys (service_role, anon) and newer sb_secret_ / sb_publishable_ keys.
// The new secret key must be sent in the apikey header only; the old one goes in both headers.
export function keyKind(key) {
  const k = String(key || "");
  if (/^sb_secret_/.test(k)) return "secret";
  if (/^sb_publishable_/.test(k)) return "public";
  const parts = k.split(".");
  if (parts.length === 3) {
    try {
      const role = JSON.parse(Buffer.from(parts[1], "base64url").toString()).role;
      return role === "service_role" ? "service" : role === "anon" ? "public" : "unknown";
    } catch {
      return "unknown";
    }
  }
  return "unknown";
}

export function createDb({ url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY } = {}) {
  if (!url || !key) throw new Error("not configured");
  const kind = keyKind(key);
  if (kind === "public") throw Object.assign(new Error("public key"), { code: "public_key" });
  const base = `${url.replace(/\/+$/, "")}/rest/v1`;
  async function call(method, path, body, prefer) {
    const res = await fetch(`${base}/${path}`, {
      method,
      headers: {
        apikey: key,
        ...(kind === "secret" ? {} : { authorization: `Bearer ${key}` }),
        "content-type": "application/json",
        ...(prefer ? { prefer } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`database ${method} ${path.split("?")[0]} failed (${res.status})`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  const eqId = (id) => {
    if (!isUuid(id)) throw new Error("bad id");
    return `id=eq.${id}`;
  };
  return {
    // select("cc_requests", "select=id,site_url&order=created_at.desc&limit=200")
    select: (table, query = "") => call("GET", `${table}?${query}`),
    insert: async (table, row) => (await call("POST", table, row, "return=representation"))[0],
    updateById: async (table, id, patch) => (await call("PATCH", `${table}?${eqId(id)}`, patch, "return=representation"))?.[0] || null,
    deleteById: (table, id) => call("DELETE", `${table}?${eqId(id)}`),
    // delete rows past their retention date; returns how many went
    purgeExpired: async (table, column, nowIso) => (await call("DELETE", `${table}?${column}=lt.${encodeURIComponent(nowIso)}`, undefined, "return=representation"))?.length || 0,
  };
}
