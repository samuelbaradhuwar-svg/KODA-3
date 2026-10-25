// Minimal Supabase (PostgREST) client for the command centre. Server only: it uses the service role key.
// Tables have row level security with no policies, so this key is the only way in.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v) => typeof v === "string" && UUID.test(v);

export function createDb({ url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY } = {}) {
  if (!url || !key) throw new Error("not configured");
  const base = `${url.replace(/\/+$/, "")}/rest/v1`;
  async function call(method, path, body, prefer) {
    const res = await fetch(`${base}/${path}`, {
      method,
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
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
