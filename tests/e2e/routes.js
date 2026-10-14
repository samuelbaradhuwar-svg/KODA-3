// Every public route on the site. Keep in sync with PAGES in src/App.jsx and public/sitemap.xml;
// a test in a11y-seo.spec.js fails if they drift apart.
export const SITE = "https://www.heykoda.co.za";

export const ROUTES = [
  { path: "/", h1: "Your business deserves to be found." },
  { path: "/website-design-durban", h1: "Website design for Durban businesses." },
];

export const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

// Console messages and failed requests from these hosts are outside our control (embeds, analytics)
// and do not fail the build. Same-origin problems always fail.
export const THIRD_PARTY_HOSTS = [/google\.com$/, /gstatic\.com$/, /googleapis\.com$/, /doubleclick\.net$/];

export const isThirdParty = (url) => {
  try {
    const host = new URL(url).hostname;
    return THIRD_PARTY_HOSTS.some((re) => re.test(host));
  } catch {
    return false;
  }
};
