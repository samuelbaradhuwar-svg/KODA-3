// Test database: a real Postgres (PGlite) with stand-ins for what Supabase provides (roles, auth.jwt(), default grants),
// so the migration is exercised the way it will run, including row level security and function privileges.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../db/migrations");
export const UP = readFileSync(path.join(dir, "0001_autopilot_init.sql"), "utf8");
export const DOWN = readFileSync(path.join(dir, "0001_autopilot_init.down.sql"), "utf8");

const SUPABASE_STANDINS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.jwt() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

export async function newDb({ migrate = true } = {}) {
  const db = new PGlite();
  await db.exec(SUPABASE_STANDINS);
  if (migrate) await db.exec(UP);
  return db;
}

// Runs fn as a Supabase-style role (anon, authenticated, service_role), optionally with a signed-in email.
export async function asRole(db, role, fn, { email } = {}) {
  await db.exec(`set role ${role}`);
  if (email) await db.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify({ email })]);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role`);
    await db.query(`select set_config('request.jwt.claims', '', false)`);
  }
}

export async function mkClient(db, over = {}) {
  const c = { name: "Test Co", plan: "presence", status: "active", billing: "active", internal: false, ...over };
  const { rows } = await db.query(
    `insert into ap_clients (business_name, plan_id, status, billing_status, is_internal) values ($1,$2,$3,$4,$5) returning id`,
    [c.name, c.plan, c.status, c.billing, c.internal]
  );
  return rows[0].id;
}

export async function expectError(promise, pattern) {
  try {
    await promise;
  } catch (e) {
    if (!pattern.test(e.message)) throw new Error(`expected error matching ${pattern}, got: ${e.message}`);
    return e;
  }
  throw new Error(`expected an error matching ${pattern}, but the call succeeded`);
}
