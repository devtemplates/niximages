/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { getLatestStableVersion } from "../data-sources/github.js";

/* -----------------------------------------------------------------------------
 * nix
 * -------------------------------------------------------------------------- */

/**
 * Fetch the latest version of Nix from the NixOS repository.
 */
export async function getLatestNixVersion() {
  return await getLatestStableVersion({ owner: "NixOS", repo: "nix" });
}
