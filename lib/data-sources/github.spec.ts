/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";

// lib
import { requireJsonFixture } from "../__test__/require-fixture.js";
import { mockServer } from "../__test__/mock-server.js";
import {
  findLatestStableVersionFromTags,
  getLatestStableVersion,
  type GithubTag,
} from "./github.js";

/* -----------------------------------------------------------------------------
 * constants
 * -------------------------------------------------------------------------- */

const githubTags = requireJsonFixture<GithubTag[]>("/github-docker-tags.json");

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe("github", () => {
  describe("findLatestStableVersionFromTags", () => {
    test("Should return the latest stable version from a list of tags", () => {
      const version = findLatestStableVersionFromTags(githubTags);

      expect(version).toEqual("27.2.1");
    });
  });

  describe("getLatestStableVersion", () => {
    test("Should return the latest stable tagged version from a repo", async () => {
      // Return one tag at a time to prove that pagination works.
      let i = 0;
      const testTags = githubTags.slice(0, 5);

      mockServer.use(
        http.get("https://api.github.com/repos/moby/moby/tags", (...args) =>
          HttpResponse.json(i < testTags.length ? [testTags[i++]] : []),
        ),
      );

      const version = await getLatestStableVersion({
        owner: "moby",
        repo: "moby",
      });

      // The 4th result is the latest stable version.
      expect(i).toEqual(4);
      expect(version).toEqual("27.2.1");
    });

    test("Should return undefined if no stable version found", async () => {
      // Return one tag at a time to prove that pagination works.
      let i = 0;
      const testTags = githubTags.slice(0, 2);

      mockServer.use(
        http.get("https://api.github.com/repos/moby/moby/tags", (...args) =>
          HttpResponse.json(i <= testTags.length ? [testTags[i++]] : []),
        ),
      );

      const version = await getLatestStableVersion({
        owner: "moby",
        repo: "moby",
      });

      // The third result should be empty
      expect(i).toEqual(3);
      expect(version).toEqual(undefined);
    });
  });
});
