// Who may use the command centre: one email address, checked on the server for every request.
// The browser signs in with a Supabase emailed link; the server asks Supabase who owns the token it was sent, and
// accepts it only if that is the admin address and the address is confirmed. Hiding the page is not the guard.
export const adminEmail = () => (process.env.COMMAND_ADMIN_EMAIL || "hello@heykoda.co.za").trim().toLowerCase();

export async function verifyAdmin(token, { url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY } = {}) {
  if (!token || typeof token !== "string" || token.length > 4000 || !url || !key) return null;
  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/user`, {
      headers: { apikey: key, authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const user = await res.json();
    const email = String(user?.email || "").toLowerCase();
    if (!email || email !== adminEmail() || !user.email_confirmed_at) return null;
    return { email };
  } catch {
    return null;
  }
}
