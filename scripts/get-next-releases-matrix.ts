/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { getNextReleases } from "../lib/release-manager.js";

/* -----------------------------------------------------------------------------
 * get-next-releases
 * -------------------------------------------------------------------------- */

// Output the json string so that it can be consumed within our workflow
const releases = await getNextReleases();

// Convert to a simplified format that is intended to be consumed within as a
// matrix in a GitHub workflow.
const matrix = releases.map((release) => ({
  DEVCONTAINER_BASE_IMAGE_TAG: release?.image.devcontainerTag.name,
  DEVCONTAINER_DOCKER_VERSION: release?.image.dockerVersion,
  DEVCONTAINER_NIX_VERSION: release?.image.nixVersion,
  DEVCONTAINER_PACKAGE_VERSION: release?.image.packageVersion,
  DEVCONTAINER_IMAGE_VERSION: release?.image.imageVersion,
  DEVCONTAINER_IMAGE_NAME: release?.image.imageName,
  DEVCONTAINER_PLATFORMS: release?.imagePlatforms.join(","),
  DEVCONTAINER_TAGS: release?.imageTags
    .map((tag) => tag.split(":").pop())
    .join(","),
}));

console.log(JSON.stringify(matrix));
