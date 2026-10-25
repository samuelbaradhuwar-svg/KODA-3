// Google PageSpeed Insights for one device type. Free; PAGESPEED_API_KEY avoids the shared quota.
export async function pageSpeed(url, strategy = "mobile", { fetcher = fetch, timeoutMs = 50_000 } = {}) {
  const key = process.env.PAGESPEED_API_KEY ? `&key=${encodeURIComponent(process.env.PAGESPEED_API_KEY)}` : "";
  const cats = ["performance", "accessibility", "seo", "best-practices"].map((c) => `category=${c}`).join("&");
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&${cats}${key}`;
  try {
    const res = await fetcher(api, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return { strategy, error: res.status === 429 ? "Google's free speed quota is used up (add PAGESPEED_API_KEY in Vercel)" : `Google answered ${res.status}` };
    const j = await res.json();
    const c = j.lighthouseResult?.categories;
    if (!c) return { strategy, error: "Google returned no scores" };
    const a = j.lighthouseResult.audits || {};
    const pct = (x) => (typeof x?.score === "number" ? Math.round(x.score * 100) : null);
    const field = j.loadingExperience?.metrics || {};
    const fv = (k) => (field[k] ? { value: field[k].percentile, category: field[k].category } : null);
    return {
      strategy,
      scores: { speed: pct(c.performance), accessibility: pct(c.accessibility), seo: pct(c.seo), practice: pct(c["best-practices"]) },
      lcp: a["largest-contentful-paint"]?.numericValue ?? null,
      cls: a["cumulative-layout-shift"]?.numericValue ?? null,
      tbt: a["total-blocking-time"]?.numericValue ?? null,
      fcp: a["first-contentful-paint"]?.numericValue ?? null,
      bytes: a["total-byte-weight"]?.numericValue ?? null,
      field: { lcp: fv("LARGEST_CONTENTFUL_PAINT_MS"), cls: fv("CUMULATIVE_LAYOUT_SHIFT_SCORE"), inp: fv("INTERACTION_TO_NEXT_PAINT"), overall: j.loadingExperience?.overall_category || null },
      a11y: (c.accessibility?.auditRefs || []).map((r) => a[r.id]).filter((x) => x && x.score === 0).map((x) => String(x.title || "").slice(0, 120)).slice(0, 8),
      savings: ["render-blocking-resources", "unused-javascript", "unused-css-rules", "uses-optimized-images", "modern-image-formats", "uses-responsive-images", "offscreen-images"]
        .map((k) => ({ title: String(a[k]?.title || k).slice(0, 100), ms: Math.round(a[k]?.details?.overallSavingsMs || 0) }))
        .filter((x) => x.ms > 300)
        .sort((x, y) => y.ms - x.ms)
        .slice(0, 5),
    };
  } catch (e) {
    return { strategy, error: e?.name === "TimeoutError" || e?.name === "AbortError" ? "Google took too long to answer" : "Could not reach Google" };
  }
}
