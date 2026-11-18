// The breadcrumb trail for a page: shown at the top of the page and also written into its structured data.
// Pages without a trail (the home page, the policies) return null.
import { TOWNS, townPath } from "./towns.js";

const HOME = { name: "Home", path: "/" };
const FIXED = {
  "/pricing": "Pricing",
  "/about": "About",
  "/our-work": "Our work",
  "/ecommerce": "Online stores",
  "/website-developers-in-durban": "Website developers in Durban",
  "/website-design-durban": "Website design in Durban",
};

export function trailFor(path) {
  if (FIXED[path]) return [HOME, { name: FIXED[path], path }];
  const t = TOWNS.find((x) => townPath(x) === path);
  if (t) return [HOME, { name: FIXED["/website-design-durban"], path: "/website-design-durban" }, { name: t.name, path }];
  return null;
}
