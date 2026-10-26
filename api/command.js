// KODA command centre (private). All logic is in api/_cc/handler.js. See COMMAND-CENTER.md.
// One plain function file: vercel.json rewrites /api/command/<anything> to /api/command?p=<anything>, so the routing does not
// depend on how the platform treats catch-all file names.
import { createHandler } from "./_cc/handler.js";

export const config = { maxDuration: 60 };

export default createHandler();
