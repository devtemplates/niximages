/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Octokit } from "@octokit/rest";
import { type components } from "@octokit/openapi-types";

// lib
import { toSemanticVersion } from "../utils/semver.js";

/* -----------------------------------------------------------------------------
 * types
 * -------------------------------------------------------------------------- */

export type GithubTag = components["schemas"]["tag"];

/* -----------------------------------------------------------------------------
 * github
 * -------------------------------------------------------------------------- */

/**
 * Fetch the latest stable version of a package from the GitHub repository by
 * listing the tags and returning the first found stable release.
 */
export async function getLatestStableVersion({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  while (true) {
    const result = await octokit.rest.repos.listTags({ owner, repo });

    if (result.data.length === 0) {
      return undefined;
    }

    const latestStableVersion = findLatestStableVersionFromTags(result.data);
    if (latestStableVersion !== undefined) {
      return latestStableVersion;
    }
  }
}

/**
 * Find the latest stable version from a list of tags. This method will filter
 * out non-version tags and beta/alpha/rc tags.
 */
export function findLatestStableVersionFromTags(tags: GithubTag[]) {
  for (const tag of tags) {
    try {
      const semanticVersion = toSemanticVersion(tag.name);
      if (
        semanticVersion !== undefined &&
        semanticVersion?.prerelease.length === 0
      ) {
        return semanticVersion.version;
      }
    } catch (error) {
      continue;
    }
  }

  return undefined;
}
