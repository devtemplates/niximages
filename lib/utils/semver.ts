/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import semver from "semver";

/* -----------------------------------------------------------------------------
 * semver
 * -------------------------------------------------------------------------- */

/**
 * Parse a version name into a Semver object. If the version cannot be parsed
 * then undefined is returned.
 */
export function toSemanticVersion(version: string | undefined) {
  if (version === undefined) {
    return undefined;
  }

  const parsed = semver.minVersion(version, { loose: true });
  return parsed ?? undefined;
}
