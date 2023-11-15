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
  const latestNixVersion = await getLatestStableVersion({
    owner: "NixOS",
    repo: "nix",
  });

  if (latestNixVersion === undefined) {
    throw new Error("No latest Nix version found.");
  }

  return latestNixVersion;
}
