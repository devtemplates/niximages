/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { beforeAll, describe, expect, test } from "vitest";

// lib
import { getNixImageBuildDetails } from "./niximage.js";
import { mockServer } from "../__test__/mock-server.js";

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe("fetchPackageVersions", () => {
  beforeAll(() => {
    // All tests in this file will interact with the local docker service and
    // should be ignored.
    mockServer.close();
  });

  test("Should retrieve build details from specified niximage", async () => {
    const details = await getNixImageBuildDetails(
      `ghcr.io/devtemplates/niximage:latest`,
    );

    expect(details).toEqual({
      imageName: expect.any(String),
      imageVersion: expect.any(String),
      packageVersion: expect.any(String),
      dockerVersion: expect.any(String),
      nixVersion: expect.any(String),
      devcontainerTag: {
        name: expect.any(String),
        version: expect.any(String),
        osName: expect.any(String),
        osVersionName: undefined,
        osVersion: expect.any(String),
      },
    });
  });
});
