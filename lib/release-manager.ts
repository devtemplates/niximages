/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { diff, inc } from "semver";

// lib
import {
  type Devcontainer,
  getDevcontainerPlatforms,
  getLatestSupportedDevcontainers,
} from "./image-dependencies/devcontainer.js";
import { getLatestDockerVersionForContainer } from "./image-dependencies/docker.js";
import { getLatestNixVersion } from "./image-dependencies/nix.js";
import { getNixImageBuildDetails } from "./image-dependencies/niximage.js";
import { supportedOsReleases } from "./supported-os-releases.js";
import { type NixImageDetails, type OsRelease } from "./types.js";
import { getPackageVersion } from "./image-dependencies/package.js";

/* -----------------------------------------------------------------------------
 * next release
 * -------------------------------------------------------------------------- */

export const IMAGES = ["nix-devcontainer", "nix-devcontainer-dind"];

/* -----------------------------------------------------------------------------
 * next release
 * -------------------------------------------------------------------------- */

/**
 * Generate tags for a given image. We want to generate all of the "latest" tag
 * variations for the image, as well as the explicit version tag.
 *
 * Goals: The job is not to have a matrix of every possible combination.
 * Instead, for each supported OS, we will create releases pinned to the latest
 * versions of docker, nix, and the devcontainer base.
 *
 * Versioning: Our semver will be per OS release, and we will use semver. Any
 * major version change to a dependency will trigger a major version change in
 * the image. It doesn't matter if we climb high with our version numbers as
 * dependability and automation are more important.
 *
 * Latest Tags
 * - ghcr.io/devtemplates/niximage:latest
 * - ghcr.io/devtemplates/niximage:jammy
 * - ghcr.io/devtemplates/niximage:ubuntu
 * - ghcr.io/devtemplates/niximage:ubuntu-22.04
 *
 * Version Tags
 * - ghcr.io/devtemplates/niximage:1-ubuntu-22.04
 * - ghcr.io/devtemplates/niximage:1.0-ubuntu-22.04
 * - ghcr.io/devtemplates/niximage:1.0.9-ubuntu-22.04
 */

/**
 * Flow. Releases can be triggered one of two ways.
 *
 * 1. Manually by a new version being set on the main branch.
 * 2. Daily, on a cron, an action will be run to pull all of the latest versions
 *    of the image dependencies.
 *
 * New images will be created for each image type.
 * 1. niximage
 * 2. niximage-dind
 *
 * For each image type, a new image will be create for each supported OS. The
 * list is currently manually maintained. but future iterations may attempt to
 * automate the process by using publicly available data.
 *
 * No matter what flow triggers this process, the algorithm for generating the
 * versions will be the same.
 *
 * 1. For each image type, loop through each supported OS.
 * 2. Get the current versions used getNixImageBuildDetails('ghcr.io/devtemplates/niximage:jammy')
 * 3. Build a FutureImageDetails object.
 * 4. Compare the current image details with the future image details.
 * 5. If the versions are different, create a new image.
 * 6. Determine the new image version.
 * ---
 * 7. Get matrix of releases and tags to GitHub actions somehow? Or do I need to build and deploy purely from code?
 */
export async function getNextReleases() {
  const nixVersion = await getLatestNixVersion();
  const packageVersion = await getPackageVersion();

  const latestDevcontainers = await getLatestSupportedDevcontainers();
  const latestDevcontainersByOs = latestDevcontainers.reduce<
    Record<string, Devcontainer>
  >((k, c) => Object.assign(k, { [c.release.osVersionName]: c }), {});

  const nextReleases = await Promise.all(
    IMAGES.flatMap((imageName) =>
      supportedOsReleases.map(async (release) => {
        const { osVersionName } = release;
        const cur = await getNixImageBuildDetails(
          `ghcr.io/devtemplates/${imageName}:${osVersionName}`,
        ).catch((e) => {
          // TODO: We should update this to only return if the error is for a
          // missing image. Otherwise, we should throw the error.
          return undefined;
        });

        const devcontainer = latestDevcontainersByOs[osVersionName];
        const devcontainerTag = devcontainer.tag;
        const dockerVersion =
          await getLatestDockerVersionForContainer(devcontainer);

        // Temporarily assign imageVersion to the current image version. We will
        // reassign this after computing the next version.
        const imageVersion = cur?.imageVersion ?? "0.0.1";
        const next: NixImageDetails = {
          imageName,
          imageVersion,
          packageVersion,
          dockerVersion,
          nixVersion,
          devcontainerTag,
        };

        const nextImageVersion = computeNextImageVersion({ cur, next });
        if (nextImageVersion === null) {
          throw new Error("Unable to compute next image version");
        }

        if (nextImageVersion === cur?.imageVersion) {
          return undefined;
        }

        const image = Object.assign(next, { imageVersion: nextImageVersion });
        const imageTags = getReleaseTags(image, release);
        const imagePlatforms = (
          await getDevcontainerPlatforms(devcontainer)
        ).map(({ os, architecture }) => `${os}/${architecture}`);

        return {
          image,
          imageTags,
          imagePlatforms,
        };
      }),
    ),
  );

  return nextReleases.filter((release) => release !== undefined);
}

/**
 * All available version diffs from semver provided as an object with values
 * set to an index.
 *
 * The index is used to allow us to track the "greatest" version diff between
 * when comparing an array of version diffs.
 */
export const VERSION_DIFFS = {
  none: 0,
  prerelease: 1,
  prepatch: 2,
  patch: 3,
  preminor: 4,
  minor: 5,
  premajor: 6,
  major: 7,
};

/**
 * Given a current nix image details and the projected next image details,
 * compute the image version.
 *
 * The image version is computed by processing the version diffs of each image
 * dependency and determining the greatest diff. The semver of the image will
 * then be incremented matching the greatest diff.
 */
export function computeNextImageVersion({
  cur,
  next,
}: {
  cur: NixImageDetails | undefined;
  next: NixImageDetails;
}): string | null {
  if (typeof cur === "undefined" || cur.imageVersion === "") {
    return "1.0.0";
  }

  // NOTE: If a devcontainer with no version gets passed in, it indicates there
  // is an error somewhere else in the process. Only the "latest" devcontainers
  // should be passed to this fn, and they should always have a version.
  if (
    cur.devcontainerTag.version === undefined ||
    next.devcontainerTag.version === undefined
  ) {
    throw new Error("Devcontainer tag version is missing.");
  }

  let greatestDiffIndex = 0;
  const compareVersions = (curVersion: string, nextVersion: string) => {
    const versionDiff = diff(curVersion, nextVersion) ?? "none";
    const versionDiffIndex = VERSION_DIFFS[versionDiff];

    if (versionDiffIndex > greatestDiffIndex) {
      greatestDiffIndex = versionDiffIndex;
    }
  };

  compareVersions(cur.packageVersion, next.packageVersion);
  compareVersions(cur.nixVersion, next.nixVersion);
  compareVersions(cur.devcontainerTag.version, next.devcontainerTag.version);

  if (next.imageName === "niximage-dind") {
    compareVersions(cur.dockerVersion, next.dockerVersion);
  }

  if (greatestDiffIndex === VERSION_DIFFS.none) {
    return cur.imageVersion;
  } else if (greatestDiffIndex <= VERSION_DIFFS.patch) {
    return inc(cur.imageVersion, "patch");
  } else if (greatestDiffIndex <= VERSION_DIFFS.minor) {
    return inc(cur.imageVersion, "minor");
  }

  return inc(cur.imageVersion, "major");
}

/**
 * Given nix image details and an os release, generate the appropriate tags for
 * a release.
 *
 * Latest Tags
 * - ghcr.io/devtemplates/niximage:latest
 * - ghcr.io/devtemplates/niximage:ubuntu
 * - ghcr.io/devtemplates/niximage:ubuntu-22.04
 * - ghcr.io/devtemplates/niximage:jammy
 *
 * Version Tags
 * - ghcr.io/devtemplates/niximage:1-ubuntu-22.04
 * - ghcr.io/devtemplates/niximage:1.0-ubuntu-22.04
 * - ghcr.io/devtemplates/niximage:1.0.9-ubuntu-22.04
 */
export function getReleaseTags(
  { imageName, imageVersion, devcontainerTag }: NixImageDetails,
  release: OsRelease,
): string[] {
  const { osName, osVersion } = devcontainerTag;
  const { osVersionName, latest } = release;

  const baseImage = `ghcr.io/devtemplates/${imageName}`;
  const tags: string[] = [];

  // `ghcr.io/devtemplates/niximage:latest`,
  latest && tags.push(`${baseImage}:latest`);
  // ghcr.io/devtemplates/niximage:ubuntu
  latest && tags.push(`${baseImage}:${osName}`);
  // ghcr.io/devtemplates/niximage:jammy
  tags.push(`${baseImage}:${osVersionName}`);
  // ghcr.io/devtemplates/niximage:ubuntu-22.04
  tags.push(`${baseImage}:${osName}-${osVersion}`);

  const fullVersion = imageVersion;
  const minorVersion = fullVersion.replace(/\.[^.]*$/, "");
  const majorVersion = minorVersion.replace(/\.[^.]*$/, "");

  // // ghcr.io/devtemplates/niximage:1.0.9-ubuntu-22.04
  tags.push(`${baseImage}:${fullVersion}-${osName}-${osVersion}`);
  // ghcr.io/devtemplates/niximage:1.0-ubuntu-22.04
  tags.push(`${baseImage}:${minorVersion}-${osName}-${osVersion}`);
  // ghcr.io/devtemplates/niximage:1-ubuntu-22.04
  tags.push(`${baseImage}:${majorVersion}-${osName}-${osVersion}`);

  return tags;
}
