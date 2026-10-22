// Business-hours scheduling in South African time. Moved out of api/audit.js; Autopilot uses it for anything sent to a client.
// A report goes out half an hour after the request, and only in business hours (Mon to Fri, 08:00 to 17:00 South
// African time, which has no daylight saving). The email says it is an automatic check, so the delay is only about
// arriving at a sensible time, not about pretending anyone read the site.
export function deliveryTime(now = new Date(), delayMin = 30) {
  const SAST = 2 * 3600_000;
  let t = new Date(now.getTime() + delayMin * 60_000);
  const local = (d) => new Date(d.getTime() + SAST); // read the UTC fields of this to get SA wall-clock
  const at = (d, h, m) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m) - SAST);
  let l = local(t);
  const hour = l.getUTCHours() + l.getUTCMinutes() / 60;
  const day = l.getUTCDay(); // 0 Sun .. 6 Sat
  const weekday = day >= 1 && day <= 5;
  if (weekday && hour >= 8 && hour < 17) return t;
  if (weekday && hour < 8) return at(l, 8, 30);
  // after hours or weekend: next weekday at 08:30
  let next = new Date(l.getTime() + 86_400_000);
  while ([0, 6].includes(next.getUTCDay())) next = new Date(next.getTime() + 86_400_000);
  return at(next, 8, 30);
}
