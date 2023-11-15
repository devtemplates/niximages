/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { type NixImageDetails } from "../types.js";
import { getImageLabels, getImagePlatforms } from "../data-sources/skopeo.js";
import { parseDevcontainerReleaseTag } from "./devcontainer.js";

/* -----------------------------------------------------------------------------
 * niximage image-dependency
 *
 * The module contains a collection of functions and utilities for working
 * with docker to fetch niximages and the build details of the image (stored
 * as labels).
 * -------------------------------------------------------------------------- */

/**
 * Fetch the package versions for a given package name.
 */
export const getNixImageBuildDetails = async (
  imageIdentifier: string,
): Promise<NixImageDetails> => {
  const platforms = await getImagePlatforms(imageIdentifier);
  const labels = await getImageLabels(imageIdentifier, platforms[0]);

  const devcontainerTag = parseDevcontainerReleaseTag(
    labels?.["niximage.base_image_tag"],
  );

  if (devcontainerTag === undefined) {
    throw new Error("Invalid devcontainer tag found in niximage");
  }

  return {
    imageName: labels?.["niximage.image_name"],
    imageVersion: labels?.["niximage.image_version"],
    packageVersion: labels?.["niximage.package_version"],
    dockerVersion: labels?.["niximage.docker_version"],
    nixVersion: labels?.["niximage.nix_version"],
    devcontainerTag,
  };
};
