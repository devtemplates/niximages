/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import axios, { type AxiosResponse } from "axios";
import semver from "semver";

// lib
import { toSemanticVersion } from "../utils/semver.js";
import { type DevcontainerTag, type OsRelease } from "../types.js";
import {
  supportedOsReleases,
  supportedOsTypes,
} from "../supported-os-releases.js";
import { getImagePlatforms } from "../data-sources/skopeo.js";

/* -----------------------------------------------------------------------------
 * devcontainer dependency
 *
 * The module contains a collection of functions and utilities for working
 * with devcontainer releases from Microsoft. These utilities are used to
 * keep the nix-images up to date with the latest devcontainer releases.
 *
 * Releases are listed at:
 * https://mcr.microsoft.com/v2/vscode/devcontainers/base/tags/list
 *
 * And come in the following formats:
 * - 1
 * - 1.0
 * - 1.0.5
 * - 1.0.7-ubuntu-22.04
 * - 1.0.7-ubuntu22.04
 * - dev-jammy
 * - dev-ubuntu-22.04
 * - dev-ubuntu22.04
 * - jammy
 * - ubuntu
 * - ubuntu-22.04
 * - ubuntu22.04
 * -------------------------------------------------------------------------- */

/**
 * The data returned from the Microsoft devcontainer release endpoint.
 */
export interface DevcontainerReleaseData {
  name: string;
  tags: string[];
}

/**
 * The combination of a devcontainer release and a valid tag that matches the
 * release. It is primarily used to determine the latest release for a given
 * supported release.
 */
export interface Devcontainer {
  release: OsRelease;
  tag: DevcontainerTag;
}

/* -----------------------------------------------------------------------------
 * public api
 * -------------------------------------------------------------------------- */

/**
 * Get the latest supported devcontainers by fetching the latest release data
 * from Microsoft, parsing the data, and finding the latest supported releases.
 */
export async function getLatestSupportedDevcontainers(): Promise<
  Devcontainer[]
> {
  const { data } = await fetchDevcontainerReleaseData();

  return findLatestSupportedDevcontainers(data);
}

/**
 * Fetch the latest devcontainer release data from Microsoft.
 */
export async function fetchDevcontainerReleaseData(): Promise<
  AxiosResponse<DevcontainerReleaseData>
> {
  const res = await axios.get<DevcontainerReleaseData>(
    "https://mcr.microsoft.com/v2/vscode/devcontainers/base/tags/list",
  );

  return res;
}

/**
 * Given a devcontainer, get the platforms supported by the image.
 */
export async function getDevcontainerPlatforms(devcontainer: Devcontainer) {
  return await getImagePlatforms(
    `mcr.microsoft.com/vscode/devcontainers/base:${devcontainer.tag.name}`,
  );
}

/**
 * Return an array of the latest releases for each supported os type. This is
 * useful for determining which releases we need to build.
 */
export function findLatestSupportedDevcontainers(
  data: DevcontainerReleaseData,
): Devcontainer[] {
  const tags = getDevcontainerTags(data);

  return supportedOsReleases
    .map((release) => ({ release, tag: findLatestReleaseTag(tags, release) }))
    .filter(({ tag }) => tag !== undefined) as Devcontainer[];
}

/**
 * Return an array of tags from a devcontainer release data. This method will
 * parse the tags into a structured object and remove any unknown tags.
 */
export function getDevcontainerTags(data: DevcontainerReleaseData) {
  const tags = data.tags.map(parseDevcontainerReleaseTag);
  return tags.filter((tag) => tag !== undefined) as DevcontainerTag[];
}

/**
 * Parse a release tag into a ParsedDevcontainerRelease object. The intent of
 * this method is simply to parse the release string into a structured object
 *  It does not attempt to validate or normalize the release.
 */
export function parseDevcontainerReleaseTag(
  name: string,
): DevcontainerTag | undefined {
  const match = name.match(
    /^(?<dev>dev)?-?(?<version>(\d+(\.\d+(\.\d+)?)?))?-?(?<osName>[a-zA-Z]+)?-?(?<osVersion>\d+(\.\d+)?)?$/,
  );

  if (match?.groups === undefined) {
    return undefined;
  }

  // When we match on a single name (ubuntu | jammy) we have to use some sort of
  // lookup to determine if it is an osName or a versionName
  let osName: string | undefined;
  let osVersionName: string | undefined;
  if (supportedOsTypes.has(match.groups.osName)) {
    osName = match.groups.osName;
  } else {
    osVersionName = match.groups.osName;
  }

  return {
    name,
    version: match.groups.version,
    osName,
    osVersionName,
    osVersion: match.groups.osVersion,
    dev: match.groups.dev === "dev" ? true : undefined,
  };
}

/**
 * For a given release, find the latest tag from a list of tags.
 */
export function findLatestReleaseTag(
  tags: DevcontainerTag[],
  release: OsRelease,
) {
  let latestTag: DevcontainerTag | undefined;

  tags.forEach((tag) => {
    if (tagMatchesRelease(tag, release) && isNewerTag(tag, latestTag)) {
      latestTag = tag;
    }
  });

  return latestTag;
}

/**
 * Get the supported os release for a given tag.
 */
export function getSupportedOsReleaseByTag(
  tag: DevcontainerTag,
): OsRelease | undefined {
  return supportedOsReleases.find((release) => tagMatchesRelease(tag, release));
}

/* -----------------------------------------------------------------------------
 * utils
 * -------------------------------------------------------------------------- */

function tagMatchesRelease(tag: DevcontainerTag, release: OsRelease) {
  const tagOsVersion = toSemanticVersion(tag.osVersion);

  return (
    release.osName === tag.osName &&
    tagOsVersion !== undefined &&
    semver.satisfies(tagOsVersion, release.osVersionRange)
  );
}

function isNewerTag(
  tag: DevcontainerTag,
  previousTag: DevcontainerTag | undefined,
) {
  const tagOsVersion = toSemanticVersion(tag.osVersion);
  const tagVersion = toSemanticVersion(tag.version);
  const prevTagOsVersion = toSemanticVersion(previousTag?.osVersion);
  const prevTagVersion = toSemanticVersion(previousTag?.version);

  if (prevTagOsVersion === undefined || prevTagVersion === undefined) {
    return true;
  }

  const isNewerOsVersion =
    tagOsVersion !== undefined && semver.gt(tagOsVersion, prevTagOsVersion);

  const isNewerVersion =
    tagVersion !== undefined && semver.gt(tagVersion, prevTagVersion);

  const isMoreSpecific =
    tagVersion !== undefined &&
    semver.eq(tagVersion, prevTagVersion) &&
    tagVersion.version.length > (previousTag?.version?.length ?? 0);

  return isNewerOsVersion || isNewerVersion || isMoreSpecific;
}
