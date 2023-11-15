/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Packages } from "apt-parser";
import semver, { type SemVer } from "semver";

// lib
import { type Devcontainer } from "./devcontainer.js";
import { toSemanticVersion } from "../utils/semver.js";

/* -----------------------------------------------------------------------------
 * docker
 * -------------------------------------------------------------------------- */

const MICROSOFT_PACKAGES_URL = "https://packages.microsoft.com/";
const PACKAGE_NAME = "moby-engine";

/**
 * Fetch the latest version of docker for the given osRelease.
 */
export async function getLatestDockerVersionForContainer({
  tag,
  release,
}: Devcontainer) {
  if (tag.osName === "ubuntu") {
    const packagesUrl = `${MICROSOFT_PACKAGES_URL}${[
      tag.osName,
      tag.osVersion,
      "prod",
      "dists",
      release.osVersionName,
      "main",
      "binary-amd64",
      "Packages",
    ].join("/")}`;

    const packagesRes = await fetch(packagesUrl);
    const dockerPackages = new Packages(await packagesRes.text()).filter(
      (p) => p.package === PACKAGE_NAME,
    );

    const latestVersion = dockerPackages.reduce<SemVer | undefined>(
      (latest, pkg) => {
        const pkgVersion = toSemanticVersion(pkg.version.split("-")[0]);

        return latest === undefined ||
          (pkgVersion !== undefined && semver.gt(pkgVersion, latest))
          ? pkgVersion
          : latest;
      },
      undefined,
    );

    if (latestVersion === undefined) {
      throw new Error(
        `Failed to find docker version for ${tag.osName} ${tag.osVersion}`,
      );
    }

    return latestVersion.version;
  }

  throw new Error(`Unsupported OS: ${tag.osName}`);
}
