// A stand-in for supabase.rpc() that runs against PGlite. It reads each function's real argument names and return
// shape from Postgres's catalog, the way PostgREST does, so a wrong function or argument name in store.js fails here.
export function pgliteRpc(db) {
  const cache = new Map();
  async function meta(name) {
    if (cache.has(name)) return cache.get(name);
    const { rows } = await db.query(
      `select p.proargnames, p.proretset, t.typtype from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       join pg_type t on t.oid = p.prorettype where n.nspname = 'public' and p.proname = $1`, [name]);
    if (rows.length !== 1) throw new Error(`rpc: function ${name} not found (or ambiguous)`);
    cache.set(name, rows[0]);
    return rows[0];
  }
  return async (name, args = {}) => {
    const m = await meta(name);
    const known = new Set(m.proargnames || []);
    for (const k of Object.keys(args)) if (!known.has(k)) throw new Error(`rpc: ${name} has no argument ${k}`);
    const keys = Object.keys(args);
    const params = keys.map((k) => (args[k] !== null && typeof args[k] === "object" ? JSON.stringify(args[k]) : args[k]));
    const call = `select * from public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(", ")})`;
    const { rows } = await db.query(call, params);
    if (m.proretset) return rows;
    if (m.typtype === "c") return rows[0] ?? null;
    return rows[0] ? rows[0][name] : null;
  };
}
