// KODA command centre (private). All logic is in api/_cc/handler.js. See COMMAND-CENTER.md.
import { createHandler } from "../_cc/handler.js";

export const config = { maxDuration: 60 };

export default createHandler();
