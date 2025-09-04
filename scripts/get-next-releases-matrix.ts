/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { getNextReleases } from "../lib/release-manager.js";

/* -----------------------------------------------------------------------------
 * get-next-releases
 * -------------------------------------------------------------------------- */

const releases = await getNextReleases();
const registryPrefixes = ["ghcr.io/devtemplates/"];

console.log(
  JSON.stringify({
    /**
     * A simplified array for the releases that is intended to be consumed
     * upstream as a matrix in a GitHub workflow. Note that the matrix breaks up
     * the releases by platform because it will need to build separately for
     * each platform.
     */
    releases: releases.flatMap(
      (release) =>
        release?.imagePlatforms.map((platform) => ({
          DEVCONTAINER_BASE_IMAGE_TAG: release?.image.devcontainerTag.name,
          DEVCONTAINER_DOCKER_VERSION: release?.image.dockerVersion,
          DEVCONTAINER_NIX_VERSION: release?.image.nixVersion,
          DEVCONTAINER_PACKAGE_VERSION: release?.image.packageVersion,
          DEVCONTAINER_IMAGE_VERSION: release?.image.imageVersion,
          DEVCONTAINER_IMAGE_NAME: release?.image.imageName,
          DEVCONTAINER_PLATFORM: platform,
          DEVCONTAINER_TAGS: release?.imageTags
            .map((t) => `${t.split(":").pop()}-${platform.replace("/", "-")}`)
            .join(","),
        })),
    ),

    /**
     * An array of manifest image URIs with accompanying aliases for each
     * platform. This is required because each image is independently built on
     * optimized runners but we still want to allow users to pull from the base
     * tag and get the platform optimized image. This is used upstream as a
     * matrix in a GitHub workflow.
     */
    manifests: registryPrefixes.flatMap((registryPrefix) =>
      releases.flatMap(
        (release) =>
          release?.imageTags.map((tag) => {
            const imageUri = `${registryPrefix}${release?.image.imageName}:${tag
              .split(":")
              .pop()}`;
            const alias = release?.imagePlatforms
              .map((platform) => `${imageUri}-${platform.replace("/", "-")}`)
              .join(" ");

            return {
              DEVCONTAINER_MANIFEST_IMAGE_URI: imageUri,
              DEVCONTAINER_MANIFEST_ALIAS: alias,
            };
          }),
      ),
    ),
  }),
);
