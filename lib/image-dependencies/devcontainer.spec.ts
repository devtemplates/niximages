/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";

// lib
import { mockServer } from "../__test__/mock-server.js";
import { requireJsonFixture } from "../__test__/require-fixture.js";
import {
  findLatestSupportedDevcontainers,
  getDevcontainerTags,
  getLatestSupportedDevcontainers,
  parseDevcontainerReleaseTag,
  type DevcontainerReleaseData,
} from "./devcontainer.js";

/* -----------------------------------------------------------------------------
 * setup
 * -------------------------------------------------------------------------- */

const releaseData = requireJsonFixture<DevcontainerReleaseData>(
  "devcontainer-releases.json",
);

mockServer.use(
  http.get(
    "https://mcr.microsoft.com/v2/vscode/devcontainers/base/tags/list",
    () => HttpResponse.json(releaseData),
  ),
);

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe("devcontainer", async () => {
  describe("getLatestSupportedDevcontainers", async () => {
    test("Should get latest supported devcontainers", async () => {
      const devcontainers = await getLatestSupportedDevcontainers();

      expect(devcontainers[0]).toEqual({
        release: {
          osName: "ubuntu",
          osVersionRange: "20.X",
          osVersionName: "focal",
          latest: false,
        },
        tag: {
          name: "1.1.4-ubuntu-20.04",
          version: "1.1.4",
          osName: "ubuntu",
          osVersionName: undefined,
          osVersion: "20.04",
        },
      });

      expect(devcontainers[1]).toEqual({
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
    });
  });

  describe("findLatestSupportedDevcontainers", () => {
    test("Should find latest devcontainers for supported os types", async () => {
      const devcontainers = findLatestSupportedDevcontainers(releaseData);

      expect(devcontainers[0]).toEqual({
        release: {
          osName: "ubuntu",
          osVersionRange: "20.X",
          osVersionName: "focal",
          latest: false,
        },
        tag: {
          name: "1.1.4-ubuntu-20.04",
          version: "1.1.4",
          osName: "ubuntu",
          osVersionName: undefined,
          osVersion: "20.04",
        },
      });

      expect(devcontainers[1]).toEqual({
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
    });
  });

  describe("getDevcontainerTags", () => {
    test("Should parse all versions", async () => {
      const tags = getDevcontainerTags(releaseData);
      expect(tags.length).toEqual(releaseData.tags.length);
    });

    test("Should support known operating systems", async () => {
      const tags = getDevcontainerTags(releaseData);

      const versionNames = new Set<string>();
      tags.forEach((tag) =>
        tag?.osVersionName !== undefined
          ? versionNames.add(tag.osVersionName)
          : undefined,
      );

      // NOTE: Leaving here as a quick and easy way to inspect the results
      // console.log(versionNames.values());
    });
  });

  describe("parseDevcontainerReleaseTag", () => {
    test("Should parse all known devcontainer release formats", async () => {
      expect(parseDevcontainerReleaseTag("1.0.7-ubuntu-22.04")).toEqual({
        name: "1.0.7-ubuntu-22.04",
        osName: "ubuntu",
        osVersionName: undefined,
        osVersion: "22.04",
        version: "1.0.7",
        dev: undefined,
      });

      expect(parseDevcontainerReleaseTag("1.0.7-ubuntu22.04")).toEqual({
        name: "1.0.7-ubuntu22.04",
        osName: "ubuntu",
        osVersionName: undefined,
        osVersion: "22.04",
        version: "1.0.7",
        dev: undefined,
      });

      expect(parseDevcontainerReleaseTag("ubuntu-22.04")).toEqual({
        name: "ubuntu-22.04",
        osName: "ubuntu",
        osVersionName: undefined,
        osVersion: "22.04",
        version: undefined,
        dev: undefined,
      });

      expect(parseDevcontainerReleaseTag("ubuntu22.04")).toEqual({
        name: "ubuntu22.04",
        osName: "ubuntu",
        osVersionName: undefined,
        osVersion: "22.04",
        version: undefined,
        dev: undefined,
      });

      expect(parseDevcontainerReleaseTag("ubuntu")).toEqual({
        name: "ubuntu",
        osName: "ubuntu",
        osVersionName: undefined,
        osVersion: undefined,
        version: undefined,
        dev: undefined,
      });

      expect(parseDevcontainerReleaseTag("jammy")).toEqual({
        name: "jammy",
        osName: undefined,
        osVersionName: "jammy",
        osVersion: undefined,
        version: undefined,
        dev: undefined,
      });

      expect(parseDevcontainerReleaseTag("dev-ubuntu22.04")).toEqual({
        name: "dev-ubuntu22.04",
        osName: "ubuntu",
        osVersionName: undefined,
        osVersion: "22.04",
        version: undefined,
        dev: true,
      });

      expect(parseDevcontainerReleaseTag("dev-ubuntu22.04")).toEqual({
        name: "dev-ubuntu22.04",
        osName: "ubuntu",
        osVersionName: undefined,
        osVersion: "22.04",
        version: undefined,
        dev: true,
      });

      expect(parseDevcontainerReleaseTag("dev-jammy")).toEqual({
        name: "dev-jammy",
        osName: undefined,
        osVersionName: "jammy",
        osVersion: undefined,
        version: undefined,
        dev: true,
      });

      expect(parseDevcontainerReleaseTag("1")).toEqual({
        name: "1",
        osName: undefined,
        osVersionName: undefined,
        osVersion: undefined,
        version: "1",
        dev: undefined,
      });

      expect(parseDevcontainerReleaseTag("1.0")).toEqual({
        name: "1.0",
        osName: undefined,
        osVersionName: undefined,
        osVersion: undefined,
        version: "1.0",
        dev: undefined,
      });

      expect(parseDevcontainerReleaseTag("1.0.5")).toEqual({
        name: "1.0.5",
        osName: undefined,
        osVersionName: undefined,
        osVersion: undefined,
        version: "1.0.5",
        dev: undefined,
      });
    });
  });
});
