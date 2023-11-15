/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { describe, expect, test } from "vitest";

// lib
import { mockServer } from "./__test__/mock-server.js";
import {
  getNextReleases,
  computeNextImageVersion,
  getReleaseTags,
} from "./release-manager.js";
import { supportedOsReleases } from "./supported-os-releases.js";
import { HttpResponse, http } from "msw";
import {
  requireJsonFixture,
  requireTextFixture,
} from "./__test__/require-fixture.js";
import { type GithubTag } from "./data-sources/github.js";
import { type DevcontainerReleaseData } from "./image-dependencies/devcontainer.js";

/* -----------------------------------------------------------------------------
 * fixtures
 * -------------------------------------------------------------------------- */

const nixTags = requireJsonFixture<GithubTag[]>("/github-nix-tags.json");

const releaseData = requireJsonFixture<DevcontainerReleaseData>(
  "devcontainer-releases.json",
);
const ubuntu20Packages = requireTextFixture("microsoft-packages-ubuntu-20.txt");
const ubuntu22Packages = requireTextFixture("microsoft-packages-ubuntu-22.txt");

mockServer.use(
  http.get("https://api.github.com/repos/NixOS/nix/tags", () =>
    HttpResponse.json(nixTags),
  ),
  http.get(
    "https://mcr.microsoft.com/v2/vscode/devcontainers/base/tags/list",
    () => HttpResponse.json(releaseData),
  ),
  http.get(
    "https://packages.microsoft.com/ubuntu/20.04/prod/dists/focal/main/binary-amd64/Packages",
    () => HttpResponse.text(ubuntu20Packages),
  ),
  http.get(
    "https://packages.microsoft.com/ubuntu/22.04/prod/dists/jammy/main/binary-amd64/Packages",
    () => HttpResponse.text(ubuntu22Packages),
  ),
);

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe("release manager", async () => {
  describe("getNextReleases", async () => {
    test("Should get me latest version", async () => {
      const newDetails = await getNextReleases();

      const ubuntu20StandaloneImage = newDetails[0];
      expect(ubuntu20StandaloneImage?.image.imageName).toEqual("niximage");
      expect(ubuntu20StandaloneImage?.imagePlatforms).toHaveLength(1);
      expect(ubuntu20StandaloneImage?.imageTags).toContain(
        "gchr.io/devtemplates/niximage:ubuntu-20.04",
      );

      const ubuntu22StandaloneImage = newDetails[1];
      expect(ubuntu22StandaloneImage?.image.imageName).toEqual("niximage");
      expect(ubuntu22StandaloneImage?.imagePlatforms).toHaveLength(2);
      expect(ubuntu22StandaloneImage?.imageTags).toContain(
        "gchr.io/devtemplates/niximage:ubuntu-22.04",
      );

      const ubuntu20DindImage = newDetails[2];
      expect(ubuntu20DindImage?.image.imageName).toEqual("niximage-dind");
      expect(ubuntu20DindImage?.imagePlatforms).toHaveLength(1);
      expect(ubuntu20DindImage?.imageTags).toContain(
        "gchr.io/devtemplates/niximage-dind:ubuntu-20.04",
      );

      const ubuntu22DindImage = newDetails[3];
      expect(ubuntu22DindImage?.image.imageName).toEqual("niximage-dind");
      expect(ubuntu22DindImage?.imagePlatforms).toHaveLength(2);
      expect(ubuntu22DindImage?.imageTags).toContain(
        "gchr.io/devtemplates/niximage-dind:ubuntu-22.04",
      );
    }, 10000);
  });

  describe("getReleaseTags", async () => {
    test("Should generate the correct release tags", async () => {
      // ubuntu 22.X NixImage and OsRelease
      const nixImage = createTestNixImage();
      const osRelease = supportedOsReleases[1];

      expect(getReleaseTags(nixImage, osRelease)).toEqual([
        "gchr.io/devtemplates/niximage:latest",
        "gchr.io/devtemplates/niximage:ubuntu",
        "gchr.io/devtemplates/niximage:jammy",
        "gchr.io/devtemplates/niximage:ubuntu-22.04",
        "gchr.io/devtemplates/niximage:0.0.1-ubuntu-22.04",
        "gchr.io/devtemplates/niximage:0.0-ubuntu-22.04",
        "gchr.io/devtemplates/niximage:0-ubuntu-22.04",
      ]);
    });
  });

  describe("computeNextImageVersion", async () => {
    test("Should not return a new version if no dependencies changed", () => {
      expect(
        computeNextImageVersion({
          cur: createTestNixImage(),
          next: createTestNixImage(),
        }),
      ).toEqual("0.0.1");
    });

    test("Should only update version for dind when docker changes", () => {
      expect(
        computeNextImageVersion({
          cur: createTestNixImage({ dockerVersion: "0.0.3" }),
          next: createTestNixImage(),
        }),
      ).toEqual("0.0.1");

      expect(
        computeNextImageVersion({
          cur: createTestNixImage({ dockerVersion: "0.0.3" }),
          next: createTestNixImage({ imageName: "niximage-dind" }),
        }),
      ).toEqual("0.0.2");
    });

    test("Should increment by patch if versions greatest change is patch", () => {
      expect(
        computeNextImageVersion({
          cur: createTestNixImage({ packageVersion: "0.0.3" }),
          next: createTestNixImage(),
        }),
      ).toEqual("0.0.2");

      expect(
        computeNextImageVersion({
          cur: createTestNixImage({ nixVersion: "0.0.3" }),
          next: createTestNixImage(),
        }),
      ).toEqual("0.0.2");
    });

    test("Should increment by minor if versions greatest change is minor", () => {
      expect(
        computeNextImageVersion({
          cur: createTestNixImage({
            nixVersion: "0.0.1",
            packageVersion: "0.1.0",
          }),
          next: createTestNixImage(),
        }),
      ).toEqual("0.1.0");
    });

    test("Should increment by minor if versions greatest change is minor", () => {
      expect(
        computeNextImageVersion({
          cur: createTestNixImage({
            nixVersion: "0.0.1",
            packageVersion: "0.1.0",
            dockerVersion: "1.0.1",
          }),
          next: createTestNixImage({ imageName: "niximage-dind" }),
        }),
      ).toEqual("1.0.0");
    });
  });
});

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

function createTestNixImage({
  imageName,
  imageVersion,
  packageVersion,
  dockerVersion,
  nixVersion,
  devcontainerVersion,
}: {
  imageName?: string;
  imageVersion?: string;
  packageVersion?: string;
  dockerVersion?: string;
  nixVersion?: string;
  devcontainerVersion?: string;
} = {}) {
  return {
    imageName: imageName ?? "niximage",
    imageVersion: imageVersion ?? "0.0.1",
    packageVersion: packageVersion ?? "0.0.1",
    dockerVersion: dockerVersion ?? "0.0.1",
    nixVersion: nixVersion ?? "0.0.1",
    devcontainerTag: {
      name: "1.2.0-ubuntu-22.04",
      version: devcontainerVersion ?? "0.0.1",
      osName: "ubuntu",
      osVersionName: undefined,
      osVersion: "22.04",
      dev: undefined,
    },
  };
}
