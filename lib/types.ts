/* -----------------------------------------------------------------------------
 * types
 * -------------------------------------------------------------------------- */

/**
 * Data representing a niximage release. This data is created and labeled on
 * every release created and is used to determine the next release version.
 */
export interface NixImageDetails {
  imageName: string;
  imageVersion: string;
  packageVersion: string;
  dockerVersion: string;
  nixVersion: string;
  devcontainerTag: DevcontainerTag;
}

/**
 * The parsed devcontainer tag extracted from the fetched release data.
 */
export interface DevcontainerTag {
  name: string;
  version?: string;
  osName?: string;
  osVersion?: string;
  osVersionName?: string;
  dev?: boolean;
}

/**
 * A representation of a devcontainer release. This differs from a tag in that
 * it captures the desired version of a release rather than the exact tagged
 * version.
 */
export interface OsRelease {
  osName: string;
  osVersionRange: string;
  osVersionName: string;
  latest: boolean;
}
