/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { getNextReleases } from "../lib/release-manager.js";

/* -----------------------------------------------------------------------------
 * get-next-releases
 * -------------------------------------------------------------------------- */

// Output the json string so that it can be consumed within our workflow
console.log(JSON.stringify(await getNextReleases()));
