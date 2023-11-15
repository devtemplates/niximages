/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { type OsRelease } from "./types.js";

/* -----------------------------------------------------------------------------
 * supportedOsReleases
 * -------------------------------------------------------------------------- */

/**
 * A list of the currently supported OS releases in which we will generate
 * images from. To begin generating images for a new OS, add a new entry to this
 * list. To stop generating images for an OS, remove the entry from this list.
 */
export const supportedOsReleases: OsRelease[] = [
  {
    osName: "ubuntu",
    osVersionRange: "20.X",
    osVersionName: "focal",
    latest: false,
  },
  {
    osName: "ubuntu",
    osVersionRange: "22.X",
    osVersionName: "jammy",
    latest: true,
  },
];

/**
 * Quick access to the supported OS types. Useful while parsing tags and
 * filtering for supported OS types.
 */
export const supportedOsTypes = new Set(
  supportedOsReleases.map((release) => release.osName),
);
