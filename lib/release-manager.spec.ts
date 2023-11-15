/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { beforeAll, describe, test } from "vitest";
import { getLatestSupportedDevcontainers } from "./image-dependencies/devcontainer.js";
import { getLatestDockerVersionForContainer } from "./image-dependencies/docker.js";
import { getLatestNixVersion } from "./image-dependencies/nix.js";
import { mockServer } from "./__test__/mock-server.js";
import { getAllCurrentImageDetails } from "./release-manager.js";

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe("index", async () => {
  beforeAll(() => {
    // Intentionally querying live endpoints in order to get results.
    mockServer.close();
  });

  test("Should get me latest version", async () => {
    const devcontainers = await getLatestSupportedDevcontainers();
    const nixVersion = await getLatestNixVersion();

    const versions = await Promise.all(
      devcontainers.map(async (devcontainer) => ({
        tag: devcontainer.tag,
        dockerVersion: await getLatestDockerVersionForContainer(devcontainer),
        nixVersion,
      })),
    );

    console.log(versions);

    const details = await getAllCurrentImageDetails();
    console.log(details);
  });
});
