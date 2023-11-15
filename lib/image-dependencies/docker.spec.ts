/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";

// lib
import { requireTextFixture } from "../__test__/require-fixture.js";
import { mockServer } from "../__test__/mock-server.js";
import { getLatestDockerVersionForContainer } from "./docker.js";

/* -----------------------------------------------------------------------------
 * constants
 * -------------------------------------------------------------------------- */

const packages = requireTextFixture("microsoft-packages-ubuntu-22.txt");

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe("getLatestDockerVersionForContainer", () => {
  test("Should get latest version of docker", async () => {
    mockServer.use(
      http.get(
        "https://packages.microsoft.com/ubuntu/22.04/prod/dists/jammy/main/binary-amd64/Packages",
        () => HttpResponse.text(packages),
      ),
    );

    const latestVersion = await getLatestDockerVersionForContainer({
      release: {
        osName: "ubuntu",
        osVersionRange: "22.X",
        osVersionName: "jammy",
        latest: true,
      },
      tag: {
        name: "1.1.4-ubuntu-22.04",
        version: "1.1.4",
        osName: "ubuntu",
        osVersionName: undefined,
        osVersion: "22.04",
      },
    });

    expect(latestVersion).toEqual("27.0.3");
  });
});
