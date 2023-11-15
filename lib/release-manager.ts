/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { getNixImageBuildDetails } from "./image-dependencies/niximage.js";
import { supportedOsReleases } from "./supported-os-releases.js";

/* -----------------------------------------------------------------------------
 * release manager
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
 * - gchr.io/devtemplates/niximage:latest
 * - gchr.io/devtemplates/niximage:jammy
 * - gchr.io/devtemplates/niximage:ubuntu
 * - gchr.io/devtemplates/niximage:ubuntu-22.04
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
 * 2. Get the current versions used getNixImageBuildDetails('gchr.io/devtemplates/niximage:jammy')
 * 3. Build a FutureImageDetails object.
 * 4. Compare the current image details with the future image details.
 * 5. If the versions are different, create a new image.
 * 6. Determine the new image version.
 * ---
 * 7. Get matrix of releases and tags to Github actions somehow? Or do I need to build and deploy purely from code?
 */

export const IMAGES = ["niximage", "niximage-dind"];

/**
 *
 */
export async function getAllNewImageDetails() {
  const allCurrentImageDetails = await getAllCurrentImageDetails();

  return await Promise.all(
    allCurrentImageDetails.map(
      async (currentImageDetails) =>
        await getFutureImageDetails(currentImageDetails),
    ),
  );
}

/**
 *
 */
export async function getAllCurrentImageDetails() {
  return await Promise.all(
    IMAGES.flatMap((image) =>
      supportedOsReleases.map(
        async ({ osVersionName }) =>
          await getNixImageBuildDetails(
            `ghcr.io/devtemplates/${image}:${osVersionName}`,
          ),
      ),
    ),
  );
}

/**
 *
 */
export async function getFutureImageDetails() {}

// type CurrentImageDetails = {
//   imageVersion: string;
//   packageVersion: string;
//   dockerVersion: string;
//   nixVersion: string;
//   devcontainerTag: {
//     version?: string;
//     osName?: string;
//     osVersion?: string;
//     osVersionName?: string;
//     dev?: boolean;
//   };
// };

/**
 *
 */
export function determineFutureImageVersion() {}
