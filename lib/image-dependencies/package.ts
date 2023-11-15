/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
import { readFile } from "node:fs/promises";

/* -----------------------------------------------------------------------------
 * package image-dependency
 * -------------------------------------------------------------------------- */

/**
 * Get the package version from the package.json file.
 */
export async function getPackageVersion() {
  const packageJsonUrl = new URL(`../../package.json`, import.meta.url);
  const packageContents = await readFile(packageJsonUrl);
  const packageJson = JSON.parse(packageContents.toString());

  return packageJson.version;
}
