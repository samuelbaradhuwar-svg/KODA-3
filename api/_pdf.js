// Builds the PDF report that goes with the audit email. Pure JavaScript (pdf-lib), no browser needed.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const INK = rgb(0.063, 0.063, 0.063);
const MUTED = rgb(0.35, 0.35, 0.34);
const LIME = rgb(0.74, 0.96, 0.31);
const CORAL = rgb(0.85, 0.35, 0.28);
const AMBER = rgb(0.78, 0.52, 0.05);
const GREEN = rgb(0.25, 0.55, 0.2);

// Standard PDF fonts only draw Latin-1, so anything else is swapped for a safe character.
const safe = (s) =>
  String(s ?? "")
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "").replace(/\s+/g, " ").trim();

export async function buildPdf({ lead, report }) {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595, H = 842, M = 48, CW = W - M * 2;
  let page, y;

  const newPage = () => {
    page = doc.addPage([W, H]);
    y = H - M;
    page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: LIME });
    y -= 12;
  };
  const need = (h) => { if (y - h < M + 24) newPage(); };
  const lines = (text, font, size, width) => {
    const out = [];
    let cur = "";
    for (const w of safe(text).split(" ")) {
      const t = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) > width && cur) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  };
  const para = (text, { font = reg, size = 10.5, color = INK, indent = 0, gap = 4, lh = 1.45 } = {}) => {
    for (const l of lines(text, font, size, CW - indent)) {
      need(size * lh);
      y -= size * lh;
      page.drawText(l, { x: M + indent, y, size, font, color });
    }
    y -= gap;
  };
  const heading = (text) => { need(40); y -= 14; para(text, { font: bold, size: 14, gap: 6 }); };

  newPage();
  para("KODA", { font: bold, size: 12, color: MUTED, gap: 14 });
  para("Website growth report", { font: bold, size: 24, gap: 6, lh: 1.2 });
  para(safe(lead.business) || safe(report.finalUrl), { size: 12, color: MUTED, gap: 2 });
  para(safe(report.finalUrl), { size: 10, color: MUTED, gap: 4 });
  para(`Prepared ${new Date().toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg", day: "numeric", month: "long", year: "numeric" })} by KODA's automated website check.`, { size: 9, color: MUTED, gap: 10 });

  if (report.ai?.summary) para(report.ai.summary, { size: 11.5, gap: 8 });

  if (report.scores) {
    need(60);
    const items = [["Speed on a phone", report.scores.speed], ["Easy to use", report.scores.accessibility], ["Search basics", report.scores.seo], ["Best practice", report.scores.practice]];
    const bw = (CW - 18) / 4;
    items.forEach(([label, v], i) => {
      const x = M + i * (bw + 6);
      page.drawRectangle({ x, y: y - 48, width: bw, height: 48, color: rgb(0.96, 0.96, 0.95), borderColor: rgb(0.88, 0.88, 0.87), borderWidth: 0.5 });
      page.drawText(String(v ?? "-"), { x: x + 10, y: y - 28, size: 20, font: bold, color: v == null ? MUTED : v >= 90 ? GREEN : v >= 50 ? AMBER : CORAL });
      page.drawText(label, { x: x + 10, y: y - 42, size: 8, font: reg, color: MUTED });
    });
    y -= 60;
  }

  const problems = report.checks.filter((c) => c.status === "fail" || c.status === "warn");
  heading("Problems we found, and how to fix them");
  if (!problems.length) para("None of the basic checks failed. The opportunities below are where the next gains are.", { color: MUTED });
  for (const c of problems) {
    need(60);
    para(`${c.status === "fail" ? "Fix now" : "Worth fixing"}:  ${c.label}`, { font: bold, size: 11, color: c.status === "fail" ? CORAL : AMBER, gap: 1 });
    para(`What we saw: ${c.detail}`, { size: 10, color: MUTED, gap: 1 });
    para(`How to fix it: ${c.fix}`, { size: 10, gap: 8 });
  }

  if (report.opportunities?.length) {
    heading("Where you could win more customers");
    para(`${report.stack ? `Built on ${report.stack}. ` : ""}These are not faults. They are things stronger sites do that this one does not do yet.`, { size: 10, color: MUTED, gap: 8 });
    for (const o of report.opportunities) {
      need(70);
      para(`${o.title}   (${o.area}, ${o.impact} impact)`, { font: bold, size: 11, gap: 1 });
      para(o.why, { size: 10, gap: 1 });
      para(`What we saw: ${o.evidence}`, { size: 9.5, color: MUTED, gap: 1 });
      para(`How KODA can help: ${o.service}`, { font: bold, size: 10, gap: 8 });
    }
  }

  const passed = report.checks.filter((c) => c.status === "pass");
  if (passed.length) {
    heading("What is already working");
    para(passed.map((c) => c.label).join("  |  "), { size: 10, color: GREEN, gap: 8 });
  }

  heading("Next step");
  para("This report comes from an automatic check of your home page. It does not cover your Google Business Profile, design or copy. If you would like help with any of this, reply to the email this came with or write to hello@heykoda.co.za, and we will go through it with you.", { size: 10.5 });
  para("KODA - Durban, South Africa - heykoda.co.za", { size: 9, color: MUTED });

  return Buffer.from(await doc.save());
}
